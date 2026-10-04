import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Account from "@/pages/Account";
import SeoHead from "./components/SeoHead";
import { getLocaleFromPathname } from "@shared/seo";

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/ar" component={Home} /><Route path="/account" component={Account} /><Route path="/ar/account" component={Account} /><Route path="/fragrance/:slug" component={Home} /><Route path="/ar/عطر/:slug" component={Home} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  const locale = getLocaleFromPathname(typeof window === "undefined" ? "/" : window.location.pathname);
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><SeoHead locale={locale} /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
