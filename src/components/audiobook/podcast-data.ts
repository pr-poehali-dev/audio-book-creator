export const AB_COLOR = "#10b981";

export interface Segment { id: string; type: string; title: string; duration: string; notes: string; }
export interface Question { id: string; text: string; followUp: string; }

export interface StructureItem { type?: string; title?: string; duration?: string; notes?: string; }
export interface QuestionItem { text?: string; followUp?: string; }

export const SEGMENT_TYPES = [
  { id: "intro", label: "Интро", color: "#3b82f6", icon: "Play" },
  { id: "topic", label: "Тема", color: "#10b981", icon: "MessageSquare" },
  { id: "interview", label: "Интервью", color: "#8b5cf6", icon: "Mic" },
  { id: "story", label: "История", color: "#f59e0b", icon: "BookOpen" },
  { id: "tips", label: "Советы", color: "#ec4899", icon: "Lightbulb" },
  { id: "outro", label: "Аутро", color: "#64748b", icon: "StopCircle" },
];

export const FORMATS = [
  { id: "solo", label: "Соло", desc: "Один ведущий, монолог" },
  { id: "duo", label: "Диалог", desc: "Два ведущих" },
  { id: "interview", label: "Интервью", desc: "Ведущий + гость" },
  { id: "panel", label: "Панель", desc: "Несколько участников" },
];
