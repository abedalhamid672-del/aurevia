import { X } from "lucide-react";
import { useLocale } from "@/lib/i18n";

interface MobileMenuProps { open: boolean; onClose: () => void; onSearch: () => void; }

const links = ["Fragrances", "Men", "Women", "Unisex", "Niche", "Discovery", "Brands"];

export default function MobileMenu({ open, onClose, onSearch }: MobileMenuProps) {
  const { copy, locale } = useLocale();
  const links = [copy.navFragrances, copy.navMen, copy.navWomen, copy.navUnisex, copy.navNiche, copy.navDiscovery, copy.navBrands];
  return (
    <aside className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open} aria-label={locale === "ar" ? "قائمة التنقل" : "Navigation menu"}>
      <div className="mobile-menu-header">
        <span className="brand-mark">Aurevia</span>
        <button type="button" onClick={onClose} aria-label={copy.closeMenu}><X size={20} strokeWidth={1.1} /></button>
      </div>
      <nav className="mobile-menu-links">
        {links.map((link, index) => <a key={link} href={index === 0 ? "#collection" : index === links.length - 1 ? "#brands" : "#discover"} onClick={onClose}>{link}</a>)}
        <button type="button" onClick={() => { onSearch(); onClose(); }}>{copy.navSearch}</button>
      </nav>
      <div className="mobile-menu-footer micro">{copy.footerTagline}</div>
    </aside>
  );
}
