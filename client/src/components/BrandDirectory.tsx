import { brandDirectory } from "@/data/fragrances";
import { useLocale } from "@/lib/i18n";

export default function BrandDirectory() {
  const { locale } = useLocale();
  return <section className="brand-directory" id="brands" aria-labelledby="brands-heading"><div className="brand-directory-header"><div><div className="section-index micro">03 / {locale === "ar" ? "دليل العلامات" : "Directory"}</div><h2 id="brands-heading">{locale === "ar" ? "العلامات" : "Brands"}</h2></div><p>{locale === "ar" ? "دليل مدروس لبيوت عريقة وأصوات مستقلة في عالم العطور." : "A considered atlas of houses, from historic icons to independent voices."}</p></div><div className="brand-list">{brandDirectory.map((brand) => <a href="#collection" className="brand-item" key={brand}>{brand}</a>)}</div></section>;
}
