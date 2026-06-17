"""
Генерация изображения аватара-продавца через Polza.ai (OpenAI-совместимый
endpoint /images/generations) с сохранением результата в S3-хранилище.

Метод POST / — принимает текстовый промпт, возвращает CDN-ссылку на картинку.
"""

import base64
import json
import os
import uuid
from typing import Any

import boto3
import requests

POLZA_IMAGE_URL = "https://api.polza.ai/api/v1/images/generations"

# Модели в порядке приоритета фотореализма людей (реальные id каталога Polza.ai).
# Перебираем по очереди: если модель недоступна/ошибка — пробуем следующую.
PHOTOREAL_MODELS = [
    "black-forest-labs/flux.2-pro",
    "bytedance/seedream-4.5",
    "google/gemini-3-pro-image-preview",
    "black-forest-labs/flux.2-flex",
    "bytedance/seedream-4",
    "openai/gpt-image-1.5",
    "openai/gpt-5-image",
]
DEFAULT_MODEL = PHOTOREAL_MODELS[0]

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


def _upload_to_s3(data: bytes, content_type: str = "image/png") -> str:
    s3 = boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )
    key = f"avatars/{uuid.uuid4().hex}.png"
    s3.put_object(Bucket="files", Key=key, Body=data, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def handler(event: dict, context: Any) -> dict:
    """
    Генерация аватара по промпту.

    Тело: { "prompt": "...", "model": "openai/gpt-image-1" (опц.), "size": "1024x1024" (опц.) }
    Ответ: { "success": true, "image_url": "https://cdn..." }
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
        return _response(400, {"error": "Некорректный JSON"})

    prompt = (body.get("prompt") or "").strip()
    if not prompt:
        return _response(400, {"error": "Пустой промпт"})

    size = body.get("size") or "1024x1024"

    # Если модель передана явно — используем только её, иначе перебираем фотореалистичные.
    if body.get("model"):
        candidates = [body["model"]]
    else:
        candidates = PHOTOREAL_MODELS

    data = None
    used_model = None
    last_error = ""
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    for model in candidates:
        try:
            resp = requests.post(
                POLZA_IMAGE_URL,
                headers=headers,
                json={"model": model, "prompt": prompt, "n": 1, "size": size},
                timeout=180,
            )
        except requests.RequestException as exc:
            last_error = f"Ошибка соединения: {exc}"
            continue

        if resp.status_code != 200:
            last_error = f"{model}: {resp.status_code} {resp.text[:200]}"
            continue

        parsed = resp.json()
        if parsed.get("data"):
            data = parsed
            used_model = model
            break
        last_error = f"{model}: пустой ответ"

    if not data:
        return _response(502, {
            "error": "Не удалось сгенерировать изображение ни одной моделью",
            "details": last_error,
        })

    items = data.get("data", [])
    if not items:
        return _response(502, {"error": "ИИ не вернул изображение"})

    item = items[0]
    img_bytes: bytes

    if item.get("b64_json"):
        img_bytes = base64.b64decode(item["b64_json"])
    elif item.get("url"):
        try:
            img_resp = requests.get(item["url"], timeout=120)
            img_resp.raise_for_status()
            img_bytes = img_resp.content
        except requests.RequestException as exc:
            return _response(502, {"error": f"Не удалось скачать изображение: {exc}"})
    else:
        return _response(502, {"error": "Неизвестный формат ответа изображения"})

    try:
        cdn_url = _upload_to_s3(img_bytes)
    except Exception as exc:
        return _response(500, {"error": f"Ошибка сохранения в хранилище: {exc}"})

    return _response(200, {"success": True, "image_url": cdn_url, "model": used_model})