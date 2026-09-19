import { Search, ShoppingBag, UserRound } from "lucide-react";

interface NavbarProps {
  onSearch: () => void;
  onMenu: () => void;
  bagCount: number;
  dark?: boolean;
}

const links = ["Fragrances", "Men", "Women", "Unisex", "Niche", "Discovery"];

export default function Navbar({ onSearch, onMenu, bagCount, dark = true }: NavbarProps) {
  return (
    <header className={dark ? "hero-nav" : "site-nav"}>
      <div className="nav-cluster">
        <button className="brand-mark" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Aurevia home">Aurevia</button>
        {links.map((link) => <a key={link} className="nav-link" href={link === "Fragrances" ? "#collection" : "#discover"}>{link}</a>)}
      </div>
      <div className="nav-cluster">
        <button className="nav-icon nav-link" type="button" onClick={onSearch}><Search aria-hidden="true" /> <span>Search</span></button>
        <button className="nav-icon nav-link" type="button" onClick={() => window.alert("Account access will connect to Manus OAuth in the next integration step.")}><UserRound aria-hidden="true" /> <span>Account</span></button>
        <button className="nav-icon nav-link" type="button" onClick={() => window.alert("Bag is ready for a real checkout provider connection.")}><ShoppingBag aria-hidden="true" /> <span>Bag</span> <span className="bag-count">{bagCount}</span></button>
        <button className="mobile-menu-trigger" type="button" onClick={onMenu} aria-label="Open menu">Menu</button>
      </div>
    </header>
  );
}
