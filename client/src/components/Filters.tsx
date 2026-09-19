import React from "react";
import { SlidersHorizontal, X } from "lucide-react";
import type { FragranceFilters, Gender } from "@/types/fragrance";
import { ACCORD_OPTIONS, AVAILABILITY_OPTIONS, CONCENTRATION_OPTIONS, FAMILY_OPTIONS, GENDER_OPTIONS, YEAR_OPTIONS } from "@/types/fragrance";

interface FiltersProps { filters: FragranceFilters; brands?: string[]; onChange: (next: FragranceFilters) => void; onReset: () => void; }

type SelectFilter = { key: keyof FragranceFilters; label: string; options: string[] };
const selectFilters: SelectFilter[] = [
  { key: "brand", label: "Brand", options: ["All"] },
  { key: "gender", label: "Gender", options: GENDER_OPTIONS },
  { key: "concentration", label: "Concentration", options: CONCENTRATION_OPTIONS },
  { key: "family", label: "Family", options: FAMILY_OPTIONS },
  { key: "accord", label: "Accord", options: ACCORD_OPTIONS },
  { key: "availability", label: "Availability", options: AVAILABILITY_OPTIONS },
  { key: "year", label: "Year", options: YEAR_OPTIONS },
];

export default function Filters({ filters, brands = [], onChange, onReset }: FiltersProps) {
  const [open, setOpen] = React.useState(false);
  const update = (key: keyof FragranceFilters, value: string) => onChange({ ...filters, [key]: value });
  const renderControl = (item: SelectFilter) => {
    const options = item.key === "brand" ? ["All", ...brands] : item.options;
    return <label key={item.key} className="drawer-group"><span className="filter-label">{item.label}</span><select className="filter-control" value={(filters[item.key] as string) ?? "All"} onChange={(event) => update(item.key, event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
  };
  return (
    <>
      <div className="catalog-toolbar">
        <div className="filter-list">{selectFilters.map(renderControl)}</div>
        <button type="button" className="filter-toggle" onClick={() => setOpen(true)}><SlidersHorizontal size={14} /> Filters</button>
        <button type="button" className="text-button invert" onClick={onReset}>Reset</button>
      </div>
      <div className={`filter-drawer-backdrop ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <section className={`filter-drawer ${open ? "open" : ""}`} aria-label="Filter fragrances">
        <div className="drawer-header"><span className="micro">Refine selection</span><button type="button" onClick={() => setOpen(false)} aria-label="Close filters"><X size={18} strokeWidth={1.1} /></button></div>
        <div className="drawer-grid">{selectFilters.map(renderControl)}</div>
        <button type="button" className="dark-button" style={{ marginTop: 26 }} onClick={() => setOpen(false)}>Apply filters</button>
      </section>
    </>
  );
}
