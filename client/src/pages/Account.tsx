import { ArrowLeft, GitCompare, Heart, LogIn, X } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { fragrances } from "@/data/fragrances";
import { usePersistentIds } from "@/lib/persistence";
import { useLocale } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { getDisplayPrice, getDisplaySize } from "@/types/fragrance";
import { localizedFragrancePath, localizedHomePath } from "@shared/seo";

export default function Account() {
  const [, setLocation] = useLocation();
  const { locale, copy } = useLocale();
  const { data: account, isLoading: accountLoading } = trpc.auth.me.useQuery();
  const { data: remoteWishlist = [], isLoading: wishlistLoading } = trpc.wishlist.list.useQuery(undefined, { enabled: Boolean(account) });
  const removeWishlist = trpc.wishlist.remove.useMutation();
  const [localWishlist, setLocalWishlist] = usePersistentIds("aurevia:wishlist:v1");
  const [compare] = usePersistentIds("aurevia:compare:v1");
  const [cart] = usePersistentIds("aurevia:cart:v1");
  const wishlistIds = useMemo(() => Array.from(new Set([...localWishlist, ...remoteWishlist])), [localWishlist, remoteWishlist]);
  const wishlistItems = fragrances.filter((item) => wishlistIds.includes(item.id));
  const compareItems = fragrances.filter((item) => compare.includes(item.id));
  const homePath = localizedHomePath(locale);
  const remove = (id: string) => {
    setLocalWishlist((items) => items.filter((item) => item !== id));
    if (account) removeWishlist.mutate({ fragranceId: id });
  };

  return <main className="account-page">
    <header className="account-page-header"><button className="text-button" type="button" onClick={() => setLocation(homePath)}><ArrowLeft size={14} /> {copy.backToCollection}</button><span className="brand-mark">Aurevia</span><span className="micro">{copy.personalArchive}</span></header>
    <section className="account-hero"><div><div className="micro">{copy.account}</div><h1>{account ? <>{locale === "ar" ? <>طقسك،<br />محفوظ.</> : <>Your ritual,<br />remembered.</>}</> : <>{locale === "ar" ? <>احتفظ بطقسك،<br />قريباً.</> : <>Keep your ritual,<br />close.</>}</>}</h1></div><div className="account-intro"><p>{account ? `${locale === "ar" ? "مرحباً بعودتك، " : "Welcome back, "}${account.name || account.email || (locale === "ar" ? "عضو أوريفيا" : "Aurevia member")}. ${locale === "ar" ? "قائمة رغباتك متزامنة عبر الأجهزة المسجّل دخولك عليها." : "Your wishlist is synced across signed-in devices."}` : copy.accountSyncGuest}</p>{!account && <button className="dark-button" type="button" onClick={() => startLogin()}><LogIn size={15} /> {copy.signInSync}</button>}</div></section>
    {accountLoading || wishlistLoading ? <div className="account-loading">{copy.loadingArchive}</div> : <>
      <section className="account-summary"><div><strong>{wishlistItems.length}</strong><span>{copy.savedFragrances}</span></div><div><strong>{compareItems.length}</strong><span>{copy.compared}</span></div><div><strong>{cart.length}</strong><span>{copy.inYourBag}</span></div></section>
      <section className="account-section"><div className="account-section-heading"><div><span className="micro"><Heart size={12} /> {copy.wishlist}</span><h2>{locale === "ar" ? "روائح تستحق العودة إليها." : "Scents worth returning to."}</h2></div><span className="micro">{wishlistItems.length} {copy.saved}</span></div>{wishlistItems.length ? <div className="account-product-grid">{wishlistItems.map((item) => <article className="account-product" key={item.id}><button type="button" className="account-product-image" onClick={() => setLocation(localizedFragrancePath(locale, item.slug))}><img src={item.image} alt={`${item.brand} ${item.name}`} /></button><div className="account-product-copy"><span className="micro">{item.brand}</span><h3>{item.name}</h3><p>{getDisplayPrice(item) === "Price unavailable" ? copy.priceUnavailable : getDisplayPrice(item)} · {getDisplaySize(item)}</p><div><button className="text-button" type="button" onClick={() => setLocation(localizedFragrancePath(locale, item.slug))}>{copy.viewScent}</button><button className="icon-text-button" type="button" onClick={() => remove(item.id)} aria-label={`${locale === "ar" ? "إزالة" : "Remove"} ${item.name} ${copy.wishlist}`}><X size={14} /></button></div></div></article>)}</div> : <div className="account-empty"><Heart size={18} /><p>{copy.emptyWishlist}</p><button className="outline-button" type="button" onClick={() => setLocation(homePath)}>{copy.exploreFragrances}</button></div>}</section>
      <section className="account-section comparison-section"><div className="account-section-heading"><div><span className="micro"><GitCompare size={12} /> {copy.comparison}</span><h2>{locale === "ar" ? "اكتشف الفروق." : "See the difference."}</h2></div><span className="micro">{compareItems.length} {copy.selected}</span></div>{compareItems.length ? <div className="account-compare-grid">{compareItems.map((item) => <article key={item.id}><img src={item.image} alt={`${item.brand} ${item.name}`} /><span className="micro">{item.brand}</span><h3>{item.name}</h3><p>{item.family}</p><small>{locale === "ar" ? "المقدمة" : "Top"} · {item.notes.top.join(" · ")}</small><small>{locale === "ar" ? "القاعدة" : "Base"} · {item.notes.base.join(" · ")}</small></article>)}</div> : <div className="account-empty"><GitCompare size={18} /><p>{copy.emptyComparison}</p><button className="outline-button" type="button" onClick={() => setLocation(`${homePath}#collection`)}>{copy.compare} {copy.fragrances}</button></div>}</section>
    </>}
  </main>;
}
