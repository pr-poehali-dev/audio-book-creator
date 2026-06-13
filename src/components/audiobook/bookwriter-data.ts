export const AB_COLOR = "#8b5cf6";

export interface OutlineItem { title: string; summary: string; }
export interface IdeaItem { title: string; premise: string; }
export interface Character { id: string; name: string; role: string; trait: string; }
export interface Chapter { id: string; title: string; summary: string; wordCount: number; }

export const GENRES = ["Роман", "Фантастика", "Детектив", "Сказка", "Исторический", "Приключения", "Ужасы", "Романтика"];

export const TEMPLATES = [
  {
    id: "hero",
    title: "Путь героя",
    desc: "Классическая структура: герой, вызов, испытания, победа",
    chapters: ["Обычный мир", "Зов приключений", "Пересечение порога", "Испытания и союзники", "Главное испытание", "Награда", "Возвращение домой"],
  },
  {
    id: "mystery",
    title: "Детектив",
    desc: "Тайна, расследование, разгадка",
    chapters: ["Преступление", "Первые улики", "Подозреваемые", "Ложный след", "Поворот", "Разоблачение", "Развязка"],
  },
  {
    id: "romance",
    title: "Любовный роман",
    desc: "Встреча, чувства, конфликт, воссоединение",
    chapters: ["Встреча", "Притяжение", "Первые чувства", "Препятствие", "Разлука", "Осознание", "Счастливый финал"],
  },
  {
    id: "custom",
    title: "Своя структура",
    desc: "Создай главы самостоятельно",
    chapters: [],
  },
];
