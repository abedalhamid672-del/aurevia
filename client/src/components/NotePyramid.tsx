import type { Fragrance } from "@/types/fragrance";
import { useLocale } from "@/lib/i18n";

export default function NotePyramid({ fragrance }: { fragrance: Fragrance }) {
  const { locale, copy } = useLocale();
  const rows = [[locale === "ar" ? "المقدمة" : "Top", fragrance.notes.top], [locale === "ar" ? "القلب" : "Heart", fragrance.notes.heart], [locale === "ar" ? "القاعدة" : "Base", fragrance.notes.base]] as const;
  return <div className="note-pyramid">{rows.map(([label, notes]) => <div className="note-row" key={label}><div className="note-label micro">{label}</div><div className="note-pills">{notes.length ? notes.map((note) => <span className="note-pill" key={note}>{note}</span>) : <span className="note-pill">{copy.notSupplied}</span>}</div></div>)}</div>;
}
