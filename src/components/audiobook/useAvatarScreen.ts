import { useState } from "react";
import { VOICES, AVATAR_TONES } from "@/components/audiobook/audiobook-data";
import { useAI, useSave, useTTS, useAvatarImage, SavedProject } from "@/components/audiobook/engine";
import { downloadAvatarCard } from "@/components/audiobook/avatar-export";
import { Persona, FaqItem, ChatMsg, LeadAnalysis, ExpressionMap, detectEmotion } from "@/components/audiobook/avatar-types";

export function useAvatarScreen() {
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
  const [expressions, setExpressions] = useState<ExpressionMap>({});
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
      const emotion = detectEmotion(replyText);
      let replyAudio = "";
      if (autoVoice) {
        const url = await voice(replyText, `${persona?.name || "Аватар"} — ответ`, voiceId, 1.0);
        if (url) replyAudio = url;
      }
      setChat(c => {
        const next = [...c, { from: "avatar" as const, text: replyText, audioUrl: replyAudio, emotion }];
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
    const data = { gender, appearance, industry, product, tone, voiceId, avatarUrl, avatarVariants, expressions, knowledge, persona, pitch, faq, chat };
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
        avatarVariants?: string[]; expressions?: ExpressionMap; knowledge?: string;
        persona: Persona | null; pitch: string; faq: FaqItem[]; chat?: ChatMsg[];
      };
      setGender(d.gender || "Женский");
      setAppearance(d.appearance || "");
      setIndustry(d.industry || "Недвижимость");
      setProduct(d.product || "");
      setTone(d.tone || "friendly");
      setVoiceId(d.voiceId || "alena");
      setAvatarUrl(d.avatarUrl || "");
      setAvatarVariants(d.avatarVariants || []);
      setExpressions(d.expressions || {});
      setKnowledge(d.knowledge || "");
      setPersona(d.persona || null);
      setPitch(d.pitch || "");
      setFaq(d.faq || []);
      setChat(d.chat || []);
      setProjectId(id);
      setStep("look");
    }
  };

  const handleDelete = async (id: string) => {
    if (await remove(id)) setSavedProjects(p => p.filter(x => x.id !== id));
  };

  return {
    // step
    step, setStep,
    // настройки
    gender, setGender, appearance, setAppearance, industry, setIndustry,
    product, setProduct, tone, setTone, voiceId, setVoiceId,
    avatarUrl, setAvatarUrl, avatarVariants, expressions, setExpressions, knowledge, setKnowledge,
    // контент
    persona, pitch, setPitch, faq, chat, setChat,
    // усиления
    autoVoice, setAutoVoice, speakingIdx, setSpeakingIdx, lead,
    // движок
    loading, loadingTask, generating, voicing, audioUrl, setAudioUrl,
    saving, savedAt,
    // drawer
    drawerOpen, setDrawerOpen, savedProjects, loadingProjects,
    // вычисляемое
    toneLabel, canExport,
    // ошибки
    aiError, setAiError, imgError, setImgError, ttsError, setTtsError,
    // действия
    genAvatar, genAvatarOne, genPersona, genPitch, genFaq,
    sendMessage, analyzeLead, voiceText,
    handleSave, openDrawer, handleExport, handleLoad, handleDelete,
  };
}