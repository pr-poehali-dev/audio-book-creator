"""
Бэкенд-функция для извлечения текста из файлов PDF и EPUB.

Поддерживаемые методы:
- OPTIONS / — CORS preflight
- POST /    — принимает base64-файл, возвращает извлечённый текст

Поддерживаемые форматы: PDF, EPUB, TXT, DOCX
"""

import base64
import io
import json
import logging
import os
import zipfile
import re
from typing import Any

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 МБ


def _response(status: int, body: Any) -> dict:
    """Формирует HTTP-ответ с CORS-заголовками."""
    return {
        "statusCode": status,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False),
    }


def _extract_txt(data: bytes) -> str:
    """Извлекает текст из TXT-файла, пробует разные кодировки."""
    for enc in ("utf-8", "cp1251", "latin-1"):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return data.decode("utf-8", errors="replace")


def _extract_pdf(data: bytes) -> str:
    """Извлекает текст из PDF через pypdf."""
    import pypdf

    reader = pypdf.PdfReader(io.BytesIO(data))
    parts = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            parts.append(text.strip())
    return "\n\n".join(parts)


def _extract_epub(data: bytes) -> str:
    """Извлекает текст из EPUB (ZIP с HTML-файлами)."""
    text_parts = []
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        # Сортируем файлы, чтобы сохранить порядок глав
        html_files = sorted(
            [n for n in zf.namelist() if n.endswith((".html", ".xhtml", ".htm"))],
        )
        for name in html_files:
            with zf.open(name) as f:
                raw = f.read().decode("utf-8", errors="replace")
                # Убираем HTML-теги
                clean = re.sub(r"<[^>]+>", " ", raw)
                # Схлопываем пробелы
                clean = re.sub(r"\s{2,}", "\n", clean).strip()
                if clean:
                    text_parts.append(clean)
    return "\n\n".join(text_parts)


def _extract_docx(data: bytes) -> str:
    """Извлекает текст из DOCX (ZIP с XML)."""
    text_parts = []
    with zipfile.ZipFile(io.BytesIO(data)) as zf:
        if "word/document.xml" not in zf.namelist():
            raise ValueError("Файл не является корректным DOCX-документом.")
        with zf.open("word/document.xml") as f:
            xml = f.read().decode("utf-8", errors="replace")
            # Извлекаем текст из тегов <w:t>
            words = re.findall(r"<w:t[^>]*>(.*?)</w:t>", xml, re.DOTALL)
            text_parts = [w for w in words if w.strip()]
    return " ".join(text_parts)


def handler(event: dict, context: Any) -> dict:
    """
    Принимает base64-закодированный файл, определяет формат по расширению
    и возвращает извлечённый текст.

    Тело запроса (JSON):
        file_b64 (str)  — файл в формате base64
        filename (str)  — имя файла с расширением (например, «книга.pdf»)

    Возвращает:
        {text: str, char_count: int, filename: str}
    """
    method = (event.get("httpMethod") or "POST").upper()

    if method == "OPTIONS":
        return _response(200, {"ok": True})

    if method != "POST":
        return _response(405, {"error": "Метод не поддерживается."})

    # ── Парсинг тела ──────────────────────────────────────────────────────────
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError as exc:
        return _response(400, {"error": f"Некорректный JSON: {exc}"})

    file_b64: str = (body.get("file_b64") or "").strip()
    filename: str = (body.get("filename") or "file.txt").strip().lower()

    if not file_b64:
        return _response(400, {"error": "Поле 'file_b64' обязательно."})

    # ── Декодирование файла ───────────────────────────────────────────────────
    try:
        file_data = base64.b64decode(file_b64)
    except Exception as exc:
        return _response(400, {"error": f"Ошибка декодирования base64: {exc}"})

    if len(file_data) > MAX_FILE_SIZE:
        return _response(413, {"error": f"Файл слишком большой. Максимум — {MAX_FILE_SIZE // 1024 // 1024} МБ."})

    # ── Определение формата и извлечение текста ───────────────────────────────
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "txt"

    logger.info("Парсинг файла: filename=%s ext=%s size=%d", filename, ext, len(file_data))

    try:
        if ext == "pdf":
            text = _extract_pdf(file_data)
        elif ext == "epub":
            text = _extract_epub(file_data)
        elif ext == "docx":
            text = _extract_docx(file_data)
        elif ext == "txt":
            text = _extract_txt(file_data)
        else:
            return _response(415, {"error": f"Формат '.{ext}' не поддерживается. Поддерживаются: pdf, epub, docx, txt."})
    except Exception as exc:
        logger.error("Ошибка при извлечении текста: %s", exc)
        return _response(422, {"error": f"Не удалось извлечь текст из файла: {exc}"})

    text = text.strip()
    if not text:
        return _response(422, {"error": "Не удалось извлечь текст — файл пуст или защищён."})

    logger.info("Извлечено %d символов из файла '%s'", len(text), filename)

    return _response(200, {
        "text": text,
        "char_count": len(text),
        "filename": filename,
    })
