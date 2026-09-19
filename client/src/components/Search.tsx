import { Search as SearchIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Fragrance } from "@/types/fragrance";
import { getDisplayPrice } from "@/types/fragrance";

interface SearchProps { open: boolean; fragrances: Fragrance[]; onClose: () => void; onOpenProduct: (fragrance: Fragrance) => void; }

export default function Search({ open, fragrances, onClose, onOpenProduct }: SearchProps) {
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");
  useEffect(() => { const timeout = window.setTimeout(() => setDebounced(value), 160); return () => window.clearTimeout(timeout); }, [value]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; return () => { document.body.style.overflow = ""; }; }, [open]);
  const results = debounced.trim() ? fragrances.filter((fragrance) => `${fragrance.brand} ${fragrance.name} ${fragrance.family} ${fragrance.accords.join(" ")} ${Object.values(fragrance.notes).flat().join(" ")}`.toLowerCase().includes(debounced.toLowerCase())).slice(0, 6) : fragrances.slice(0, 4);
  return (
    <section className={`search-overlay ${open ? "open" : ""}`} aria-label="Search fragrances" aria-hidden={!open}>
      <div className="search-header"><span className="brand-mark">Aurevia / Search</span><button className="search-close" type="button" onClick={onClose} aria-label="Close search"><X size={16} strokeWidth={1.1} /></button></div>
      <div className="search-input-wrap"><SearchIcon aria-hidden="true" /><input autoFocus={open} className="search-input" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search brand, note, accord..." aria-label="Search brand, note, accord" /></div>
      <div className="search-results">
        {results.map((fragrance) => <button className="search-result" type="button" key={fragrance.id} onClick={() => { onOpenProduct(fragrance); onClose(); }}><img src={fragrance.image} alt="" /><span><span className="micro">{fragrance.brand}</span><span className="search-result-name">{fragrance.name}</span><span className="micro" style={{ display: "block", marginTop: 8, color: "#8c8c88" }}>{getDisplayPrice(fragrance)}</span></span></button>)}
        {!results.length && <div className="empty-state" style={{ gridColumn: "1 / -1" }}><h3>No fragrance found</h3><p>Try a brand, note, accord, or perfumer.</p></div>}
      </div>
    </section>
  );
}
