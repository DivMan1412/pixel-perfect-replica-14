import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchCategories, fetchProducts, formatINR, totalStock, type Product } from "@/lib/store";
import { ProductCard } from "@/components/store/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ShopSearch = {
  q?: string | undefined;
  category?: string | undefined;
  sort?: string | undefined;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search['q'] === "string" ? search['q'] : undefined,
    category: typeof search['category'] === "string" ? search['category'] : undefined,
    sort: typeof search['sort'] === "string" ? search['sort'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All Woollens — HIMORA" },
      {
        name: "description",
        content: "Browse handcrafted shawls, stoles, sadris, caps, mufflers, socks and winter wear.",
      },
      { property: "og:title", content: "Shop All Woollens — HIMORA" },
      { property: "og:description", content: "Browse the full HIMORA winter collection." },
    ],
  }),
  component: Shop,
});

function Shop() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const [priceMax, setPriceMax] = useState(12000);
  const [sizes, setSizes] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const allSizes = useMemo(
    () => Array.from(new Set(products.flatMap((p) => (p.product_variants ?? []).map((v) => v.size)))),
    [products],
  );
  const allColors = useMemo(
    () => Array.from(new Set(products.flatMap((p) => (p.product_variants ?? []).map((v) => v.color)))),
    [products],
  );

  const categoryId = categories.find((c) => c.slug === search.category)?.id;

  const filtered = useMemo(() => {
    const q = (search.q ?? "").toLowerCase().trim();
    let list = products.filter((p) => {
      if (categoryId && p.category_id !== categoryId) return false;
      if (Number(p.price) > priceMax) return false;
      if (inStockOnly && totalStock(p) === 0) return false;
      if (sizes.length && !(p.product_variants ?? []).some((v) => sizes.includes(v.size))) return false;
      if (colors.length && !(p.product_variants ?? []).some((v) => colors.includes(v.color))) return false;
      if (q) {
        const hay = `${p.name} ${p.sku ?? ""} ${p.material ?? ""} ${p.description ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    const sort = search.sort ?? "recommended";
    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price-desc") list.sort((a, b) => Number(b.price) - Number(a.price));
    if (sort === "newest") list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    if (sort === "rating") list.sort((a, b) => Number(b.rating) - Number(a.rating));
    if (sort === "best-selling")
      list.sort((a, b) => Number(b.is_best_seller) - Number(a.is_best_seller));
    return list as Product[];
  }, [products, categoryId, priceMax, sizes, colors, inStockOnly, search.q, search.sort]);

  function toggle(list: string[], value: string, setter: (v: string[]) => void) {
    setter(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="eyebrow">Collection</div>
      <h1 className="mt-3 text-4xl">
        {categories.find((c) => c.slug === search.category)?.name ?? "All Woollens"}
      </h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-8">
          <div>
            <Input
              defaultValue={search.q ?? ""}
              placeholder="Search by name or SKU"
              onChange={(e) =>
                navigate({ search: (prev) => ({ ...prev, q: e.target.value || undefined }) })
              }
            />
          </div>

          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase">Category</h3>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => navigate({ search: (prev) => ({ ...prev, category: undefined }) })}
                className={`block text-sm ${!search.category ? "text-accent" : "text-muted-foreground"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate({ search: (prev) => ({ ...prev, category: c.slug }) })}
                  className={`block text-sm ${search.category === c.slug ? "text-accent" : "text-muted-foreground"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase">Max price</h3>
            <Slider
              className="mt-5"
              value={[priceMax]}
              min={500}
              max={12000}
              step={500}
              onValueChange={(v) => setPriceMax(v[0] ?? 12000)}
            />
            <div className="mt-2 text-xs text-muted-foreground">Up to {formatINR(priceMax)}</div>
          </div>

          {allSizes.length > 0 && (
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase">Size</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {allSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggle(sizes, s, setSizes)}
                    className={`border px-3 py-1.5 text-xs ${
                      sizes.includes(s) ? "border-accent bg-accent text-accent-foreground" : "border-border"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {allColors.length > 0 && (
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase">Colour</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {allColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => toggle(colors, c, setColors)}
                    className={`border px-3 py-1.5 text-xs ${
                      colors.includes(c) ? "border-accent bg-accent text-accent-foreground" : "border-border"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(Boolean(v))} />
            In stock only
          </label>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSizes([]);
              setColors([]);
              setInStockOnly(false);
              setPriceMax(12000);
              navigate({ search: {} });
            }}
          >
            Clear filters
          </Button>
        </aside>

        <div>
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <span className="text-xs text-muted-foreground">{filtered.length} products</span>
            <Select
              value={search.sort ?? "recommended"}
              onValueChange={(v) => navigate({ search: (prev) => ({ ...prev, sort: v }) })}
            >
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="best-selling">Best Selling</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="py-24 text-center text-sm text-muted-foreground">Loading collection…</div>
          ) : filtered.length === 0 ? (
            <div className="py-24 text-center text-sm text-muted-foreground">
              No products match these filters.
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
