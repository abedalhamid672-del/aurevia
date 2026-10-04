import { Search, ShoppingBag, UserRound } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { localizedAccountPath, localizedFragrancePath, localizedHomePath } from "@shared/seo";

interface NavbarProps {
  onSearch: () => void;
  onMenu: () => void;
  bagCount: number;
  onAccount?: () => void;
  onBag?: () => void;
  dark?: boolean;
}

const links = ["Fragrances", "Men", "Women", "Unisex", "Niche", "Discovery"];

export default function Navbar({ onSearch, onMenu, bagCount, onAccount, onBag, dark = true }: NavbarProps) {
  const { locale, copy } = useLocale();
  const nextLocale = locale === "en" ? "ar" : "en";
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;
  const productSlug = currentPath.match(/^\/(?:ar\/عطر|fragrance)\/([^/]+)$/)?.[1];
  const languagePath = currentPath === "/account" || currentPath === "/ar/account" ? localizedAccountPath(nextLocale) : productSlug ? localizedFragrancePath(nextLocale, productSlug) : localizedHomePath(nextLocale);
  return (
    <header className={dark ? "hero-nav" : "site-nav"}>
      <div className="nav-cluster">
        <button className="brand-mark" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Aurevia home">Aurevia</button>
        {links.map((link) => <a key={link} className="nav-link" href={link === "Fragrances" ? "#collection" : "#discover"}>{locale === "ar" ? ({ Men: "رجال", Women: "نساء", Unisex: "للجميع", Niche: "نيتش", Discovery: "اكتشاف", Fragrances: "العطور" } as Record<string, string>)[link] : link}</a>)}
      </div>
      <div className="nav-cluster">
        <button className="nav-icon nav-link" type="button" onClick={onSearch}><Search aria-hidden="true" /> <span>{locale === "ar" ? "بحث" : "Search"}</span></button>
        <button className="nav-icon nav-link" type="button" onClick={onAccount}><UserRound aria-hidden="true" /> <span>{locale === "ar" ? "الحساب" : "Account"}</span></button>
        <button className="nav-icon nav-link" type="button" onClick={onBag}><ShoppingBag aria-hidden="true" /> <span>{locale === "ar" ? "السلة" : "Bag"}</span> <span className="bag-count">{bagCount}</span></button>
        <a className="nav-link locale-switch" href={languagePath} aria-label={`${copy.language}: ${copy.switchTo}`}>{copy.switchTo}</a>
        <button className="mobile-menu-trigger" type="button" onClick={onMenu} aria-label="Open menu">Menu</button>
      </div>
    </header>
  );
}
