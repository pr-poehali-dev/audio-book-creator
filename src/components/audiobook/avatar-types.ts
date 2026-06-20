export const AB_COLOR = "#06b6d4";

export interface Persona {
  name: string;
  role: string;
  personality: string;
  greeting: string;
  strengths: string[];
}
export interface FaqItem { question: string; answer: string; }

/* ─── Эмоции и мимика аватара ──────────────────────────────────────────────── */
export type Emotion = "neutral" | "smile" | "happy" | "caring";

export interface EmotionMeta {
  id: Emotion;
  label: string;
  emoji: string;
}

export const EMOTIONS: EmotionMeta[] = [
  { id: "neutral", label: "Спокойствие", emoji: "🙂" },
  { id: "smile",   label: "Приветливость", emoji: "😊" },
  { id: "happy",   label: "Радость", emoji: "😄" },
  { id: "caring",  label: "Забота", emoji: "🤝" },
];

// Карта эмоция → URL фотографии аватара (мимика)
export type ExpressionMap = Partial<Record<Emotion, string>>;

/**
 * Определяет эмоцию реплики по ключевым словам.
 * Локальный анализ — мгновенно, без обращения к бэкенду.
 */
export function detectEmotion(text: string): Emotion {
  const t = text.toLowerCase();
  if (/(поздрав|отличн|прекрасн|здорово|ура|рад|с удовольствием|замечательн|выгодн|подарок|акци|скидк|бесплатн)/.test(t)) return "happy";
  if (/(понимаю|не переживайте|не волнуйтесь|конечно помогу|давайте вместе|спокойно|поддерж|жаль|сочувств|без проблем|помогу вам)/.test(t)) return "caring";
  if (/(здравствуйте|добрый|приветствую|рада видеть|меня зовут|чем могу|приятно)/.test(t)) return "smile";
  return "neutral";
}

export interface ChatMsg { from: "client" | "avatar"; text: string; audioUrl?: string; emotion?: Emotion }
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