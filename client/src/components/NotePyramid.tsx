import type { Fragrance } from "@/types/fragrance";

export default function NotePyramid({ fragrance }: { fragrance: Fragrance }) {
  const rows = [["Top", fragrance.notes.top], ["Heart", fragrance.notes.heart], ["Base", fragrance.notes.base]] as const;
  return <div className="note-pyramid">{rows.map(([label, notes]) => <div className="note-row" key={label}><div className="note-label micro">{label}</div><div className="note-pills">{notes.length ? notes.map((note) => <span className="note-pill" key={note}>{note}</span>) : <span className="note-pill">Not supplied</span>}</div></div>)}</div>;
}
