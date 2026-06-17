"""
ИИ-движок для творческих модулей через Polza.ai (OpenAI-совместимый API).

Поддерживает генерацию для 5 модулей:
- book      — главы и сюжет книги
- animation — сцены и диалоги сценария
- podcast   — структура эпизода и вопросы
- poem      — стихи, песни, рифмы
- rhymes    — подбор рифм к слову

Метод: POST / — генерация текста по заданному типу задачи.
"""

import json
import os
from typing import Any

import requests

POLZA_URL = "https://api.polza.ai/api/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-4o-mini"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def _response(status: int, body: Any) -> dict:
    return {
        "statusCode": status,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False),
    }


# ─── Системные промпты по модулям ─────────────────────────────────────────────

SYSTEM_PROMPTS = {
    "book": (
        "Ты — профессиональный писатель и редактор художественной литературы. "
        "Пишешь живым, образным русским языком. Создаёшь увлекательную прозу "
        "с яркими образами, диалогами и атмосферой. Не используй markdown-разметку, "
        "только чистый художественный текст с абзацами."
    ),
    "book-outline": (
        "Ты — опытный писатель и сценарист. Создаёшь продуманные структуры книг: "
        "логичные главы с интригой, развитием персонажей и сюжетными арками. "
        "Отвечай СТРОГО валидным JSON без markdown."
    ),
    "animation": (
        "Ты — профессиональный сценарист анимации и кино. Пишешь динамичные сцены "
        "с яркими визуальными описаниями и живыми диалогами. Понимаешь ритм и темп "
        "повествования. Не используй markdown, пиши как в профессиональном сценарии."
    ),
    "podcast": (
        "Ты — продюсер успешных подкастов. Создаёшь увлекательные сценарии эпизодов, "
        "цепляющие вопросы и логичную структуру беседы. Понимаешь, как удержать "
        "внимание слушателя. Не используй markdown."
    ),
    "poem": (
        "Ты — талантливый поэт, мастер русского стихосложения. Виртуозно владеешь "
        "рифмой, ритмом и образностью. Чувствуешь музыку слова. Создавай стихи "
        "строго в заданной форме и размере. Не используй markdown, только текст стиха."
    ),
    "rhymes": (
        "Ты — эксперт по русской рифме. Подбираешь точные и интересные рифмы. "
        "Отвечай СТРОГО валидным JSON-массивом строк без markdown, например: "
        '["слово1", "слово2", "слово3"]'
    ),
    "avatar": (
        "Ты — эксперт по продажам и созданию виртуальных консультантов. "
        "Создаёшь живые, убедительные и человечные скрипты для аватаров-продавцов. "
        "Пишешь естественной разговорной речью, без канцелярита. "
        "Понимаешь психологию клиента, работу с возражениями и техники продаж. "
        "Не используй markdown."
    ),
    "avatar-json": (
        "Ты — эксперт по продажам и созданию виртуальных консультантов. "
        "Помогаешь спроектировать виртуального продавца: внешность, характер, "
        "приветствие и реплики. Отвечай СТРОГО валидным JSON без markdown."
    ),
    "avatar-image": (
        "You are a world-class prompt engineer specializing in HYPER-PHOTOREALISTIC "
        "human portrait photography prompts for FLUX. Your prompts always produce images "
        "indistinguishable from a real DSLR photograph of a real person — never 3D, "
        "never CGI, never illustration. You emphasize camera/lens specs, natural lighting, "
        "realistic skin texture and lifelike imperfections. "
        "Answer with ONLY the prompt text, no markdown, no explanations."
    ),
}


def _build_messages(task: str, payload: dict) -> tuple[list, dict]:
    """Формирует системный и пользовательский промпты под конкретную задачу."""
    extra = {"json_mode": False, "max_tokens": 2000, "temperature": 0.85}

    if task == "book-chapter":
        system = SYSTEM_PROMPTS["book"]
        user = (
            f"Напиши главу книги в жанре «{payload.get('genre', 'роман')}».\n"
            f"Название книги: «{payload.get('bookTitle', '')}».\n"
            f"Идея книги: {payload.get('premise', '')}\n"
            f"Название главы: «{payload.get('chapterTitle', '')}».\n"
            f"Краткое содержание главы: {payload.get('summary', 'на твоё усмотрение')}.\n"
        )
        chars = payload.get("characters", [])
        if chars:
            chars_str = "; ".join(f"{c.get('name')} ({c.get('role')}, {c.get('trait')})" for c in chars)
            user += f"Персонажи: {chars_str}.\n"
        length = payload.get("length", "средняя")
        words = {"короткая": "300-500", "средняя": "600-900", "длинная": "1000-1500"}.get(length, "600-900")
        user += f"Объём: {words} слов. Пиши сразу художественный текст главы."
        extra["max_tokens"] = 3000

    elif task == "book-outline":
        system = SYSTEM_PROMPTS["book-outline"]
        count = payload.get("chapterCount", 7)
        user = (
            f"Создай структуру из {count} глав для книги в жанре "
            f"«{payload.get('genre', 'роман')}».\n"
            f"Название: «{payload.get('bookTitle', '')}».\n"
            f"Идея: {payload.get('premise', '')}\n\n"
            'Верни JSON-массив объектов вида: '
            '[{"title": "Название главы", "summary": "Краткое содержание 1-2 предложения"}]. '
            "Только JSON, без пояснений."
        )
        extra["json_mode"] = True
        extra["temperature"] = 0.9

    elif task == "book-ideas":
        system = SYSTEM_PROMPTS["book-outline"]
        user = (
            f"Придумай 3 оригинальные идеи для книги в жанре «{payload.get('genre', 'роман')}».\n"
            'Верни JSON-массив: [{"title": "Название", "premise": "Идея в 1-2 предложениях"}]. '
            "Только JSON."
        )
        extra["json_mode"] = True
        extra["temperature"] = 1.0

    elif task == "animation-scene":
        system = SYSTEM_PROMPTS["animation"]
        user = (
            f"Проект: «{payload.get('projectTitle', '')}» "
            f"(формат: {payload.get('format', 'мультфильм')}).\n"
            f"Логлайн: {payload.get('logline', '')}\n"
            f"Сцена в локации «{payload.get('location', '')}», "
            f"время: {payload.get('time', 'день')}, "
            f"настроение: {payload.get('mood', 'нейтральное')}.\n\n"
            "Напиши: 1) описание действия в кадре (что происходит визуально), "
            "2) диалоги персонажей. Формат:\n"
            "ДЕЙСТВИЕ:\n<описание>\n\nДИАЛОГ:\n<реплики>"
        )

    elif task == "animation-storyboard":
        system = SYSTEM_PROMPTS["animation"]
        count = payload.get("sceneCount", 5)
        user = (
            f"Создай раскадровку из {count} сцен для проекта "
            f"«{payload.get('projectTitle', '')}» (формат: {payload.get('format', 'мультфильм')}).\n"
            f"Логлайн: {payload.get('logline', '')}\n\n"
            'Верни JSON-массив: [{"location": "место", "time": "День/Ночь", '
            '"mood": "настроение", "action": "что происходит", "dialogue": "диалоги"}]. '
            "Только JSON."
        )
        extra["json_mode"] = True
        extra["max_tokens"] = 3000

    elif task == "podcast-script":
        system = SYSTEM_PROMPTS["podcast"]
        user = (
            f"Подкаст «{payload.get('podcastName', '')}», "
            f"эпизод «{payload.get('episodeTitle', '')}».\n"
            f"Формат: {payload.get('format', 'соло')}.\n"
            f"Главная мысль: {payload.get('mainIdea', '')}\n"
            f"Блок: «{payload.get('segmentTitle', '')}» (тип: {payload.get('segmentType', '')}).\n\n"
            "Напиши развёрнутый текст/тезисы для этого блока подкаста. "
            "Живо, по делу, с конкретными примерами."
        )

    elif task == "podcast-structure":
        system = SYSTEM_PROMPTS["podcast"]
        user = (
            f"Составь структуру эпизода подкаста «{payload.get('episodeTitle', '')}».\n"
            f"Главная мысль: {payload.get('mainIdea', '')}\n"
            f"Формат: {payload.get('format', 'соло')}.\n\n"
            'Верни JSON-массив блоков: [{"type": "intro|topic|interview|story|tips|outro", '
            '"title": "название блока", "duration": "MM:SS", "notes": "тезисы блока"}]. '
            "5-7 блоков. Только JSON."
        )
        extra["json_mode"] = True

    elif task == "podcast-questions":
        system = SYSTEM_PROMPTS["podcast"]
        user = (
            f"Эпизод «{payload.get('episodeTitle', '')}», гость: {payload.get('guestName', 'эксперт')}.\n"
            f"Тема: {payload.get('mainIdea', '')}\n\n"
            'Придумай 6 глубоких вопросов гостю. Верни JSON-массив: '
            '[{"text": "вопрос", "followUp": "уточняющий вопрос"}]. Только JSON.'
        )
        extra["json_mode"] = True

    elif task == "poem-write":
        system = SYSTEM_PROMPTS["poem"]
        user = (
            f"Напиши стихотворение в форме «{payload.get('form', 'верлибр')}».\n"
            f"Тема/название: «{payload.get('title', 'на твоё усмотрение')}».\n"
            f"Настроение: {payload.get('mood', 'лирика')}.\n"
            f"Размер: {payload.get('meter', 'свободный')}.\n"
            f"Схема рифм: {payload.get('rhyme', 'ABAB')}.\n"
        )
        if payload.get("theme"):
            user += f"О чём: {payload.get('theme')}.\n"
        user += "Пиши сразу текст стиха, без заголовков и пояснений."
        extra["temperature"] = 0.95

    elif task == "poem-continue":
        system = SYSTEM_PROMPTS["poem"]
        user = (
            f"Продолжи стихотворение в том же стиле, размере и настроении "
            f"({payload.get('mood', 'лирика')}, схема {payload.get('rhyme', 'ABAB')}).\n"
            f"Уже написано:\n{payload.get('existingText', '')}\n\n"
            "Добавь 4-8 строк продолжения. Только новые строки."
        )
        extra["temperature"] = 0.95

    elif task == "rhymes":
        system = SYSTEM_PROMPTS["rhymes"]
        user = (
            f"Подбери 8 точных рифм к слову «{payload.get('word', '')}». "
            'Верни JSON-массив строк. Только JSON.'
        )
        extra["json_mode"] = True
        extra["max_tokens"] = 300
        extra["temperature"] = 0.7

    # ─── Аватар-продавец ──────────────────────────────────────────────────
    elif task == "avatar-image-prompt":
        system = SYSTEM_PROMPTS["avatar-image"]
        user = (
            "Write ONE detailed English prompt for a HYPER-PHOTOREALISTIC portrait "
            "of a real human sales consultant. The result must look like an actual "
            "photograph of a real person, NOT a render, NOT 3D, NOT CGI, NOT an illustration.\n\n"
            f"Gender: {payload.get('gender', 'any')}.\n"
            f"Appearance (translate to English if needed): {payload.get('appearance', '')}.\n"
            f"Industry/role: {payload.get('industry', 'sales')}.\n"
            f"Mood/style: {payload.get('style', 'professional, friendly')}.\n\n"
            "MUST include these photographic details for maximum realism: "
            "shot on Canon EOS R5 with 85mm f/1.4 lens, shallow depth of field, "
            "natural soft window light, realistic detailed skin with visible pores, "
            "subtle skin texture, fine facial hair, natural skin imperfections, "
            "catchlights in the eyes, sharp focus on eyes, real fabric texture on clothes, "
            "professional corporate headshot, head and shoulders, looking at camera, "
            "warm genuine smile, clean softly blurred office background, "
            "85mm portrait, ultra-detailed, high resolution, lifelike, "
            "photojournalistic, candid, raw photo, --style raw.\n"
            "End the prompt with negative cues to AVOID: "
            "(no cartoon, no anime, no 3d render, no cgi, no illustration, no painting, "
            "no plastic skin, no doll, no airbrushed, no uncanny, no deformed face, no extra fingers). "
            "Output ONLY the final prompt text."
        )
        extra["max_tokens"] = 500
        extra["temperature"] = 0.7

    elif task == "avatar-persona":
        system = SYSTEM_PROMPTS["avatar-json"]
        user = (
            "Спроектируй личность виртуального продавца для бизнеса.\n"
            f"Имя (если не задано — придумай): {payload.get('name', '')}.\n"
            f"Компания/продукт: {payload.get('product', '')}.\n"
            f"Сфера: {payload.get('industry', '')}.\n"
            f"Тон общения: {payload.get('tone', 'дружелюбный профессионал')}.\n\n"
            'Верни JSON: {"name": "имя", "role": "должность", '
            '"personality": "описание характера 1-2 предложения", '
            '"greeting": "приветственная фраза клиенту", '
            '"strengths": ["сильная сторона 1", "сильная сторона 2", "сильная сторона 3"]}. '
            "Только JSON."
        )
        extra["json_mode"] = True
        extra["temperature"] = 0.9

    elif task == "avatar-pitch":
        system = SYSTEM_PROMPTS["avatar"]
        user = (
            f"Напиши продающий монолог (питч) от лица продавца {payload.get('name', 'консультанта')}.\n"
            f"Компания/продукт: {payload.get('product', '')}.\n"
            f"Сфера: {payload.get('industry', '')}.\n"
            f"Тон: {payload.get('tone', 'дружелюбный профессионал')}.\n"
            f"Целевая аудитория: {payload.get('audience', 'клиенты')}.\n"
            f"Длительность: {payload.get('length', 'средняя')} "
            "(короткая ~40 слов, средняя ~90 слов, длинная ~150 слов).\n\n"
            "Питч должен цеплять с первой фразы, показывать выгоду и завершаться "
            "призывом к действию. Пиши живой разговорной речью для озвучки. "
            "Только текст монолога."
        )
        extra["temperature"] = 0.9
        extra["max_tokens"] = 800

    elif task == "avatar-faq":
        system = SYSTEM_PROMPTS["avatar-json"]
        user = (
            f"Продавец {payload.get('name', 'консультант')} для «{payload.get('product', '')}» "
            f"(сфера: {payload.get('industry', '')}, тон: {payload.get('tone', 'дружелюбный')}).\n\n"
            "Составь 6 частых вопросов клиентов с убедительными ответами от лица продавца, "
            "включая работу с типичными возражениями (цена, сомнения, сравнение). "
            'Верни JSON-массив: [{"question": "вопрос клиента", "answer": "ответ продавца"}]. '
            "Только JSON."
        )
        extra["json_mode"] = True
        extra["max_tokens"] = 2500
        extra["temperature"] = 0.85

    elif task == "avatar-reply":
        system = SYSTEM_PROMPTS["avatar"]
        knowledge = (payload.get("knowledge") or "").strip()
        history = payload.get("history") or []
        user = (
            f"Ты — виртуальный продавец {payload.get('name', 'консультант')}.\n"
            f"Продукт/компания: {payload.get('product', '')}.\n"
            f"Сфера: {payload.get('industry', '')}.\n"
            f"Твой характер: {payload.get('personality', 'дружелюбный профессионал')}.\n"
            f"Тон: {payload.get('tone', 'дружелюбный')}.\n\n"
        )
        if knowledge:
            user += (
                "БАЗА ЗНАНИЙ О ТОВАРЕ (отвечай строго по ней, не выдумывай факты, "
                "цены и условия бери только отсюда):\n"
                f"\"\"\"\n{knowledge[:6000]}\n\"\"\"\n\n"
            )
        if history:
            hist_lines = []
            for h in history[-8:]:
                role = "Клиент" if h.get("from") == "client" else "Ты"
                hist_lines.append(f"{role}: {h.get('text', '')}")
            user += "История диалога:\n" + "\n".join(hist_lines) + "\n\n"
        user += (
            f"Клиент написал: «{payload.get('message', '')}»\n\n"
            "Ответь как живой продавец — кратко, по делу, тепло, веди к продаже. "
            "Если уместно — мягко предложи оставить контакт (имя, телефон) для "
            "персонального предложения. Только текст ответа, без префиксов."
        )
        extra["temperature"] = 0.85
        extra["max_tokens"] = 600

    elif task == "avatar-analyze":
        system = SYSTEM_PROMPTS["avatar-json"]
        history = payload.get("history") or []
        hist_lines = []
        for h in history:
            role = "Клиент" if h.get("from") == "client" else "Продавец"
            hist_lines.append(f"{role}: {h.get('text', '')}")
        dialog = "\n".join(hist_lines) if hist_lines else "(диалог пуст)"
        user = (
            f"Проанализируй диалог продавца с клиентом по продукту «{payload.get('product', '')}».\n\n"
            f"Диалог:\n{dialog}\n\n"
            "Оцени клиента как лида. Верни JSON:\n"
            '{"score": число 0-100 (готовность к покупке), '
            '"temperature": "холодный|тёплый|горячий", '
            '"summary": "краткий вывод о клиенте 1-2 предложения", '
            '"interests": ["что интересует клиента"], '
            '"objections": ["возражения и сомнения клиента"], '
            '"name": "имя клиента если упомянул, иначе пустая строка", '
            '"contact": "телефон/email если оставил, иначе пустая строка", '
            '"next_step": "рекомендация продавцу — что делать дальше"}. '
            "Только JSON."
        )
        extra["json_mode"] = True
        extra["max_tokens"] = 800
        extra["temperature"] = 0.4

    else:
        return [], extra

    messages = [
        {"role": "system", "content": system},
        {"role": "user", "content": user},
    ]
    return messages, extra


def handler(event: dict, context: Any) -> dict:
    """
    ИИ-генерация контента для творческих модулей.

    Тело запроса:
        task    (str)  — тип задачи (book-chapter, animation-scene, poem-write и т.д.)
        model   (str)  — опционально, модель Polza.ai (по умолчанию gpt-4o-mini)
        payload (dict) — параметры под задачу

    Возвращает:
        { "success": true, "text": "...", "json": [...] }
    """
    method = (event.get("httpMethod") or "POST").upper()
    if method == "OPTIONS":
        return _response(200, {"ok": True})
    if method != "POST":
        return _response(405, {"error": "Только POST"})

    api_key = os.environ.get("POLZA_API_KEY", "")
    if not api_key:
        return _response(500, {"error": "Не настроен ключ POLZA_API_KEY"})

    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _response(400, {"error": "Некорректный JSON в теле запроса"})

    task = body.get("task", "")
    payload = body.get("payload", {})
    model = body.get("model") or DEFAULT_MODEL

    messages, extra = _build_messages(task, payload)
    if not messages:
        return _response(400, {"error": f"Неизвестная задача: {task}"})

    request_body = {
        "model": model,
        "messages": messages,
        "max_tokens": extra["max_tokens"],
        "temperature": extra["temperature"],
    }
    if extra["json_mode"]:
        request_body["response_format"] = {"type": "json_object"}

    try:
        resp = requests.post(
            POLZA_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=request_body,
            timeout=120,
        )
    except requests.RequestException as exc:
        return _response(502, {"error": f"Ошибка соединения с ИИ: {exc}"})

    if resp.status_code != 200:
        return _response(502, {
            "error": "ИИ вернул ошибку",
            "details": resp.text[:500],
            "status_code": resp.status_code,
        })

    data = resp.json()
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

    result = {"success": True, "text": content}

    if extra["json_mode"]:
        result["json"] = _try_parse_json(content)
        result["obj"] = _try_parse_object(content)

    return _response(200, result)


def _try_parse_object(content: str):
    """Возвращает распарсенный JSON-объект (dict) либо пустой dict."""
    content = content.strip()
    if content.startswith("```"):
        parts = content.split("```")
        if len(parts) > 1:
            content = parts[1]
            if content.startswith("json"):
                content = content[4:]
            content = content.strip()
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def _try_parse_json(content: str):
    """Пытается распарсить JSON из ответа ИИ, в т.ч. обёрнутый в объект."""
    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
        content = content.strip()
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError:
        return []
    if isinstance(parsed, list):
        return parsed
    if isinstance(parsed, dict):
        for key in ("items", "chapters", "scenes", "blocks", "questions", "rhymes", "ideas", "result", "data"):
            if key in parsed and isinstance(parsed[key], list):
                return parsed[key]
        for v in parsed.values():
            if isinstance(v, list):
                return v
    return []