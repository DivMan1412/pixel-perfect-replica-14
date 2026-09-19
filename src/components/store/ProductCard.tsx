import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { discountPercent, formatINR, totalStock, type Product } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const price = Number(product.price);
  const mrp = product.mrp ? Number(product.mrp) : null;
  const off = discountPercent(mrp, price);
  const stock = totalStock(product);
  const colors = Array.from(new Set((product.product_variants ?? []).map((v) => v.color)));
  const sizes = Array.from(new Set((product.product_variants ?? []).map((v) => v.size)));

  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="product-media relative aspect-[4/5]">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <div className="grid size-full place-items-center text-xs text-muted-foreground">No image</div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {off > 0 && (
            <span className="bg-accent px-2 py-1 text-[10px] tracking-[0.15em] text-accent-foreground uppercase">
              {off}% off
            </span>
          )}
          {product.is_new_arrival && (
            <span className="bg-primary px-2 py-1 text-[10px] tracking-[0.15em] text-primary-foreground uppercase">
              New
            </span>
          )}
        </div>
        {stock === 0 && (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <span className="text-xs tracking-[0.25em] uppercase">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="pt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-base leading-snug transition-colors group-hover:text-accent">
            {product.name}
          </h3>
          <span className="mt-0.5 flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-accent text-accent" />
            {Number(product.rating).toFixed(1)}
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-medium">{formatINR(price)}</span>
          {mrp && mrp > price && (
            <span className="text-xs text-muted-foreground line-through">{formatINR(mrp)}</span>
          )}
        </div>
        <div className="mt-2 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
          {sizes.slice(0, 5).join(" · ")}
          {colors.length > 1 ? ` · ${colors.length} colours` : ""}
        </div>
      </div>
    </Link>
  );
}
