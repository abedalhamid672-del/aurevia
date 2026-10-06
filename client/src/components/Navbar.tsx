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

export default function Navbar({ onSearch, onMenu, bagCount, onAccount, onBag, dark = true }: NavbarProps) {
  const { locale, copy } = useLocale();
  const nextLocale = locale === "en" ? "ar" : "en";
  const currentPath = typeof window === "undefined" ? "/" : window.location.pathname;
  const productSlug = currentPath.match(/^\/(?:ar\/عطر|fragrance)\/([^/]+)$/)?.[1];
  const languagePath = currentPath === "/account" || currentPath === "/ar/account" ? localizedAccountPath(nextLocale) : productSlug ? localizedFragrancePath(nextLocale, productSlug) : localizedHomePath(nextLocale);
  return (
    <header className={dark ? "hero-nav" : "site-nav"}>
      <div className="nav-cluster">
        <button className="brand-mark" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label={locale === "ar" ? "العودة إلى أوريفيا" : "Aurevia home"}>Aurevia</button>
        {[copy.navFragrances, copy.navMen, copy.navWomen, copy.navUnisex, copy.navNiche, copy.navDiscovery].map((link, index) => <a key={link} className="nav-link" href={index === 0 ? "#collection" : "#discover"}>{link}</a>)}
      </div>
      <div className="nav-cluster">
        <button className="nav-icon nav-link" type="button" onClick={onSearch} aria-label={copy.navSearch}><Search aria-hidden="true" /> <span>{copy.navSearch}</span></button>
        <button className="nav-icon nav-link" type="button" onClick={onAccount} aria-label={copy.navAccount}><UserRound aria-hidden="true" /> <span>{copy.navAccount}</span></button>
        <button className="nav-icon nav-link" type="button" onClick={onBag} aria-label={`${copy.navBag}${bagCount ? ` (${bagCount})` : ""}`}><ShoppingBag aria-hidden="true" /> <span>{copy.navBag}</span> <span className="bag-count">{bagCount}</span></button>
        <a className="nav-link locale-switch" href={languagePath} aria-label={`${copy.language}: ${copy.switchTo}`}>{copy.switchTo}</a>
        <button className="mobile-menu-trigger" type="button" onClick={onMenu} aria-label={locale === "ar" ? "فتح القائمة" : "Open menu"}>{locale === "ar" ? "القائمة" : "Menu"}</button>
      </div>
    </header>
  );
}
