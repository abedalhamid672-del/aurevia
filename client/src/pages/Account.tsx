import { ArrowLeft, GitCompare, Heart, LogIn, ShoppingBag, X } from "lucide-react";
import { useMemo } from "react";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { fragrances } from "@/data/fragrances";
import { usePersistentIds } from "@/lib/persistence";
import { trpc } from "@/lib/trpc";
import { getDisplayPrice, getDisplaySize } from "@/types/fragrance";

export default function Account() {
  const [, setLocation] = useLocation();
  const { data: account, isLoading: accountLoading } = trpc.auth.me.useQuery();
  const { data: remoteWishlist = [], isLoading: wishlistLoading } = trpc.wishlist.list.useQuery(undefined, { enabled: Boolean(account) });
  const removeWishlist = trpc.wishlist.remove.useMutation();
  const [localWishlist, setLocalWishlist] = usePersistentIds("aurevia:wishlist:v1");
  const [compare] = usePersistentIds("aurevia:compare:v1");
  const [cart] = usePersistentIds("aurevia:cart:v1");
  const wishlistIds = useMemo(() => Array.from(new Set([...localWishlist, ...remoteWishlist])), [localWishlist, remoteWishlist]);
  const wishlistItems = fragrances.filter((item) => wishlistIds.includes(item.id));
  const compareItems = fragrances.filter((item) => compare.includes(item.id));
  const remove = (id: string) => {
    setLocalWishlist((items) => items.filter((item) => item !== id));
    if (account) removeWishlist.mutate({ fragranceId: id });
  };

  return <main className="account-page"><header className="account-page-header"><button className="text-button" type="button" onClick={() => setLocation("/")}><ArrowLeft size={14} /> Back to collection</button><span className="brand-mark">Aurevia</span><span className="micro">Personal archive</span></header><section className="account-hero"><div><div className="micro">Your account</div><h1>{account ? <>Your ritual,<br />remembered.</> : <>Keep your ritual,<br />close.</>}</h1></div><div className="account-intro"><p>{account ? `Welcome back, ${account.name || account.email || "Aurevia member"}. Your wishlist is synced across signed-in devices.` : "Sign in to sync your saved fragrances across devices. Your guest wishlist will merge when you sign in."}</p>{!account && <button className="dark-button" type="button" onClick={() => startLogin()}><LogIn size={15} /> Sign in & sync</button>}</div></section>{accountLoading || wishlistLoading ? <div className="account-loading">Loading your archive…</div> : <><section className="account-summary"><div><strong>{wishlistItems.length}</strong><span>Saved fragrances</span></div><div><strong>{compareItems.length}</strong><span>Compared</span></div><div><strong>{cart.length}</strong><span>In your bag</span></div></section><section className="account-section"><div className="account-section-heading"><div><span className="micro"><Heart size={12} /> Wishlist</span><h2>Scents worth returning to.</h2></div><span className="micro">{wishlistItems.length} saved</span></div>{wishlistItems.length ? <div className="account-product-grid">{wishlistItems.map((item) => <article className="account-product" key={item.id}><button type="button" className="account-product-image" onClick={() => setLocation(`/fragrance/${item.slug}`)}><img src={item.image} alt={`${item.brand} ${item.name}`} /></button><div className="account-product-copy"><span className="micro">{item.brand}</span><h3>{item.name}</h3><p>{getDisplayPrice(item)} · {getDisplaySize(item)}</p><div><button className="text-button" type="button" onClick={() => setLocation(`/fragrance/${item.slug}`)}>View scent</button><button className="icon-text-button" type="button" onClick={() => remove(item.id)} aria-label={`Remove ${item.name} from wishlist`}><X size={14} /></button></div></div></article>)}</div> : <div className="account-empty"><Heart size={18} /><p>Your personal edit is empty. Save a fragrance from the collection to see it here.</p><button className="outline-button" type="button" onClick={() => setLocation("/")}>Explore fragrances</button></div>}</section><section className="account-section comparison-section"><div className="account-section-heading"><div><span className="micro"><GitCompare size={12} /> Comparison</span><h2>See the difference.</h2></div><span className="micro">{compareItems.length} selected</span></div>{compareItems.length ? <div className="account-compare-grid">{compareItems.map((item) => <article key={item.id}><img src={item.image} alt={`${item.brand} ${item.name}`} /><span className="micro">{item.brand}</span><h3>{item.name}</h3><p>{item.family}</p><small>Top · {item.notes.top.join(" · ")}</small><small>Base · {item.notes.base.join(" · ")}</small></article>)}</div> : <div className="account-empty"><GitCompare size={18} /><p>Add up to three fragrances to comparison from the collection. Your selections will appear here.</p><button className="outline-button" type="button" onClick={() => setLocation("/#collection")}>Compare fragrances</button></div>}</section></>}</main>;
}
