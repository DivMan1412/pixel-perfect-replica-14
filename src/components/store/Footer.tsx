import { Link } from "@tanstack/react-router";
import { STORE_NAME, STORE_TAGLINE } from "@/lib/store";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { to: "/shop", label: "All Products" },
      { to: "/categories", label: "Categories" },
      { to: "/wishlist", label: "Wishlist" },
    ],
  },
  {
    title: "Help",
    links: [
      { to: "/contact", label: "Contact Us" },
      { to: "/faq", label: "FAQ" },
      { to: "/shipping-returns", label: "Shipping & Returns" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Us" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms & Conditions" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl tracking-[0.3em]">{STORE_NAME}</div>
          <div className="eyebrow mt-2 text-primary-foreground/60">{STORE_TAGLINE}</div>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-primary-foreground/70">
            Woollens woven by hand in the Himalayan foothills, made to be worn for decades.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-xs tracking-[0.24em] text-primary-foreground/60 uppercase">{col.title}</h4>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-primary-foreground/85 transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-primary-foreground/10 px-4 py-6 text-center text-xs text-primary-foreground/50">
        © {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
