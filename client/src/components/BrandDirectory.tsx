import { brandDirectory } from "@/data/fragrances";

export default function BrandDirectory() {
  return <section className="brand-directory" id="brands" aria-labelledby="brands-heading"><div className="brand-directory-header"><div><div className="section-index micro">03 / Directory</div><h2 id="brands-heading">Brands</h2></div><p>A considered atlas of houses, from historic icons to independent voices.</p></div><div className="brand-list">{brandDirectory.map((brand) => <a href="#collection" className="brand-item" key={brand}>{brand}</a>)}</div></section>;
}
