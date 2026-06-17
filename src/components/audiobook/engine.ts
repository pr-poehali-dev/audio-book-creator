import { useState, useCallback } from "react";
import { AI_URL, PROJECTS_URL, TTS_URL, AVATAR_IMAGE_URL, USER_ID } from "@/components/audiobook/audiobook-data";

/* ─────────────────────────────────────────────────────────────────────────────
   ДВИЖОК ТВОРЧЕСКИХ МОДУЛЕЙ
   useAI       — генерация текста через Polza.ai
   useSave     — сохранение/загрузка проектов в БД
   useTTS      — озвучка любого текста в MP3
   useAvatarImage — генерация изображения аватара
   ───────────────────────────────────────────────────────────────────────────── */

interface AIResult {
  text: string;
  json: unknown[];
}

export function useAI(model = "openai/gpt-4o-mini") {
  const [loading, setLoading] = useState(false);
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [error, setError] = useState("");

  const generate = useCallback(
    async (task: string, payload: Record<string, unknown>): Promise<AIResult | null> => {
      setLoading(true);
      setLoadingTask(task);
      setError("");
      try {
        const res = await fetch(AI_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task, payload, model }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Ошибка генерации");
        }
        return { text: data.text || "", json: data.json || [] };
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Не удалось сгенерировать");
        return null;
      } finally {
        setLoading(false);
        setLoadingTask(null);
      }
    },
    [model],
  );

  return { generate, loading, loadingTask, error, setError };
}

/* ─── Сохранение проектов ─────────────────────────────────────────────────── */

export interface SavedProject {
  id: string;
  module: string;
  title: string;
  preview?: string;
  created_at: string;
  updated_at: string;
  data?: Record<string, unknown>;
}

export function useSave(module: string) {
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const save = useCallback(
    async (id: string | null, title: string, data: Record<string, unknown>, preview = ""): Promise<string | null> => {
      setSaving(true);
      try {
        const res = await fetch(PROJECTS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: id || undefined, user_id: USER_ID, module, title, data, preview }),
        });
        const result = await res.json();
        if (result.success) {
          setSavedAt(new Date());
          return result.id as string;
        }
        return null;
      } catch {
        return null;
      } finally {
        setSaving(false);
      }
    },
    [module],
  );

  const list = useCallback(async (): Promise<SavedProject[]> => {
    try {
      const res = await fetch(`${PROJECTS_URL}?user_id=${USER_ID}&module=${module}`);
      const data = await res.json();
      return data.projects || [];
    } catch {
      return [];
    }
  }, [module]);

  const load = useCallback(async (id: string): Promise<SavedProject | null> => {
    try {
      const res = await fetch(`${PROJECTS_URL}?id=${id}`);
      const data = await res.json();
      return data.project || null;
    } catch {
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`${PROJECTS_URL}?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      return !!data.success;
    } catch {
      return false;
    }
  }, []);

  return { save, list, load, remove, saving, savedAt };
}

/* ─── Озвучка текста ───────────────────────────────────────────────────────── */

export function useTTS() {
  const [voicing, setVoicing] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");

  const voice = useCallback(
    async (text: string, title: string, voiceId = "alena", speed = 1.0): Promise<string | null> => {
      if (!text.trim()) {
        setError("Нет текста для озвучки");
        return null;
      }
      setVoicing(true);
      setError("");
      setAudioUrl("");
      try {
        const res = await fetch(TTS_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: text.slice(0, 5000), voice_id: voiceId, speed, user_id: USER_ID, title }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Ошибка озвучки");
        setAudioUrl(data.audio_url);
        return data.audio_url as string;
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Не удалось озвучить");
        return null;
      } finally {
        setVoicing(false);
      }
    },
    [],
  );

  return { voice, voicing, audioUrl, setAudioUrl, error, setError };
}

/* ─── Генерация изображения аватара ────────────────────────────────────────── */

export function useAvatarImage() {
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  const generateImage = useCallback(async (prompt: string): Promise<string | null> => {
    if (!prompt.trim()) {
      setError("Нужно описание внешности");
      return null;
    }
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(AVATAR_IMAGE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Ошибка генерации");
      setImageUrl(data.image_url);
      return data.image_url as string;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Не удалось создать аватар");
      return null;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generateImage, generating, imageUrl, setImageUrl, error, setError };
}