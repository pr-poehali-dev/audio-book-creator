export const AB_COLOR = "#06b6d4";

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
