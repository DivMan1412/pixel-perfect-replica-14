import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, Search, ShoppingBag, User, X, Heart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/useAuth";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const NAV = [
  { to: "/shop", label: "Shop" },
  { to: "/categories", label: "Categories" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate({ to: "/shop", search: { q: query || undefined } as never });
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="bg-primary px-4 py-2 text-center text-[11px] tracking-[0.2em] text-primary-foreground uppercase">
        Free shipping on orders above ₹2,499 · Handcrafted in the Himalayas
      </div>
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <button
          className="lg:hidden"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link to="/" className="mr-auto flex flex-col leading-none lg:mr-10">
          <span className="font-display text-2xl tracking-[0.3em]">{STORE_NAME}</span>
          <span className="eyebrow mt-1 hidden sm:block">{STORE_TAGLINE}</span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-xs tracking-[0.18em] uppercase transition-colors hover:text-accent ${
                pathname === item.to ? "text-accent" : "text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin" className="text-xs tracking-[0.18em] text-muted-foreground uppercase hover:text-accent">
              Admin
            </Link>
          )}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden w-56 items-center gap-2 md:flex">
          <Search className="size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            className="h-9 border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
        </form>

        <div className="flex items-center gap-1">
          <Link to="/wishlist" aria-label="Wishlist">
            <Button variant="ghost" size="icon">
              <Heart className="size-5" />
            </Button>
          </Link>
          <Link to={user ? "/account" : "/auth"} aria-label="Account">
            <Button variant="ghost" size="icon">
              <User className="size-5" />
            </Button>
          </Link>
          <Link to="/cart" aria-label="Cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="size-5" />
            </Button>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid size-5 place-items-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 pb-6 lg:hidden">
          <form onSubmit={submitSearch} className="py-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products"
            />
          </form>
          <nav className="flex flex-col gap-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="text-sm tracking-[0.18em] uppercase"
              >
                {item.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="text-sm tracking-[0.18em] uppercase">
                Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
