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
DEFAULT_MODEL = "openai/gpt-image-1"

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

    model = body.get("model") or DEFAULT_MODEL
    size = body.get("size") or "1024x1024"

    try:
        resp = requests.post(
            POLZA_IMAGE_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={"model": model, "prompt": prompt, "n": 1, "size": size},
            timeout=180,
        )
    except requests.RequestException as exc:
        return _response(502, {"error": f"Ошибка соединения с ИИ: {exc}"})

    if resp.status_code != 200:
        return _response(502, {
            "error": "ИИ вернул ошибку при генерации изображения",
            "details": resp.text[:500],
            "status_code": resp.status_code,
        })

    data = resp.json()
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

    return _response(200, {"success": True, "image_url": cdn_url})
