import { Search as SearchIcon, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { Fragrance, Gender } from "@/types/fragrance";
import { getDisplayPrice } from "@/types/fragrance";
import { DEFAULT_SCENT_PREFERENCES, SMART_ACCORDS, SMART_NOTES, getSmartMatches, readScentPreferences, writeScentPreferences, type ScentPreferences } from "@/lib/smartSearch";
import { useLocale } from "@/lib/i18n";

interface SearchProps { open: boolean; fragrances: Fragrance[]; onClose: () => void; onOpenProduct: (fragrance: Fragrance) => void; }

export default function Search({ open, fragrances, onClose, onOpenProduct }: SearchProps) {
  const { copy, locale } = useLocale();
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  const [preferences, setPreferences] = useState<ScentPreferences>(() => readScentPreferences());
  const [showPreferences, setShowPreferences] = useState(false);
  useEffect(() => { const timeout = window.setTimeout(() => setDebounced(value), 160); return () => window.clearTimeout(timeout); }, [value]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  useEffect(() => { writeScentPreferences(preferences); }, [preferences]);
  const matches = useMemo(() => getSmartMatches(fragrances, debounced, preferences), [fragrances, debounced, preferences]);
  const results = matches.slice(0, 8);
  const toggle = (key: "accords" | "notes", value: string) => setPreferences((current) => ({ ...current, [key]: current[key].includes(value) ? current[key].filter((item) => item !== value) : [...current[key], value] }));
  const activePreferenceCount = preferences.accords.length + preferences.notes.length + (preferences.gender === "All" ? 0 : 1);
  return (
    <section className={`search-overlay ${open ? "open" : ""}`} aria-label={copy.searchLabel} aria-hidden={!open}>
      <div className="search-header"><span className="brand-mark">Aurevia / {locale === "ar" ? "البحث الذكي" : "Smart Search"}</span><button className="search-close" type="button" onClick={onClose} aria-label={copy.closeSearch}><X size={16} strokeWidth={1.1} /></button></div>
      <div className="search-input-wrap"><SearchIcon aria-hidden="true" /><input autoFocus={open} className="search-input" value={value} onChange={(event) => setValue(event.target.value)} placeholder={copy.searchPlaceholder} aria-label={copy.searchAria} /><button className={`search-preferences-toggle ${showPreferences ? "active" : ""}`} type="button" onClick={() => setShowPreferences((current) => !current)} aria-label={copy.tune}><SlidersHorizontal size={17} /><span>{activePreferenceCount ? `${activePreferenceCount} ${copy.tuned}` : copy.tune}</span></button></div>
      {showPreferences && <div className="smart-preferences"><div className="smart-preference-group"><span className="micro">{copy.whoIsItFor}</span><div className="smart-chips">{(["All", "Women", "Men", "Unisex"] as Array<Gender | "All">).map((gender) => <button key={gender} type="button" className={preferences.gender === gender ? "smart-chip active" : "smart-chip"} onClick={() => setPreferences((current) => ({ ...current, gender }))}>{locale === "ar" ? ({ All: "الكل", Women: "نساء", Men: "رجال", Unisex: "للجميع" } as Record<string, string>)[gender] : gender}</button>)}</div></div><div className="smart-preference-group"><span className="micro">{copy.accordsYouLove}</span><div className="smart-chips">{SMART_ACCORDS.map((accord) => <button key={accord} type="button" className={preferences.accords.includes(accord) ? "smart-chip active" : "smart-chip"} onClick={() => toggle("accords", accord)}>{accord}</button>)}</div></div><div className="smart-preference-group"><span className="micro">{copy.notesYouWant}</span><div className="smart-chips">{SMART_NOTES.map((note) => <button key={note} type="button" className={preferences.notes.includes(note) ? "smart-chip active" : "smart-chip"} onClick={() => toggle("notes", note)}>{note}</button>)}</div></div><button className="text-button smart-reset" type="button" onClick={() => setPreferences(DEFAULT_SCENT_PREFERENCES)}>{copy.resetPreferences}</button></div>}
      <div className="smart-search-heading"><div><span className="micro"><Sparkles size={12} /> {copy.intelligence}</span><h2>{debounced || activePreferenceCount ? copy.compatibleTraces : copy.beginFeeling}</h2></div><span className="micro">{results.length} {copy.consideredMatches}</span></div>
      <div className="search-results">{results.map(({ fragrance, score }) => <button className="search-result smart-result" type="button" key={fragrance.id} onClick={() => { onOpenProduct(fragrance); onClose(); }}><img src={fragrance.image} alt="" /><span><span className="micro">{fragrance.brand}</span><span className="search-result-name">{fragrance.name}</span><span className="smart-match-label">{score >= 10 ? copy.strongMatch : score > 0 ? copy.goodMatch : copy.curatedForYou} · {getDisplayPrice(fragrance) === "Price unavailable" ? copy.priceUnavailable : getDisplayPrice(fragrance)}</span></span><span className="smart-result-arrow">↗</span></button>)}{!results.length && <div className="empty-state" style={{ gridColumn: "1 / -1" }}><h3>{copy.noCloseTrace}</h3><p>{copy.tryNote}</p></div>}</div>
    </section>
  );
}
