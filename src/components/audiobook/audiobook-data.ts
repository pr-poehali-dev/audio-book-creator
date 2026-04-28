export const TTS_URL = "https://functions.poehali.dev/ce35a220-1add-443c-976f-1406e37ffb0e";
export const PARSE_URL = "https://functions.poehali.dev/6eb61321-5f6e-40f3-b5ba-2e1a9fe7dfcc";
export const SUPPORTED_EXTS = ["txt", "pdf", "epub", "docx"];

export const VOICES = [
  { id: "alena",   name: "Алёна",   gender: "Женский", style: "Нейтральный",    emoji: "👩" },
  { id: "jane",    name: "Джейн",   gender: "Женский", style: "Эмоциональный",  emoji: "👩‍🦰" },
  { id: "madirus", name: "Мадирус", gender: "Женский", style: "Спокойный",      emoji: "👩‍🦱" },
  { id: "filipp",  name: "Филипп",  gender: "Мужской", style: "Нейтральный",    emoji: "👨" },
  { id: "ermil",   name: "Ермил",   gender: "Мужской", style: "Тёплый",         emoji: "👨‍🦳" },
  { id: "zahar",   name: "Захар",   gender: "Мужской", style: "Серьёзный",      emoji: "👨‍💼" },
];

export const USE_CASES = [
  { icon: "GraduationCap", title: "Для студентов", desc: "Слушайте учебники и статьи на ходу" },
  { icon: "Car",           title: "За рулём",      desc: "Превращайте документы в подкасты для дороги" },
  { icon: "Eye",           title: "Для зрения",    desc: "Комфортное восприятие без нагрузки на глаза" },
  { icon: "PenLine",       title: "Для писателей", desc: "Услышьте свой текст со стороны" },
];

export type Screen = "home" | "editor" | "generating" | "result" | "cabinet";

export interface Project {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
  status: string;
  duration_sec?: number;
}

export const USER_ID = "user_" + (localStorage.getItem("uid") || (() => {
  const id = Math.random().toString(36).slice(2);
  localStorage.setItem("uid", id);
  return id;
})());
