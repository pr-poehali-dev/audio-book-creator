export type Page = "home" | "editor" | "projects" | "library" | "export" | "settings" | "profile" | "help";

export interface NavItem { id: Page; label: string; icon: string; }
export interface Voice { id: string; name: string; lang: string; gender: "M" | "F"; provider: string; }
export interface Project { id: string; name: string; duration: string; date: string; provider: string; status: "done" | "processing" | "draft"; }

export const NAV: NavItem[] = [
  { id: "home",     label: "Главная",    icon: "LayoutDashboard" },
  { id: "editor",   label: "Редактор",   icon: "Mic2" },
  { id: "projects", label: "Проекты",    icon: "FolderOpen" },
  { id: "library",  label: "Библиотека", icon: "Library" },
  { id: "export",   label: "Экспорт",    icon: "Download" },
  { id: "settings", label: "Настройки",  icon: "Settings2" },
  { id: "profile",  label: "Профиль",    icon: "UserCircle" },
  { id: "help",     label: "Справка",    icon: "LifeBuoy" },
];

export const PROVIDERS = [
  { id: "google",  label: "Google TTS",   color: "#4285f4", online: true },
  { id: "amazon",  label: "Amazon Polly", color: "#ff9900", online: true },
  { id: "yandex",  label: "Yandex TTS",   color: "#fc3f1d", online: true },
  { id: "qwen3",   label: "QWEN3",        color: "#a855f7", online: false },
  { id: "xtts",    label: "XTTS v2",      color: "#22d3ee", online: false },
];

export const VOICES: Voice[] = [
  { id: "wavenet-a", name: "Wavenet-A",    lang: "ru-RU", gender: "F", provider: "google" },
  { id: "wavenet-b", name: "Wavenet-B",    lang: "ru-RU", gender: "M", provider: "google" },
  { id: "tatyana",   name: "Tatyana",      lang: "ru-RU", gender: "F", provider: "amazon" },
  { id: "maxim",     name: "Maxim",        lang: "ru-RU", gender: "M", provider: "amazon" },
  { id: "alena",     name: "Алёна",        lang: "ru-RU", gender: "F", provider: "yandex" },
  { id: "ermil",     name: "Ермил",        lang: "ru-RU", gender: "M", provider: "yandex" },
  { id: "qwen-ru-f", name: "QWEN Лина",    lang: "ru-RU", gender: "F", provider: "qwen3" },
  { id: "xtts-m1",   name: "XTTS Голос 1", lang: "ru-RU", gender: "M", provider: "xtts" },
  { id: "xtts-f1",   name: "XTTS Голос 2", lang: "ru-RU", gender: "F", provider: "xtts" },
];

export const PROJECTS: Project[] = [
  { id: "1", name: "Реклама кофейни",   duration: "0:42",  date: "25 апр", provider: "yandex", status: "done" },
  { id: "2", name: "Аудиокнига гл. 3",  duration: "18:30", date: "24 апр", provider: "xtts",   status: "done" },
  { id: "3", name: "Подкаст введение",  duration: "3:15",  date: "24 апр", provider: "google", status: "processing" },
  { id: "4", name: "Обучающий ролик",   duration: "5:00",  date: "23 апр", provider: "amazon", status: "draft" },
  { id: "5", name: "IVR-меню",          duration: "1:20",  date: "22 апр", provider: "google", status: "done" },
];

export const STATS = [
  { label: "Символов сегодня", value: "12 480", icon: "Type",   color: "purple" },
  { label: "Синтезировано",    value: "47 мин",  icon: "Clock",  color: "cyan" },
  { label: "Проектов",         value: "23",      icon: "Layers", color: "purple" },
  { label: "Голосов",          value: "9",       icon: "Mic2",   color: "cyan" },
];
