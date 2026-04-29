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