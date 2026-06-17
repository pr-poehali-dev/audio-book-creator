import { AvatarLookPreview } from "@/components/audiobook/AvatarLookPreview";
import { AvatarBusinessFields } from "@/components/audiobook/AvatarBusinessFields";
import { AvatarToneVoice } from "@/components/audiobook/AvatarToneVoice";

type Step = "look" | "scripts" | "chat";

interface Tone { id: string; label: string; emoji: string; desc: string; }
interface VoiceItem { id: string; name: string; gender: string; style: string; emoji: string; }

interface Props {
  gender: "Женский" | "Мужской";
  setGender: (v: "Женский" | "Мужской") => void;
  appearance: string;
  setAppearance: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  product: string;
  setProduct: (v: string) => void;
  knowledge: string;
  setKnowledge: (v: string) => void;
  tone: string;
  setTone: (v: string) => void;
  voiceId: string;
  setVoiceId: (v: string) => void;
  avatarUrl: string;
  setAvatarUrl: (v: string) => void;
  avatarVariants: string[];
  generating: boolean;
  genAvatar: () => void;
  genAvatarOne: () => void;
  industries: string[];
  tones: Tone[];
  voices: VoiceItem[];
  color: string;
  setStep: (s: Step) => void;
}

export function AvatarLookStep({
  gender, setGender, appearance, setAppearance, industry, setIndustry,
  product, setProduct, knowledge, setKnowledge, tone, setTone, voiceId, setVoiceId,
  avatarUrl, setAvatarUrl, avatarVariants, generating, genAvatar, genAvatarOne,
  industries, tones, voices, color, setStep,
}: Props) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <AvatarLookPreview
        gender={gender} setGender={setGender}
        appearance={appearance} setAppearance={setAppearance}
        avatarUrl={avatarUrl} setAvatarUrl={setAvatarUrl}
        avatarVariants={avatarVariants}
        generating={generating}
        genAvatar={genAvatar} genAvatarOne={genAvatarOne}
        color={color}
      />

      <AvatarBusinessFields
        industry={industry} setIndustry={setIndustry}
        product={product} setProduct={setProduct}
        knowledge={knowledge} setKnowledge={setKnowledge}
        industries={industries}
        color={color}
      />

      <AvatarToneVoice
        tone={tone} setTone={setTone}
        voiceId={voiceId} setVoiceId={setVoiceId}
        gender={gender}
        tones={tones} voices={voices}
        color={color}
      />

      <button onClick={() => setStep("scripts")}
        className="w-full py-4 rounded-2xl text-white font-bold text-base transition-all hover:opacity-90"
        style={{ background: "linear-gradient(135deg,#06b6d4,#2563eb)" }}>
        Далее — Скрипты продаж →
      </button>
    </div>
  );
}
