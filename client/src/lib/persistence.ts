import { useEffect, useState } from "react";

export function readStoredIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? Array.from(new Set(value.filter((item): item is string => typeof item === "string"))) : [];
  } catch {
    return [];
  }
}

export function writeStoredIds(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // Storage can be unavailable in private browsing or restricted webviews.
  }
}

export function usePersistentIds(key: string) {
  const [ids, setIds] = useState<string[]>(() => readStoredIds(key));

  useEffect(() => {
    writeStoredIds(key, ids);
  }, [key, ids]);

  return [ids, setIds] as const;
}
