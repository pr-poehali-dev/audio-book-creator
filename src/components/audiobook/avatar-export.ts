import { Persona, FaqItem } from "@/components/audiobook/AvatarScreen";

interface ExportData {
  persona: Persona | null;
  pitch: string;
  faq: FaqItem[];
  avatarUrl: string;
  industry: string;
  product: string;
  toneLabel: string;
  voiceName: string;
}

const esc = (s: string) =>
  (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function downloadAvatarCard(d: ExportData): void {
  const name = d.persona?.name || "Аватар-продавец";
  const role = d.persona?.role || d.industry;

  const strengthsHtml = (d.persona?.strengths || [])
    .map(s => `<span class="chip">✓ ${esc(s)}</span>`)
    .join("");

  const faqHtml = d.faq
    .map(
      f => `
      <div class="faq">
        <div class="q">❓ ${esc(f.question)}</div>
        <div class="a">${esc(f.answer)}</div>
      </div>`,
    )
    .join("");

  const avatarHtml = d.avatarUrl
    ? `<img class="avatar" src="${esc(d.avatarUrl)}" alt="${esc(name)}" />`
    : `<div class="avatar placeholder">👤</div>`;

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(name)} — карточка аватара-продавца</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, "Segoe UI", Roboto, sans-serif;
    background: #f1f5f9; color: #0f172a; line-height: 1.6; padding: 24px;
  }
  .card {
    max-width: 760px; margin: 0 auto; background: #fff;
    border-radius: 24px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,.08);
  }
  .header {
    background: linear-gradient(135deg, #06b6d4, #2563eb);
    color: #fff; padding: 32px; display: flex; align-items: center; gap: 24px;
  }
  .avatar {
    width: 120px; height: 120px; border-radius: 20px; object-fit: cover;
    border: 4px solid rgba(255,255,255,.3); flex-shrink: 0;
  }
  .avatar.placeholder {
    display: flex; align-items: center; justify-content: center;
    font-size: 56px; background: rgba(255,255,255,.15);
  }
  .header h1 { font-size: 28px; margin-bottom: 4px; }
  .header .role { opacity: .9; font-size: 16px; }
  .header .meta { margin-top: 10px; font-size: 13px; opacity: .85; }
  .body { padding: 32px; }
  .section { margin-bottom: 28px; }
  .section h2 {
    font-size: 13px; text-transform: uppercase; letter-spacing: .05em;
    color: #06b6d4; margin-bottom: 12px; font-weight: 700;
  }
  .personality { color: #334155; }
  .greeting {
    margin-top: 12px; padding: 14px 18px; background: #ecfeff;
    border-left: 3px solid #06b6d4; border-radius: 8px; font-style: italic;
  }
  .chips { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    background: #ecfeff; color: #0891b2; font-size: 13px;
    padding: 4px 12px; border-radius: 999px; font-weight: 600;
  }
  .pitch {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 18px; color: #1e293b; white-space: pre-wrap;
  }
  .faq {
    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
    padding: 16px; margin-bottom: 12px;
  }
  .faq .q { font-weight: 600; margin-bottom: 6px; color: #0f172a; }
  .faq .a { color: #475569; }
  .footer {
    text-align: center; padding: 20px; font-size: 12px; color: #94a3b8;
    border-top: 1px solid #e2e8f0;
  }
  @media print {
    body { background: #fff; padding: 0; }
    .card { box-shadow: none; }
  }
</style>
</head>
<body>
  <div class="card">
    <div class="header">
      ${avatarHtml}
      <div>
        <h1>${esc(name)}</h1>
        <div class="role">${esc(role)}</div>
        <div class="meta">
          🏢 ${esc(d.industry)} &nbsp;•&nbsp; 🎙️ Голос: ${esc(d.voiceName)} &nbsp;•&nbsp; 💬 Тон: ${esc(d.toneLabel)}
        </div>
      </div>
    </div>
    <div class="body">
      ${d.persona?.personality ? `
      <div class="section">
        <h2>О продавце</h2>
        <div class="personality">${esc(d.persona.personality)}</div>
        ${d.persona.greeting ? `<div class="greeting">💬 ${esc(d.persona.greeting)}</div>` : ""}
        ${strengthsHtml ? `<div class="chips">${strengthsHtml}</div>` : ""}
      </div>` : ""}

      ${d.product ? `
      <div class="section">
        <h2>Продукт / компания</h2>
        <div class="personality">${esc(d.product)}</div>
      </div>` : ""}

      ${d.pitch ? `
      <div class="section">
        <h2>Продающий монолог</h2>
        <div class="pitch">${esc(d.pitch)}</div>
      </div>` : ""}

      ${faqHtml ? `
      <div class="section">
        <h2>Вопросы и возражения</h2>
        ${faqHtml}
      </div>` : ""}
    </div>
    <div class="footer">
      Карточка виртуального продавца • создано в Творческой Мастерской
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name.replace(/[^\wа-яА-ЯёЁ -]/g, "")} — карточка.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
