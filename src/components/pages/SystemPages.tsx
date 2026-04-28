import Icon from "@/components/ui/icon";

// ─── Page: EXPORT ─────────────────────────────────────────────────────────────
export function ExportPage() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <h2 className="font-syne text-2xl font-bold">Экспорт</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { title: "Пакетный экспорт",     desc: "Выгрузите несколько файлов в ZIP-архиве", icon: "Package", color: "purple" },
          { title: "Облачное хранилище",   desc: "Google Drive, Yandex Disk, S3", icon: "Cloud", color: "cyan" },
          { title: "API-интеграция",       desc: "Подключите к своему приложению через REST API", icon: "Code2", color: "purple" },
          { title: "Вебхук",              desc: "Автодоставка готовых файлов на ваш сервер", icon: "Webhook", color: "cyan" },
        ].map((item, i) => (
          <div key={item.title}
            className={`rounded-xl p-6 flex gap-4 cursor-pointer hover:bg-white/3 transition-all animate-fade-in stagger-${i+1}`}
            style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center ${item.color === "purple" ? "bg-purple-500/15" : "bg-cyan-400/15"}`}>
              <Icon name={item.icon} size={22} className={item.color === "purple" ? "text-purple-400" : "text-cyan-400"} />
            </div>
            <div>
              <div className="font-syne font-semibold mb-1">{item.title}</div>
              <div className="text-sm text-muted-foreground font-ibm">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="font-syne font-semibold mb-4">История экспортов</div>
        {["project_cafe_ad.mp3","audiobook_ch3.wav","podcast_intro.mp3"].map((f, i) => (
          <div key={f} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
            <Icon name="FileAudio" size={15} className="text-purple-400" />
            <span className="font-ibm text-sm flex-1">{f}</span>
            <span className="text-xs text-muted-foreground">{["сегодня 14:32","вчера 18:20","вчера 09:15"][i]}</span>
            <button className="px-3 py-1 rounded-lg text-xs font-ibm flex items-center gap-1 hover:bg-white/5 transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              <Icon name="Download" size={12} />Скачать
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page: SETTINGS ───────────────────────────────────────────────────────────
export function SettingsPage() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <h2 className="font-syne text-2xl font-bold">Настройки</h2>
      {[
        {
          title: "API-ключи", icon: "Key",
          items: [
            { label: "Google Cloud TTS",        placeholder: "AIzaSy…",  connected: true },
            { label: "Amazon Polly (AWS Key ID)",placeholder: "AKIA…",    connected: true },
            { label: "Yandex SpeechKit",         placeholder: "y0_Ag…",   connected: false },
          ]
        },
        {
          title: "Офлайн-модели", icon: "HardDrive",
          items: [
            { label: "QWEN3 — путь к модели",  placeholder: "/models/qwen3/…",   connected: false },
            { label: "XTTS v2 — путь к модели", placeholder: "/models/xtts_v2/…", connected: false },
          ]
        }
      ].map((section, si) => (
        <div key={section.title}
          className={`rounded-xl p-6 animate-fade-in stagger-${si+1}`}
          style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Icon name={section.icon} size={18} className="text-purple-400" />
            <div className="font-syne font-semibold">{section.title}</div>
          </div>
          <div className="flex flex-col gap-4">
            {section.items.map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-ibm text-muted-foreground">{item.label}</label>
                  {item.connected && (
                    <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/25 rounded px-2 py-0.5 font-ibm">Подключено</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input type="password" placeholder={item.placeholder}
                    className="flex-1 rounded-lg px-3 py-2.5 text-sm font-ibm bg-transparent focus:outline-none transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)" }} />
                  <button className="px-4 py-2.5 rounded-lg text-sm font-ibm transition-all hover:opacity-80"
                    style={{ background: "rgba(124,58,237,0.2)", color: "#c084fc", border: "1px solid rgba(124,58,237,0.3)" }}>
                    {item.connected ? "Обновить" : "Сохранить"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="rounded-xl p-6 animate-fade-in stagger-3"
        style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-2 mb-4">
          <Icon name="Sliders" size={18} className="text-cyan-400" />
          <div className="font-syne font-semibold">Общие</div>
        </div>
        <div className="flex flex-col gap-4">
          {[
            { label: "Автосохранение проектов",             on: true },
            { label: "Уведомления о завершении синтеза",    on: true },
            { label: "Офлайн-режим по умолчанию",           on: false },
            { label: "Сжатие аудио при экспорте",           on: false },
          ].map(opt => (
            <label key={opt.label} className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm font-ibm text-foreground/80 group-hover:text-foreground transition-colors">{opt.label}</span>
              <div className="w-10 h-5 rounded-full relative transition-colors"
                style={{ background: opt.on ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)" }}>
                <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                  style={{ transform: opt.on ? "translateX(20px)" : "translateX(2px)" }} />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page: PROFILE ────────────────────────────────────────────────────────────
export function ProfilePage() {
  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <h2 className="font-syne text-2xl font-bold">Профиль</h2>
      <div className="rounded-xl p-8 flex items-center gap-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-syne font-bold text-3xl text-white animate-pulse-glow shrink-0"
          style={{ background: "linear-gradient(135deg,#7c3aed,#22d3ee)" }}>
          A
        </div>
        <div>
          <div className="font-syne text-xl font-bold">Алекс Голосов</div>
          <div className="text-muted-foreground font-ibm text-sm mt-0.5">alex@voiceforge.studio</div>
          <div className="flex gap-2 mt-3">
            <span className="provider-badge bg-purple-500/15 text-purple-400 border border-purple-500/25">Pro план</span>
            <span className="provider-badge bg-green-500/15 text-green-400 border border-green-500/25">Активен</span>
          </div>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: "Использовано символов", value: "1.2М / 5М",    icon: "Type" },
          { label: "Хранилище",             value: "2.4 ГБ / 10 ГБ", icon: "Database" },
          { label: "API-запросов",          value: "847 / 10 000", icon: "Activity" },
        ].map((s, i) => (
          <div key={s.label}
            className={`rounded-xl p-5 animate-fade-in stagger-${i+1}`}
            style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Icon name={s.icon} size={18} className="text-purple-400 mb-3" />
            <div className="font-syne font-bold text-lg">{s.value}</div>
            <div className="text-xs text-muted-foreground font-ibm mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page: HELP ───────────────────────────────────────────────────────────────
export function HelpPage() {
  const articles = [
    { title: "Быстрый старт: первый синтез",      icon: "Rocket",    cat: "Начало работы" },
    { title: "Подключение Google Cloud TTS",       icon: "Globe",     cat: "Интеграции" },
    { title: "Настройка Amazon Polly",             icon: "Cloud",     cat: "Интеграции" },
    { title: "Установка XTTS v2 локально",         icon: "HardDrive", cat: "Офлайн" },
    { title: "SSML-разметка пауз и эмоций",        icon: "Code2",     cat: "Продвинуто" },
    { title: "Пакетная обработка текстов",         icon: "Layers",    cat: "Продвинуто" },
  ];
  return (
    <div className="flex flex-col gap-5 animate-fade-in" style={{ opacity: 0 }}>
      <h2 className="font-syne text-2xl font-bold">Справка</h2>
      <div className="relative">
        <Icon name="Search" size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input placeholder="Поиск по статьям…"
          className="w-full rounded-xl pl-10 pr-4 py-3 text-sm font-ibm bg-transparent focus:outline-none transition-all"
          style={{ border: "1px solid rgba(255,255,255,0.09)", background: "rgba(255,255,255,0.03)" }} />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {articles.map((a, i) => (
          <div key={a.title}
            className={`rounded-xl p-5 flex gap-4 cursor-pointer hover:bg-white/3 transition-all animate-fade-in stagger-${(i%6)+1}`}
            style={{ opacity: 0, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0">
              <Icon name={a.icon} size={18} className="text-purple-400" />
            </div>
            <div>
              <div className="font-ibm text-sm font-medium">{a.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{a.cat}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl p-6 flex items-center gap-4"
        style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.07))", border: "1px solid rgba(124,58,237,0.2)" }}>
        <Icon name="MessageCircle" size={24} className="text-purple-400 shrink-0" />
        <div>
          <div className="font-syne font-semibold">Нужна помощь?</div>
          <div className="text-sm text-muted-foreground font-ibm mt-0.5">Напишите в поддержку — ответим в течение часа</div>
        </div>
        <button className="ml-auto text-white text-sm font-ibm px-5 py-2.5 rounded-xl whitespace-nowrap"
          style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
          Написать
        </button>
      </div>
    </div>
  );
}
