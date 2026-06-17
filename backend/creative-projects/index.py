"""
CRUD для творческих проектов всех модулей (книги, сценарии, подкасты, стихи).

Методы:
- OPTIONS /  — CORS preflight
- POST /     — создать или обновить проект (upsert по id)
- GET /      — список проектов пользователя (фильтр по module)
- GET /?id=  — получить один проект целиком
- DELETE /   — удалить проект по id
"""

import json
import os
from typing import Any

import psycopg2
import psycopg2.extras

SCHEMA = "t_p29363705_audio_book_creator"
TABLE = f"{SCHEMA}.creative_projects"

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def _response(status: int, body: Any) -> dict:
    return {
        "statusCode": status,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps(body, ensure_ascii=False, default=str),
    }


def _conn():
    return psycopg2.connect(os.environ["DATABASE_URL"], connect_timeout=10)


def _esc(value: str) -> str:
    """Экранирует одинарные кавычки для Simple Query Protocol."""
    return value.replace("'", "''")


def handler(event: dict, context: Any) -> dict:
    method = (event.get("httpMethod") or "GET").upper()
    if method == "OPTIONS":
        return _response(200, {"ok": True})

    params = event.get("queryStringParameters") or {}

    if method == "GET":
        return _handle_get(params)
    if method == "POST":
        try:
            body = json.loads(event.get("body") or "{}")
        except json.JSONDecodeError:
            return _response(400, {"error": "Некорректный JSON"})
        return _handle_upsert(body)
    if method == "DELETE":
        return _handle_delete(params)

    return _response(405, {"error": "Метод не поддерживается"})


def _handle_get(params: dict) -> dict:
    project_id = (params.get("id") or "").strip()
    user_id = (params.get("user_id") or "").strip()
    module = (params.get("module") or "").strip()

    conn = _conn()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            if project_id:
                cur.execute(
                    f"SELECT * FROM {TABLE} WHERE id = '{_esc(project_id)}'"
                )
                row = cur.fetchone()
                if not row:
                    return _response(404, {"error": "Проект не найден"})
                return _response(200, {"project": dict(row)})

            if not user_id:
                return _response(400, {"error": "Нужен user_id"})

            # Свои проекты пользователя + закреплённые примеры (видны всем)
            owner = f"(user_id = '{_esc(user_id)}' OR is_example = true)"
            where = owner
            if module:
                where += f" AND module = '{_esc(module)}'"
            cur.execute(
                f"SELECT id, user_id, module, title, preview, is_example, created_at, updated_at "
                f"FROM {TABLE} WHERE {where} "
                f"ORDER BY is_example DESC, updated_at DESC LIMIT 100"
            )
            rows = cur.fetchall()
            return _response(200, {"projects": [dict(r) for r in rows]})
    finally:
        conn.close()


def _handle_upsert(body: dict) -> dict:
    project_id = (body.get("id") or "").strip()
    user_id = (body.get("user_id") or "").strip()
    module = (body.get("module") or "").strip()
    title = (body.get("title") or "Без названия").strip()
    data = body.get("data", {})
    preview = (body.get("preview") or "")[:500]

    if not user_id or not module:
        return _response(400, {"error": "Нужны user_id и module"})

    data_json = _esc(json.dumps(data, ensure_ascii=False))

    conn = _conn()
    try:
        with conn:
            with conn.cursor() as cur:
                if project_id:
                    cur.execute(
                        f"UPDATE {TABLE} SET title = '{_esc(title)}', "
                        f"data = '{data_json}'::jsonb, preview = '{_esc(preview)}', "
                        f"updated_at = now() "
                        f"WHERE id = '{_esc(project_id)}' AND user_id = '{_esc(user_id)}' "
                        f"RETURNING id"
                    )
                    row = cur.fetchone()
                    if not row:
                        return _response(404, {"error": "Проект не найден"})
                    return _response(200, {"success": True, "id": str(row[0])})

                cur.execute(
                    f"INSERT INTO {TABLE} (user_id, module, title, data, preview) "
                    f"VALUES ('{_esc(user_id)}', '{_esc(module)}', '{_esc(title)}', "
                    f"'{data_json}'::jsonb, '{_esc(preview)}') RETURNING id"
                )
                row = cur.fetchone()
                return _response(200, {"success": True, "id": str(row[0])})
    finally:
        conn.close()


def _handle_delete(params: dict) -> dict:
    project_id = (params.get("id") or "").strip()
    if not project_id:
        return _response(400, {"error": "Нужен id"})

    conn = _conn()
    try:
        with conn:
            with conn.cursor() as cur:
                cur.execute(
                    f"DELETE FROM {TABLE} "
                    f"WHERE id = '{_esc(project_id)}' AND is_example = false"
                )
                deleted = cur.rowcount
        if deleted == 0:
            return _response(404, {"error": "Проект не найден или это пример"})
        return _response(200, {"success": True, "deleted_id": project_id})
    finally:
        conn.close()