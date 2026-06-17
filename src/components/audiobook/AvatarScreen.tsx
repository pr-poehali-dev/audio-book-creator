import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Screen, VOICES, AVATAR_TONES, AVATAR_INDUSTRIES } from "@/components/audiobook/audiobook-data";
import { useAI, useSave, useTTS, useAvatarImage, SavedProject } from "@/components/audiobook/engine";
import { SaveStatus, ErrorToast, ProjectsDrawer } from "@/components/audiobook/EngineUI";
import { AvatarLookStep } from "@/components/audiobook/AvatarLookStep";
import { AvatarScriptsStep } from "@/components/audiobook/AvatarScriptsStep";
import { AvatarChatStep } from "@/components/audiobook/AvatarChatStep";
import { downloadAvatarCard } from "@/components/audiobook/avatar-export";

interface Props { setScreen: (s: Screen) => void; }

const AB_COLOR = "#06b6d4";

export interface Persona {
  name: string;
  role: string;
  personality: string;
  greeting: string;
  strengths: string[];
}
export interface FaqItem { question: string; answer: string; }
export interface ChatMsg { from: "client" | "avatar"; text: string; audioUrl?: string }
export interface LeadAnalysis {
  score: number;
  temperature: string;
  summary: string;
  interests: string[];
  objections: string[];
  name: string;
  contact: string;
  next_step: string;
}

export function AvatarScreen({ setScreen }: Props) {
  const [step, setStep] = useState<"look" | "scripts" | "chat">("look");

  // ── Настройки аватара ─────────────────────────────────────────────────────
  const [gender, setGender] = useState<"Женский" | "Мужской">("Женский");
  const [appearance, setAppearance] = useState("");
  const [industry, setIndustry] = useState("Недвижимость");
  const [product, setProduct] = useState("");
  const [tone, setTone] = useState("friendly");
  const [voiceId, setVoiceId] = useState("alena");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarVariants, setAvatarVariants] = useState<string[]>([]);
  const [knowledge, setKnowledge] = useState("");

  // ── Сгенерированный контент ───────────────────────────────────────────────
  const [persona, setPersona] = useState<Persona | null>(null);
  const [pitch, setPitch] = useState("");
  const [faq, setFaq] = useState<FaqItem[]>([]);
  const [chat, setChat] = useState<ChatMsg[]>([]);

  // ── Усиления ──────────────────────────────────────────────────────────────
  const [autoVoice, setAutoVoice] = useState(true);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [lead, setLead] = useState<LeadAnalysis | null>(null);

  // ── Движок ────────────────────────────────────────────────────────────────
  const { generate, loading, loadingTask, error: aiError, setError: setAiError } = useAI("openai/gpt-4o-mini");
  const { generateImage, generateVariants, generating, error: imgError, setError: setImgError } = useAvatarImage();
  const { save, list, load, remove, saving, savedAt } = useSave("avatar");
  const { voice, voicing, audioUrl, setAudioUrl, error: ttsError, setError: setTtsError } = useTTS();

  const [projectId, setProjectId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const toneLabel = AVATAR_TONES.find(t => t.id === tone)?.label || "дружелюбный";

  // ── Генерация внешности (несколько вариантов) ─────────────────────────────
  const genAvatar = async () => {
    const r = await generate("avatar-image-prompt", {
      gender: gender === "Женский" ? "female" : "male",
      appearance, industry, style: toneLabel,
    });
    if (r?.text) {
      const urls = await generateVariants(r.text, 3);
      if (urls.length) {
        setAvatarVariants(urls);
        if (!avatarUrl) setAvatarUrl(urls[0]);
      }
    }
  };

  // одиночная генерация (для совместимости / докрутки)
  const genAvatarOne = async () => {
    const r = await generate("avatar-image-prompt", {
      gender: gender === "Женский" ? "female" : "male",
      appearance, industry, style: toneLabel,
    });
    if (r?.text) {
      const url = await generateImage(r.text);
      if (url) {
        setAvatarUrl(url);
        setAvatarVariants(v => [url, ...v].slice(0, 6));
      }
    }
  };

  // ── Генерация личности ────────────────────────────────────────────────────
  const genPersona = async () => {
    const r = await generate("avatar-persona", { name: persona?.name || "", product, industry, tone: toneLabel });
    if (r?.json && r.json.length) {
      const p = r.json[0] as Persona;
      setPersona(p);
    } else if (r?.text) {
      try {
        const p = JSON.parse(r.text) as Persona;
        setPersona(p);
      } catch { /* ignore */ }
    }
  };

  // ── Генерация питча ───────────────────────────────────────────────────────
  const genPitch = async (length: string) => {
    const r = await generate("avatar-pitch", {
      name: persona?.name || "Консультант", product, industry,
      tone: toneLabel, audience: "клиенты", length,
    });
    if (r?.text) setPitch(r.text);
  };

  // ── Генерация FAQ ─────────────────────────────────────────────────────────
  const genFaq = async () => {
    const r = await generate("avatar-faq", { name: persona?.name || "Консультант", product, industry, tone: toneLabel });
    if (r?.json) setFaq(r.json as FaqItem[]);
  };

  // ── Чат-симулятор ─────────────────────────────────────────────────────────
  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    const history = [...chat];
    setChat(c => [...c, { from: "client", text: message }]);
    const r = await generate("avatar-reply", {
      name: persona?.name || "Консультант", product, industry,
      personality: persona?.personality || "", tone: toneLabel, message,
      knowledge, history,
    });
    if (r?.text) {
      const replyText = r.text;
      let replyAudio = "";
      if (autoVoice) {
        const url = await voice(replyText, `${persona?.name || "Аватар"} — ответ`, voiceId, 1.0);
        if (url) replyAudio = url;
      }
      setChat(c => {
        const next = [...c, { from: "avatar" as const, text: replyText, audioUrl: replyAudio }];
        if (replyAudio) {
          const idx = next.length - 1;
          setSpeakingIdx(idx);
        }
        return next;
      });
    }
  };

  // ── Анализ лида ───────────────────────────────────────────────────────────
  const analyzeLead = async () => {
    const r = await generate("avatar-analyze", { product, history: chat });
    if (r?.obj && Object.keys(r.obj).length) setLead(r.obj as unknown as LeadAnalysis);
  };

  // ── Озвучка ───────────────────────────────────────────────────────────────
  const voiceText = async (txt: string, label: string) => {
    if (txt) await voice(txt, `${persona?.name || "Аватар"} — ${label}`, voiceId, 1.0);
  };

  // ── Сохранение / загрузка ─────────────────────────────────────────────────
  const handleSave = async () => {
    const data = { gender, appearance, industry, product, tone, voiceId, avatarUrl, avatarVariants, knowledge, persona, pitch, faq };
    const preview = (persona?.role || product || appearance).slice(0, 200);
    const id = await save(projectId, persona?.name || product || "Аватар-продавец", data, preview);
    if (id) setProjectId(id);
  };

  const openDrawer = async () => {
    setDrawerOpen(true);
    setLoadingProjects(true);
    setSavedProjects(await list());
    setLoadingProjects(false);
  };

  const canExport = Boolean(persona || pitch || faq.length);

  const handleExport = () => {
    downloadAvatarCard({
      persona, pitch, faq, avatarUrl, industry, product, toneLabel,
      voiceName: VOICES.find(v => v.id === voiceId)?.name || voiceId,
    });
  };

  const handleLoad = async (id: string) => {
    const p = await load(id);
    if (p?.data) {
      const d = p.data as {
        gender: "Женский" | "Мужской"; appearance: string; industry: string;
        product: string; tone: string; voiceId: string; avatarUrl: string;
        avatarVariants?: string[]; knowledge?: string;
        persona: Persona | null; pitch: string; faq: FaqItem[];
      };
      setGender(d.gender || "Женский");
      setAppearance(d.appearance || "");
      setIndustry(d.industry || "Недвижимость");
      setProduct(d.product || "");
      setTone(d.tone || "friendly");
      setVoiceId(d.voiceId || "alena");
      setAvatarUrl(d.avatarUrl || "");
      setAvatarVariants(d.avatarVariants || []);
      setKnowledge(d.knowledge || "");
      setPersona(d.persona || null);
      setPitch(d.pitch || "");
      setFaq(d.faq || []);
      setProjectId(id);
      setStep("look");
    }
  };

  const handleDelete = async (id: string) => {
    if (await remove(id)) setSavedProjects(p => p.filter(x => x.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => setScreen("home")}
          className="p-2 rounded-xl transition-all hover:bg-cyan-50 dark:hover:bg-cyan-950/30"
          style={{ color: "var(--ab-text-secondary)" }}>
          <Icon name="ArrowLeft" size={20} />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}>
          {avatarUrl
            ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            : <Icon name="UserRound" fallback="User" size={18} className="text-white" />}
        </div>
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--ab-text-primary)" }}>
            {persona?.name || "Новый аватар-продавец"}
          </h1>
          <div className="text-xs" style={{ color: "var(--ab-text-secondary)" }}>
            {persona?.role || industry}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={openDrawer}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={{ color: "var(--ab-text-secondary)" }}>
            <Icon name="FolderOpen" size={14} /><span className="hidden sm:inline">Мои аватары</span>
          </button>
          {canExport && (
            <button onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: `${AB_COLOR}12`, color: AB_COLOR, border: `1px solid ${AB_COLOR}30` }}>
              <Icon name="Download" size={14} /><span className="hidden sm:inline">Скачать карточку</span>
            </button>
          )}
          <SaveStatus saving={saving} savedAt={savedAt} onSave={handleSave} color={AB_COLOR} />
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {(["look", "scripts", "chat"] as const).map((s, i) => {
          const labels = ["Внешность и голос", "Скрипты продаж", "Чат-симулятор"];
          const order = ["look", "scripts", "chat"];
          const active = s === step;
          const done = order.indexOf(s) < order.indexOf(step);
          return (
            <button key={s} onClick={() => setStep(s)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
              style={active
                ? { background: "rgba(6,182,212,0.15)", color: AB_COLOR, border: "1px solid rgba(6,182,212,0.4)" }
                : done
                  ? { background: "rgba(6,182,212,0.07)", color: AB_COLOR, border: "1px solid rgba(6,182,212,0.15)" }
                  : { background: "var(--ab-card)", color: "var(--ab-text-secondary)", border: "1px solid var(--ab-border)" }}>
              {done ? <Icon name="Check" size={13} /> : <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                style={{ background: active ? AB_COLOR : "var(--ab-border)", color: active ? "#fff" : "var(--ab-text-secondary)" }}>{i + 1}</span>}
              {labels[i]}
            </button>
          );
        })}
      </div>

      {step === "look" && (
        <AvatarLookStep
          gender={gender} setGender={setGender}
          appearance={appearance} setAppearance={setAppearance}
          industry={industry} setIndustry={setIndustry}
          product={product} setProduct={setProduct}
          knowledge={knowledge} setKnowledge={setKnowledge}
          tone={tone} setTone={setTone}
          voiceId={voiceId} setVoiceId={setVoiceId}
          avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl}
          avatarVariants={avatarVariants}
          generating={generating}
          genAvatar={genAvatar}
          genAvatarOne={genAvatarOne}
          industries={AVATAR_INDUSTRIES}
          tones={AVATAR_TONES}
          voices={VOICES}
          color={AB_COLOR}
          setStep={setStep}
        />
      )}

      {step === "scripts" && (
        <AvatarScriptsStep
          persona={persona} pitch={pitch} setPitch={setPitch} faq={faq}
          loading={loading} loadingTask={loadingTask} voicing={voicing}
          audioUrl={audioUrl} setAudioUrl={setAudioUrl}
          genPersona={genPersona} genPitch={genPitch} genFaq={genFaq}
          voiceText={voiceText}
          product={product}
          color={AB_COLOR}
          setStep={setStep}
        />
      )}

      {step === "chat" && (
        <AvatarChatStep
          persona={persona} chat={chat} setChat={setChat}
          loading={loading} loadingTask={loadingTask}
          voicing={voicing} audioUrl={audioUrl} setAudioUrl={setAudioUrl}
          sendMessage={sendMessage} voiceText={voiceText}
          avatarUrl={avatarUrl}
          autoVoice={autoVoice} setAutoVoice={setAutoVoice}
          speakingIdx={speakingIdx} setSpeakingIdx={setSpeakingIdx}
          lead={lead} analyzeLead={analyzeLead}
          hasKnowledge={Boolean(knowledge.trim())}
          color={AB_COLOR}
        />
      )}

      <ErrorToast message={aiError || ttsError || imgError}
        onClose={() => { setAiError(""); setTtsError(""); setImgError(""); }} />
      <ProjectsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        projects={savedProjects}
        loading={loadingProjects}
        color={AB_COLOR}
        onLoad={handleLoad}
        onDelete={handleDelete}
      />
    </div>
  );
}