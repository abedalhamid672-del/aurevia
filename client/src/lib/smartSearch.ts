import type { Fragrance, Gender } from "@/types/fragrance";
import { getAllNotes } from "@/types/fragrance";

export type ScentPreferences = {
  accords: string[];
  notes: string[];
  gender: Gender | "All";
};

export const DEFAULT_SCENT_PREFERENCES: ScentPreferences = { accords: [], notes: [], gender: "All" };
export const SMART_ACCORDS = ["Woody", "Floral", "Amber", "Citrus", "Fresh", "Musky", "Spicy", "Sweet"];
export const SMART_NOTES = ["Vanilla", "Rose", "Sandalwood", "Oud", "Bergamot", "Jasmine", "Musk", "Ginger"];
const PROFILE_KEY = "aurevia:scent-profile:v1";

export function readScentPreferences(): ScentPreferences {
  if (typeof window === "undefined") return DEFAULT_SCENT_PREFERENCES;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROFILE_KEY) ?? "null") as Partial<ScentPreferences> | null;
    return {
      accords: Array.isArray(parsed?.accords) ? parsed.accords.filter((value): value is string => typeof value === "string") : [],
      notes: Array.isArray(parsed?.notes) ? parsed.notes.filter((value): value is string => typeof value === "string") : [],
      gender: parsed?.gender === "Women" || parsed?.gender === "Men" || parsed?.gender === "Unisex" ? parsed.gender : "All",
    };
  } catch {
    return DEFAULT_SCENT_PREFERENCES;
  }
}

export function writeScentPreferences(preferences: ScentPreferences) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(preferences)); } catch { /* restricted storage */ }
}

export function scoreFragrance(fragrance: Fragrance, query: string, preferences: ScentPreferences) {
  const haystack = [fragrance.brand, fragrance.name, fragrance.family, fragrance.concentration, fragrance.accords.join(" "), getAllNotes(fragrance).join(" ")].join(" ").toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();
  let score = normalizedQuery ? (haystack.includes(normalizedQuery) ? 12 : 0) : 0;
  score += preferences.gender !== "All" && fragrance.gender === preferences.gender ? 4 : 0;
  score += preferences.accords.reduce((total, accord) => total + (fragrance.accords.includes(accord) ? 5 : 0), 0);
  score += preferences.notes.reduce((total, note) => total + (getAllNotes(fragrance).includes(note) ? 6 : 0), 0);
  return score;
}

export function getSmartMatches(fragrances: Fragrance[], query: string, preferences: ScentPreferences) {
  return fragrances
    .map((fragrance) => ({ fragrance, score: scoreFragrance(fragrance, query, preferences) }))
    .filter(({ score, fragrance }) => score > 0 || (!query.trim() && fragrance.dataStatus === "provider"))
    .sort((a, b) => b.score - a.score || a.fragrance.name.localeCompare(b.fragrance.name));
}
