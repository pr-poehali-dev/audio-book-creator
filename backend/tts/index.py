"""
Бэкенд-функция для синтеза речи через Yandex SpeechKit.

Поддерживаемые методы:
- OPTIONS /  — CORS preflight
- POST /     — синтез речи, сохранение в S3 и запись в БД
- GET /      — получение списка проектов пользователя
- DELETE /   — удаление проекта по ID
"""

import json
import os
import uuid
import logging
from typing import Any

import boto3
import psycopg2
import psycopg2.extras
import requests

# ─── Логирование ─────────────────────────────────────────────────────────────

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─── Константы ───────────────────────────────────────────────────────────────

YANDEX_TTS_URL = "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize"
S3_BUCKET = "files"
CDN_BASE = "https://cdn.poehali.dev/projects"
TEXT_MAX_LENGTH = 5000

ALLOWED_VOICES = {"alena", "filipp", "ermil", "jane", "madirus", "zahar"}
SPEED_MIN = 0.8
SPEED_MAX = 2.0

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

# ─── Вспомогательные функции ──────────────────────────────────────────────────


def _response(status: int, body: Any, extra_headers: dict | None = None) -> dict:
    """Формирует HTTP-ответ с CORS-заголовками и JSON-телом."""
    headers = {**CORS_HEADERS, "Content-Type": "application/json"}
    if extra_headers:
        headers.update(extra_headers)
    return {
        "statusCode": status,
        "headers": headers,
        "body": json.dumps(body, ensure_ascii=False, default=str),
    }


def _get_db_conn():
    """Возвращает подключение к PostgreSQL, используя переменные окружения."""
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "localhost"),
        port=int(os.environ.get("DB_PORT", 5432)),
        dbname=os.environ.get("DB_NAME", "postgres"),
        user=os.environ.get("DB_USER", "postgres"),
        password=os.environ.get("DB_PASSWORD", ""),
        connect_timeout=10,
    )


def _get_s3_client():
    """Возвращает клиент boto3 для работы с S3-совместимым хранилищем."""
    return boto3.client(
        "s3",
        endpoint_url=os.environ.get("AWS_ENDPOINT_URL", "https://s3.poehali.dev"),
        aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID", ""),
        aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY", ""),
        region_name=os.environ.get("AWS_REGION", "us-east-1"),
    )


def _estimate_duration(text: str, speed: float) -> float:
    """
    Грубо оценивает длительность аудио в секундах.

    Средняя скорость русской речи — около 12 символов в секунду при speed=1.0.
    """
    base_chars_per_sec = 12.0
    return round(len(text) / (base_chars_per_sec * speed), 1)


# ─── Обработчики методов ─────────────────────────────────────────────────────


def _handle_options() -> dict:
    """Обрабатывает CORS preflight-запрос."""
    return _response(200, {"ok": True})


def _handle_post(body: dict) -> dict:
    """
    Синтезирует речь через Yandex SpeechKit, загружает результат в S3
    и сохраняет метаданные проекта в базе данных.

    Ожидаемые поля тела запроса:
        text     (str)   — текст для синтеза
        voice_id (str)   — идентификатор голоса (alena, filipp, ermil, jane, madirus, zahar)
        speed    (float) — скорость воспроизведения от 0.8 до 2.0
        user_id  (str)   — идентификатор пользователя
        title    (str)   — название проекта
    """
    # ── Валидация входных данных ──────────────────────────────────────────────
    text: str = (body.get("text") or "").strip()
    voice_id: str = (body.get("voice_id") or "alena").strip().lower()
    speed: float = float(body.get("speed") or 1.0)
    user_id: str = (body.get("user_id") or "anonymous").strip()
    title: str = (body.get("title") or "Без названия").strip()

    if not text:
        return _response(400, {"error": "Поле 'text' обязательно и не может быть пустым."})

    if voice_id not in ALLOWED_VOICES:
        return _response(
            400,
            {
                "error": f"Недопустимый voice_id '{voice_id}'. "
                         f"Допустимые значения: {', '.join(sorted(ALLOWED_VOICES))}."
            },
        )

    if not (SPEED_MIN <= speed <= SPEED_MAX):
        return _response(
            400,
            {"error": f"Параметр speed должен быть в диапазоне [{SPEED_MIN}, {SPEED_MAX}]."},
        )

    # ── Обрезка текста при превышении лимита ─────────────────────────────────
    truncated = False
    if len(text) > TEXT_MAX_LENGTH:
        logger.warning(
            "Текст превышает %d символов (%d), будет обрезан.",
            TEXT_MAX_LENGTH,
            len(text),
        )
        text = text[:TEXT_MAX_LENGTH]
        truncated = True

    # ── Синтез речи через Yandex SpeechKit ───────────────────────────────────
    api_key = os.environ.get("YANDEX_SPEECHKIT_API_KEY", "")
    folder_id = os.environ.get("YANDEX_FOLDER_ID", "")

    tts_params = {
        "text": text,
        "voice": voice_id,
        "speed": str(speed),
        "format": "mp3",
        "sampleRateHertz": "48000",
        "lang": "ru-RU",
    }
    if folder_id:
        tts_params["folderId"] = folder_id

    logger.info("Отправка запроса к Yandex SpeechKit: voice=%s speed=%s", voice_id, speed)

    try:
        tts_response = requests.post(
            YANDEX_TTS_URL,
            data=tts_params,
            headers={"Authorization": f"Api-Key {api_key}"},
            timeout=60,
        )
    except requests.RequestException as exc:
        logger.error("Ошибка соединения с Yandex SpeechKit: %s", exc)
        return _response(502, {"error": f"Ошибка соединения с Yandex SpeechKit: {exc}"})

    if tts_response.status_code != 200:
        logger.error(
            "Yandex SpeechKit вернул ошибку %d: %s",
            tts_response.status_code,
            tts_response.text,
        )
        return _response(
            502,
            {
                "error": "Yandex SpeechKit вернул ошибку.",
                "details": tts_response.text,
                "status_code": tts_response.status_code,
            },
        )

    audio_bytes: bytes = tts_response.content
    logger.info("Получено %d байт аудио от Yandex SpeechKit.", len(audio_bytes))

    # ── Загрузка аудиофайла в S3 ─────────────────────────────────────────────
    filename = f"{uuid.uuid4()}.mp3"
    s3_key = f"audio/{user_id}/{filename}"
    aws_access_key_id = os.environ.get("AWS_ACCESS_KEY_ID", "")

    try:
        s3 = _get_s3_client()
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=audio_bytes,
            ContentType="audio/mpeg",
        )
        logger.info("Файл загружен в S3: bucket=%s key=%s", S3_BUCKET, s3_key)
    except Exception as exc:
        logger.error("Ошибка загрузки файла в S3: %s", exc)
        return _response(500, {"error": f"Ошибка загрузки файла в S3: {exc}"})

    audio_url = f"{CDN_BASE}/{aws_access_key_id}/bucket/{s3_key}"
    duration_estimate = _estimate_duration(text, speed)

    # ── Сохранение записи в БД ────────────────────────────────────────────────
    project_id: str | None = None
    try:
        conn = _get_db_conn()
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO t_p29363705_audio_book_creator.projects
                        (title, user_id, audio_url, status, duration_sec, created_at)
                    VALUES (%s, %s, %s, 'done', %s, NOW())
                    RETURNING id
                    """,
                    (title, user_id, audio_url, duration_estimate),
                )
                row = cur.fetchone()
                project_id = str(row[0]) if row else None
        conn.close()
        logger.info("Запись сохранена в БД: project_id=%s", project_id)
    except Exception as exc:
        logger.error("Ошибка записи в БД: %s", exc)
        # Не прерываем выполнение — аудио уже сгенерировано и загружено
        project_id = None

    result: dict = {
        "success": True,
        "audio_url": audio_url,
        "project_id": project_id,
        "duration_estimate": duration_estimate,
    }
    if truncated:
        result["warning"] = (
            f"Текст был обрезан до {TEXT_MAX_LENGTH} символов, "
            "так как превышал допустимый лимит."
        )

    return _response(200, result)


def _handle_get(query_params: dict) -> dict:
    """
    Возвращает список проектов пользователя из базы данных.

    Ожидаемые query-параметры:
        user_id (str) — идентификатор пользователя
    """
    user_id = (query_params.get("user_id") or "").strip()
    if not user_id:
        return _response(400, {"error": "Параметр 'user_id' обязателен."})

    try:
        conn = _get_db_conn()
        with conn:
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(
                    """
                    SELECT id, title, status, audio_url, created_at, duration_sec
                    FROM t_p29363705_audio_book_creator.projects
                    WHERE user_id = %s
                    ORDER BY created_at DESC
                    """,
                    (user_id,),
                )
                rows = cur.fetchall()
        conn.close()
    except Exception as exc:
        logger.error("Ошибка чтения из БД: %s", exc)
        return _response(500, {"error": f"Ошибка чтения из БД: {exc}"})

    projects = [dict(row) for row in rows]
    return _response(200, {"projects": projects})


def _handle_delete(query_params: dict) -> dict:
    """
    Удаляет проект из базы данных по его ID.

    Ожидаемые query-параметры:
        project_id (str) — идентификатор проекта
    """
    project_id = (query_params.get("project_id") or "").strip()
    if not project_id:
        return _response(400, {"error": "Параметр 'project_id' обязателен."})

    try:
        conn = _get_db_conn()
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    DELETE FROM t_p29363705_audio_book_creator.projects
                    WHERE id = %s
                    """,
                    (project_id,),
                )
                deleted_count = cur.rowcount
        conn.close()
    except Exception as exc:
        logger.error("Ошибка удаления из БД: %s", exc)
        return _response(500, {"error": f"Ошибка удаления из БД: {exc}"})

    if deleted_count == 0:
        return _response(404, {"error": f"Проект с id='{project_id}' не найден."})

    return _response(200, {"success": True, "deleted_project_id": project_id})


# ─── Точка входа ─────────────────────────────────────────────────────────────


def handler(event: dict, context: Any) -> dict:
    """
    Основная точка входа бэкенд-функции.

    Маршрутизирует запросы по методу HTTP:
        OPTIONS — CORS preflight
        POST    — синтез речи и создание проекта
        GET     — получение списка проектов пользователя
        DELETE  — удаление проекта

    Args:
        event:   словарь события от платформы (метод, тело, query-параметры)
        context: контекст выполнения (не используется)

    Returns:
        Словарь с ключами statusCode, headers, body.
    """
    method: str = (event.get("httpMethod") or event.get("method") or "GET").upper()
    query_params: dict = event.get("queryStringParameters") or {}
    raw_body: str = event.get("body") or "{}"

    logger.info("Входящий запрос: method=%s query=%s", method, query_params)

    # ── Разбор JSON-тела ──────────────────────────────────────────────────────
    body: dict = {}
    if method == "POST":
        try:
            body = json.loads(raw_body) if raw_body else {}
        except json.JSONDecodeError as exc:
            return _response(400, {"error": f"Некорректный JSON в теле запроса: {exc}"})

    # ── Маршрутизация ─────────────────────────────────────────────────────────
    if method == "OPTIONS":
        return _handle_options()
    elif method == "POST":
        return _handle_post(body)
    elif method == "GET":
        return _handle_get(query_params)
    elif method == "DELETE":
        return _handle_delete(query_params)
    else:
        return _response(405, {"error": f"Метод '{method}' не поддерживается."})
