import { X } from "lucide-react";

interface MobileMenuProps { open: boolean; onClose: () => void; onSearch: () => void; }

const links = ["Fragrances", "Men", "Women", "Unisex", "Niche", "Discovery", "Brands"];

export default function MobileMenu({ open, onClose, onSearch }: MobileMenuProps) {
  return (
    <aside className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="mobile-menu-header">
        <span className="brand-mark">Aurevia</span>
        <button type="button" onClick={onClose} aria-label="Close menu"><X size={20} strokeWidth={1.1} /></button>
      </div>
      <nav className="mobile-menu-links">
        {links.map((link) => <a key={link} href={link === "Fragrances" ? "#collection" : link === "Brands" ? "#brands" : "#discover"} onClick={onClose}>{link}</a>)}
        <button type="button" onClick={() => { onSearch(); onClose(); }}>Search</button>
      </nav>
      <div className="mobile-menu-footer micro">Exceptional fragrances. Precisely chosen.</div>
    </aside>
  );
}
