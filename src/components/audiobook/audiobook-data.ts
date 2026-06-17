export const TTS_URL = "https://functions.poehali.dev/ce35a220-1add-443c-976f-1406e37ffb0e";
export const PARSE_URL = "https://functions.poehali.dev/6eb61321-5f6e-40f3-b5ba-2e1a9fe7dfcc";
export const AI_URL = "https://functions.poehali.dev/506071b5-d529-4a0c-ac9e-0cb08f237591";
export const PROJECTS_URL = "https://functions.poehali.dev/5c7ea0e4-5ee6-49b1-832d-eeb32b0d2e12";
export const AVATAR_IMAGE_URL = "https://functions.poehali.dev/10b30453-91c3-4642-bd76-b661eb5057be";
export const SUPPORTED_EXTS = ["txt", "pdf", "epub", "docx"];

export const AI_MODELS = [
  { id: "openai/gpt-4o-mini",          name: "GPT-4o mini", desc: "Быстрая, для большинства задач" },
  { id: "openai/gpt-4o",               name: "GPT-4o",      desc: "Максимальное качество" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5",  desc: "Длинные тексты, проза" },
];

export const VOICES = [
  { id: "alena",   name: "Алёна",   gender: "Женский", style: "Нейтральный",    emoji: "👩" },
  { id: "jane",    name: "Джейн",   gender: "Женский", style: "Эмоциональный",  emoji: "👩‍🦰" },
  { id: "madirus", name: "Мадирус", gender: "Женский", style: "Спокойный",      emoji: "👩‍🦱" },
  { id: "filipp",  name: "Филипп",  gender: "Мужской", style: "Нейтральный",    emoji: "👨" },
  { id: "ermil",   name: "Ермил",   gender: "Мужской", style: "Тёплый",         emoji: "👨‍🦳" },
  { id: "zahar",   name: "Захар",   gender: "Мужской", style: "Серьёзный",      emoji: "👨‍💼" },
];

export interface ClassicBook {
  id: string;
  title: string;
  author: string;
  year: number;
  genre: string;
  emoji: string;
  excerpt: string;
}

export const CLASSICS: ClassicBook[] = [
  {
    id: "tolstoy-war-peace",
    title: "Война и мир",
    author: "Лев Толстой",
    year: 1869,
    genre: "Роман",
    emoji: "⚔️",
    excerpt: "Всё смешалось в доме Облонских. Жена узнала, что муж был в связи с бывшею в их доме французою-гувернанткой...",
  },
  {
    id: "dostoevsky-crime",
    title: "Преступление и наказание",
    author: "Фёдор Достоевский",
    year: 1866,
    genre: "Роман",
    emoji: "🪓",
    excerpt: "В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки...",
  },
  {
    id: "pushkin-evgeny",
    title: "Евгений Онегин",
    author: "Александр Пушкин",
    year: 1833,
    genre: "Роман в стихах",
    emoji: "🌹",
    excerpt: "Мой дядя самых честных правил, когда не в шутку занемог, он уважать себя заставил и лучше выдумать не мог.",
  },
  {
    id: "bulgakov-master",
    title: "Мастер и Маргарита",
    author: "Михаил Булгаков",
    year: 1967,
    genre: "Роман",
    emoji: "🐱",
    excerpt: "Однажды весною, в час небывало жаркого заката, в Москве, на Патриарших прудах, появились два гражданина.",
  },
  {
    id: "chekhov-cherry",
    title: "Вишнёвый сад",
    author: "Антон Чехов",
    year: 1904,
    genre: "Пьеса",
    emoji: "🌸",
    excerpt: "Комната, которая до сих пор называется детскою. Одна из дверей ведёт в комнату Ани.",
  },
  {
    id: "gogol-dead-souls",
    title: "Мёртвые души",
    author: "Николай Гоголь",
    year: 1842,
    genre: "Поэма",
    emoji: "🪆",
    excerpt: "В ворота гостиницы губернского города NN въехала довольно красивая рессорная небольшая бричка...",
  },
  {
    id: "turgenev-fathers",
    title: "Отцы и дети",
    author: "Иван Тургенев",
    year: 1862,
    genre: "Роман",
    emoji: "🌾",
    excerpt: "— Что, Пётр? не видать ещё? — спрашивал 20 мая 1859 года, выходя без шапки на низкое крыльцо постоялого двора...",
  },
  {
    id: "tolstoy-anna",
    title: "Анна Каренина",
    author: "Лев Толстой",
    year: 1878,
    genre: "Роман",
    emoji: "🚂",
    excerpt: "Все счастливые семьи похожи друг на друга, каждая несчастливая семья несчастлива по-своему.",
  },
  {
    id: "dostoevsky-idiot",
    title: "Идиот",
    author: "Фёдор Достоевский",
    year: 1869,
    genre: "Роман",
    emoji: "🎭",
    excerpt: "В конце ноября, в оттепель, часов в девять утра, поезд Петербургско-Варшавской дороги...",
  },
  {
    id: "lermontov-hero",
    title: "Герой нашего времени",
    author: "Михаил Лермонтов",
    year: 1840,
    genre: "Роман",
    emoji: "🏔️",
    excerpt: "Я ехал на перекладных из Тифлиса. Вся поклажа моей тележки состояла из одного небольшого чемодана...",
  },
  {
    id: "goncharov-oblomov",
    title: "Обломов",
    author: "Иван Гончаров",
    year: 1859,
    genre: "Роман",
    emoji: "🛋️",
    excerpt: "В Гороховой улице, в одном из больших домов, народонаселения которого стало бы на целый уездный город...",
  },
  {
    id: "ostrovsky-storm",
    title: "Гроза",
    author: "Александр Островский",
    year: 1859,
    genre: "Пьеса",
    emoji: "⛈️",
    excerpt: "Общественный сад на высоком берегу Волги; за Волгой сельский вид. На сцене два дерева...",
  },
  {
    id: "saltkov-gentlemen",
    title: "Господа Головлёвы",
    author: "Михаил Салтыков-Щедрин",
    year: 1880,
    genre: "Роман",
    emoji: "🏚️",
    excerpt: "Сравнительно с другими представителями головлёвской семьи, Порфирий Владимирыч Головлёв...",
  },
  {
    id: "bunin-dark-alleys",
    title: "Тёмные аллеи",
    author: "Иван Бунин",
    year: 1938,
    genre: "Рассказы",
    emoji: "🍂",
    excerpt: "В холодное осеннее ненастье, на одной из больших тульских дорог, залитой дождями...",
  },
  {
    id: "pasternak-zhivago",
    title: "Доктор Живаго",
    author: "Борис Пастернак",
    year: 1957,
    genre: "Роман",
    emoji: "❄️",
    excerpt: "Шли и шли и пели «Вечную память», и когда останавливались, казалось, что её продолжают петь ноги, лошади, дуновения ветра.",
  },
];

export const USE_CASES = [
  { icon: "GraduationCap", title: "Для студентов", desc: "Слушайте учебники и статьи на ходу" },
  { icon: "Car",           title: "За рулём",      desc: "Превращайте документы в подкасты для дороги" },
  { icon: "Eye",           title: "Для зрения",    desc: "Комфортное восприятие без нагрузки на глаза" },
  { icon: "PenLine",       title: "Для писателей", desc: "Услышьте свой текст со стороны" },
];

export type Screen =
  | "home"
  | "editor" | "generating" | "result" | "cabinet"
  | "book-writer"
  | "animation"
  | "podcast"
  | "poem"
  | "avatar";

export interface CreativeModule {
  id: Screen;
  label: string;
  icon: string;
  color: string;
  gradient: string;
  tagline: string;
  desc: string;
}

export const CREATIVE_MODULES: CreativeModule[] = [
  {
    id: "editor",
    label: "Аудиокнига",
    icon: "Headphones",
    color: "#3b82f6",
    gradient: "from-blue-500 to-indigo-600",
    tagline: "Текст → MP3",
    desc: "Загрузи файл или текст, выбери голос — получи готовую аудиокнигу за минуту",
  },
  {
    id: "book-writer",
    label: "Написать книгу",
    icon: "BookOpen",
    color: "#8b5cf6",
    gradient: "from-violet-500 to-purple-700",
    tagline: "Идея → Рукопись",
    desc: "Конструктор сюжета, персонажей и глав — пиши книгу по шагам",
  },
  {
    id: "animation",
    label: "Мультфильм",
    icon: "Clapperboard",
    color: "#f59e0b",
    gradient: "from-amber-400 to-orange-600",
    tagline: "Идея → Сценарий",
    desc: "Создай раскадровку, пропиши диалоги и сцены для мультфильма или фильма",
  },
  {
    id: "podcast",
    label: "Подкаст",
    icon: "Mic2",
    color: "#10b981",
    gradient: "from-emerald-400 to-teal-600",
    tagline: "Тема → Эпизод",
    desc: "Структура выпуска, вопросы гостю, тезисы — всё для идеального подкаста",
  },
  {
    id: "poem",
    label: "Стихи и песни",
    icon: "Music2",
    color: "#ec4899",
    gradient: "from-pink-400 to-rose-600",
    tagline: "Чувство → Текст",
    desc: "Пиши стихи, рифмуй строфы, создавай тексты песен с подсказками",
  },
  {
    id: "avatar",
    label: "Аватар-продавец",
    icon: "UserRound",
    color: "#06b6d4",
    gradient: "from-cyan-400 to-blue-600",
    tagline: "Идея → Виртуальный менеджер",
    desc: "Создай виртуального продавца: внешность, голос, скрипты продаж и ответы клиентам",
  },
];

export const AVATAR_TONES = [
  { id: "friendly",   label: "Дружелюбный",  emoji: "😊", desc: "Тёплый, располагающий" },
  { id: "expert",     label: "Эксперт",      emoji: "🎓", desc: "Уверенный профессионал" },
  { id: "energetic",  label: "Энергичный",   emoji: "⚡", desc: "Драйвовый, мотивирующий" },
  { id: "premium",    label: "Премиальный",  emoji: "💎", desc: "Сдержанный, статусный" },
  { id: "caring",     label: "Заботливый",   emoji: "🤝", desc: "Внимательный к клиенту" },
];

export const AVATAR_INDUSTRIES = [
  "Недвижимость", "Автомобили", "Бьюти и косметика", "Финансы и банки",
  "Образование", "Медицина", "Одежда и мода", "Электроника",
  "Туризм", "Рестораны", "Фитнес", "IT и софт",
];

export interface Project {
  id: string;
  title: string;
  audio_url: string;
  created_at: string;
  status: string;
  duration_sec?: number;
  is_example?: boolean;
}

export const USER_ID = "user_" + (localStorage.getItem("uid") || (() => {
  const id = Math.random().toString(36).slice(2);
  localStorage.setItem("uid", id);
  return id;
})());