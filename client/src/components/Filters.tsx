import React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { FragranceFilters, Gender } from "@/types/fragrance";
import { ACCORD_OPTIONS, AVAILABILITY_OPTIONS, CONCENTRATION_OPTIONS, FAMILY_OPTIONS, GENDER_OPTIONS, YEAR_OPTIONS } from "@/types/fragrance";
import { useLocale } from "@/lib/i18n";

interface FiltersProps { filters: FragranceFilters; brands?: string[]; onChange: (next: FragranceFilters) => void; onReset: () => void; }

type SelectFilter = { key: keyof FragranceFilters; labelKey: "filterBrand" | "filterGender" | "filterConcentration" | "filterFamily" | "filterAccord" | "filterAvailability" | "filterYear"; options: string[] };
const selectFilters: SelectFilter[] = [
  { key: "brand", labelKey: "filterBrand", options: ["All"] },
  { key: "gender", labelKey: "filterGender", options: GENDER_OPTIONS },
  { key: "concentration", labelKey: "filterConcentration", options: CONCENTRATION_OPTIONS },
  { key: "family", labelKey: "filterFamily", options: FAMILY_OPTIONS },
  { key: "accord", labelKey: "filterAccord", options: ACCORD_OPTIONS },
  { key: "availability", labelKey: "filterAvailability", options: AVAILABILITY_OPTIONS },
  { key: "year", labelKey: "filterYear", options: YEAR_OPTIONS },
];

export default function Filters({ filters, brands = [], onChange, onReset }: FiltersProps) {
  const { copy, locale } = useLocale();
  const [open, setOpen] = React.useState(false);
  const update = (key: keyof FragranceFilters, value: string) => onChange({ ...filters, [key]: value });
  const renderControl = (item: SelectFilter) => {
    const options = item.key === "brand" ? ["All", ...brands] : item.options;
    const optionLabel = (option: string) => {
      if (locale !== "ar") return option;
      const labels: Record<string, string> = { All: "الكل", Women: "نساء", Men: "رجال", Unisex: "للجميع", "Eau de Parfum": "ماء عطر", "Eau de Parfum Intense": "ماء عطر مكثف", "Eau de Toilette": "ماء تواليت", "Eau de Toilette Intense": "ماء تواليت مكثف", Parfum: "عطر مركز", "In stock": "متوفر", "Out of stock": "غير متوفر", "Price unavailable": "السعر غير متاح" };
      return labels[option] ?? option;
    };
    return <label key={item.key} className="drawer-group"><span className="filter-label">{copy[item.labelKey]}</span><select className="filter-control" value={(filters[item.key] as string) ?? "All"} onChange={(event) => update(item.key, event.target.value)}>{options.map((option) => <option key={option} value={option}>{optionLabel(option)}</option>)}</select></label>;
  };
  return (
    <>
      <div className="catalog-toolbar">
        <div className="filter-list">{selectFilters.map(renderControl)}</div>
        <button type="button" className="filter-toggle" onClick={() => setOpen(true)}><SlidersHorizontal size={14} /> {copy.filters}</button>
        <button type="button" className="text-button invert" onClick={onReset}>{copy.reset}</button>
      </div>
      <div className={`filter-drawer-backdrop ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <section className={`filter-drawer ${open ? "open" : ""}`} aria-label={copy.filters}>
        <div className="drawer-header"><span className="micro">{copy.refineSelection}</span><button type="button" onClick={() => setOpen(false)} aria-label={copy.close}><X size={18} strokeWidth={1.1} /></button></div>
        <div className="drawer-grid">{selectFilters.map(renderControl)}</div>
        <button type="button" className="dark-button" style={{ marginTop: 26 }} onClick={() => setOpen(false)}>{copy.applyFilters}</button>
      </section>
    </>
  );
}
