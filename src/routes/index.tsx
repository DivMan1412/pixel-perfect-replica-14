import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Leaf, Package, ShieldCheck, Truck } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import { fetchCategories, fetchProducts, fetchSettings, type Product } from "@/lib/store";
import { ProductCard } from "@/components/store/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HIMORA — Premium Woollen Wear for Every Winter" },
      {
        name: "description",
        content:
          "Handcrafted Himalayan woollens — shawls, pashmina stoles, sadris, Himachali caps, mufflers and winter essentials.",
      },
      { property: "og:title", content: "HIMORA — Premium Woollen Wear for Every Winter" },
      {
        property: "og:description",
        content: "Handcrafted Himalayan woollens made to be worn for decades.",
      },
    ],
  }),
  component: Home,
});

function Section({
  eyebrow,
  title,
  link,
  products,
}: {
  eyebrow: string;
  title: string;
  link?: string;
  products: Product[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="flex items-end justify-between gap-6">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2 className="mt-3 text-3xl sm:text-4xl">{title}</h2>
        </div>
        {link && (
          <Link
            to="/shop"
            className="hidden items-center gap-2 text-xs tracking-[0.2em] uppercase hover:text-accent sm:flex"
          >
            {link} <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function Home() {
  const { data: products = [] } = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts() });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  return (
    <div>
      <section className="relative">
        <div className="relative h-[78vh] min-h-[520px] w-full overflow-hidden">
          <img
            src={settings?.hero_image_url || heroImage}
            alt="Woman wearing a handwoven Himalayan wool shawl at dusk"
            width={1920}
            height={1088}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/45 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
              <div className="fade-up max-w-xl text-primary-foreground">
                <div className="eyebrow text-primary-foreground/70">Winter Collection 2026</div>
                <h1 className="mt-5 text-4xl leading-[1.08] sm:text-6xl">
                  {settings?.hero_title ?? "Premium Woollen Wear for Every Winter"}
                </h1>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-primary-foreground/80">
                  {settings?.hero_subtitle ?? "Handcrafted in the Himalayas. Made to last a lifetime."}
                </p>
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    to="/shop"
                    className="bg-accent px-8 py-4 text-xs tracking-[0.22em] text-accent-foreground uppercase transition-opacity hover:opacity-90"
                  >
                    Shop Now
                  </Link>
                  <Link
                    to="/categories"
                    className="border border-primary-foreground/50 px-8 py-4 text-xs tracking-[0.22em] text-primary-foreground uppercase transition-colors hover:bg-primary-foreground/10"
                  >
                    Explore Collection
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4">
          {[
            { icon: Leaf, title: "Pure Wool", text: "Merino, pashmina & lambswool" },
            { icon: Truck, title: "Free Shipping", text: "On orders above ₹2,499" },
            { icon: Package, title: "Easy Returns", text: "7-day hassle-free returns" },
            { icon: ShieldCheck, title: "Secure Payments", text: "UPI, cards & netbanking" },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <f.icon className="mt-0.5 size-5 text-accent" />
              <div>
                <div className="text-sm">{f.title}</div>
                <div className="text-xs text-muted-foreground">{f.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="eyebrow">Shop by</div>
        <h2 className="mt-3 text-3xl sm:text-4xl">Featured Categories</h2>
        <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
          {categories.slice(0, 8).map((c) => (
            <Link key={c.id} to="/shop" search={{ category: c.slug } as never} className="group">
              <div className="product-media aspect-square">
                {c.image_url && (
                  <img src={c.image_url} alt={c.name} loading="lazy" className="size-full object-cover" />
                )}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm tracking-[0.08em] group-hover:text-accent">{c.name}</span>
                <ArrowRight className="size-3.5 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Section
        eyebrow="Just In"
        title="New Arrivals"
        link="View all"
        products={products.filter((p) => p.is_new_arrival)}
      />
      <Section
        eyebrow="Loved Most"
        title="Best Sellers"
        link="View all"
        products={products.filter((p) => p.is_best_seller)}
      />
      <Section
        eyebrow="Curated"
        title="The Winter Edit"
        link="View all"
        products={products.filter((p) => p.is_featured)}
      />

      <section className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
        <div className="bg-primary px-8 py-20 text-center text-primary-foreground">
          <div className="eyebrow text-primary-foreground/60">Special Offer</div>
          <h2 className="mt-4 text-3xl sm:text-4xl">10% off your first order</h2>
          <p className="mt-4 text-sm text-primary-foreground/70">
            Use code <span className="text-accent">WINTER10</span> at checkout on orders above ₹1,999.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-block bg-accent px-8 py-4 text-xs tracking-[0.22em] text-accent-foreground uppercase"
          >
            Shop the collection
          </Link>
        </div>
      </section>
    </div>
  );
}
