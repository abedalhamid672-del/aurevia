import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import Hero from "@/components/Hero";
import MobileMenu from "@/components/MobileMenu";
import Search from "@/components/Search";
import Filters from "@/components/Filters";
import FragranceGrid from "@/components/FragranceGrid";
import FragranceDetail from "@/components/FragranceDetail";
import BrandDirectory from "@/components/BrandDirectory";
import { fragrances } from "@/data/fragrances";
import type { Fragrance, FragranceFilters, SortOption } from "@/types/fragrance";
import { DEVELOPMENT_DATA_NOTICE, SORT_LABELS, sortFragrances, matchesFilters } from "@/types/fragrance";

const defaultFilters: FragranceFilters = { brand: "All", gender: "All", concentration: "All", family: "All", note: "All", accord: "All", availability: "All", year: "All" };

export default function Home() {
  const [selected, setSelected] = useState<Fragrance | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<FragranceFilters>(defaultFilters);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [bagCount] = useState(0);
  const brands = useMemo(() => Array.from(new Set(fragrances.map((item) => item.brand))).sort(), []);
  const results = useMemo(() => sortFragrances(fragrances.filter((fragrance) => matchesFilters(fragrance, query, filters)), sort), [query, filters, sort]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    const path = window.location.pathname;
    const slug = path.startsWith("/fragrance/") ? path.replace("/fragrance/", "") : "";
    if (slug) setSelected(fragrances.find((item) => item.slug === slug) ?? null);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!elements.length) return;
    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [selected]);

  const openProduct = (fragrance: Fragrance) => {
    setSelected(fragrance);
    window.history.pushState({}, "", `/fragrance/${fragrance.slug}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const backToCollection = () => {
    setSelected(null);
    window.history.pushState({}, "", "/");
    window.scrollTo({ top: document.getElementById("collection")?.offsetTop ?? 0, behavior: "smooth" });
  };

  const resetFilters = () => { setFilters(defaultFilters); setQuery(""); setSort("relevance"); };

  if (selected) return <FragranceDetail fragrance={selected} onBack={backToCollection} />;

  return <div className="site-shell">
    <Search open={searchOpen} fragrances={fragrances} onClose={() => setSearchOpen(false)} onOpenProduct={openProduct} />
    <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} onSearch={() => setSearchOpen(true)} />
    <Hero onSearch={() => setSearchOpen(true)} onMenu={() => setMenuOpen(true)} bagCount={bagCount} />
    <main id="collection" className="collection">
      <section className="collection-intro" data-reveal><div><div className="collection-kicker micro">01 / The collection</div><h2 className="collection-title">The<br />collection</h2></div><div className="collection-deck"><p>A considered selection of exceptional fragrances.</p><button type="button" className="text-button invert" onClick={() => document.getElementById("discover")?.scrollIntoView({ behavior: "smooth" })}>Enter the world</button></div></section>
      <div className="notice-bar" data-reveal><span>{DEVELOPMENT_DATA_NOTICE}</span><span>No fictional products, prices, or reviews are displayed.</span></div>
      <Filters filters={filters} brands={brands} onChange={setFilters} onReset={resetFilters} />
      <section className="catalog-body" data-reveal aria-labelledby="catalog-heading"><div className="catalog-toolbar" style={{ padding: "0 0 26px", borderBottom: 0 }}><span id="catalog-heading" className="results-count micro">{results.length} fragrances · real catalog entries</span><label className="drawer-group" style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="filter-label">Sort</span><select className="filter-control" value={sort} onChange={(event) => setSort(event.target.value as SortOption)}>{Object.entries(SORT_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><ChevronDown size={13} strokeWidth={1.1} /></label></div><FragranceGrid fragrances={results} onOpen={openProduct} /></section>
    </main>
    <section id="discover" className="editorial" data-reveal><div className="editorial-top"><div><div className="section-index micro">02 / The world of fragrance</div><h2 className="editorial-title">The world<br />of fragrance</h2></div><p className="editorial-copy">Fragrance is an invisible architecture. A memory, a material, a trace left in the air.</p></div><div className="editorial-grid"><article className="editorial-card"><div className="micro">Notes</div><h3>Composition<br />as language.</h3><p>Top, heart, base. A quiet structure that reveals itself over time.</p></article><article className="editorial-card"><div className="micro">Discovery</div><h3>Find<br />your trace.</h3><a className="text-button" href="#collection">Explore the edit</a></article><article className="editorial-card"><div className="micro">Aurevia</div><h3>Precise<br />selection.</h3><p>Real houses. Real fragrances. Clear data where it matters.</p></article></div></section>
    <div data-reveal><BrandDirectory /></div>
    <footer className="site-footer"><span>© 2026 Aurevia</span><span>Exceptional fragrances. Precisely chosen.</span><span>Real product data · transparent offers</span></footer>
  </div>;
}
