import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Heart, Minus, Plus, Star, Truck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/cart";
import {
  discountPercent,
  fetchProductBySlug,
  fetchSettings,
  formatINR,
  type Variant,
} from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/product/$slug")({
  head: ({ params }) => {
    const pretty = params.slug.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
    return {
      meta: [
        { title: `${pretty} — HIMORA` },
        { name: "description", content: `${pretty}: handcrafted Himalayan woollen wear from HIMORA.` },
        { property: "og:title", content: `${pretty} — HIMORA` },
        { property: "og:description", content: `${pretty}: handcrafted Himalayan woollen wear.` },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cart = useCart();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug),
  });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", product?.id],
    enabled: Boolean(product?.id),
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", product!.id)
        .eq("is_visible", true)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: hasPurchased = false } = useQuery({
    queryKey: ["purchased", product?.id, user?.id],
    enabled: Boolean(product?.id && user?.id),
    queryFn: async () => {
      const { data } = await supabase
        .from("order_items")
        .select("id")
        .eq("product_id", product!.id)
        .limit(1);
      return (data ?? []).length > 0;
    },
  });

  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pinResult, setPinResult] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");
  const [activeImage, setActiveImage] = useState(0);

  const variants = (product?.product_variants ?? []) as Variant[];
  const sizes = useMemo(() => Array.from(new Set(variants.map((v) => v.size))), [variants]);
  const colors = useMemo(() => Array.from(new Set(variants.map((v) => v.color))), [variants]);
  const selected = variants.find(
    (v) => v.size === (size ?? sizes[0]) && v.color === (color ?? colors[0]),
  );
  const stock = selected?.stock ?? 0;

  if (isLoading) {
    return <div className="py-32 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  if (!product) {
    return (
      <div className="py-32 text-center">
        <h1 className="text-2xl">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block text-sm text-accent">
          Back to shop
        </Link>
      </div>
    );
  }

  const price = Number(product.price) + Number(selected?.price_delta ?? 0);
  const mrp = product.mrp ? Number(product.mrp) : null;
  const off = discountPercent(mrp, price);
  const deliveryDate = new Date(Date.now() + (settings?.delivery_days ?? 5) * 86400000);

  function addToCart() {
    if (sizes.length > 1 && !size) return toast.error("Please select a size");
    if (colors.length > 1 && !color) return toast.error("Please select a colour");
    if (!selected || stock < 1) return toast.error("This option is out of stock");
    cart.add({
      variantId: selected.id,
      productId: product!.id,
      slug: product!.slug,
      name: product!.name,
      image: product!.images?.[0] ?? null,
      size: selected.size,
      color: selected.color,
      price,
      mrp,
      quantity: qty,
      maxStock: selected.stock,
    });
    toast.success("Added to bag");
  }

  async function addToWishlist() {
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    const { error } = await supabase
      .from("wishlists")
      .insert({ user_id: user.id, product_id: product!.id });
    toast[error ? "error" : "success"](error ? "Already in wishlist" : "Saved to wishlist");
  }

  async function submitReview() {
    if (!user) return navigate({ to: "/auth" });
    const { error } = await supabase.from("reviews").insert({
      product_id: product!.id,
      user_id: user.id,
      rating,
      body: reviewBody,
    });
    if (error) return toast.error("Could not post your review");
    setReviewBody("");
    toast.success("Thank you for your review");
    queryClient.invalidateQueries({ queryKey: ["reviews", product!.id] });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-accent">
          Home
        </Link>{" "}
        / <Link to="/shop" className="hover:text-accent">Shop</Link> / {product.name}
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div>
          <div className="product-media aspect-[4/5]">
            {product.images?.[activeImage] && (
              <img
                src={product.images[activeImage]}
                alt={product.name}
                width={1024}
                height={1280}
                className="size-full object-cover"
              />
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`size-20 overflow-hidden border ${i === activeImage ? "border-accent" : "border-border"}`}
                >
                  <img src={img} alt="" className="size-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="eyebrow">{product.sku}</div>
          <h1 className="mt-3 text-3xl sm:text-4xl">{product.name}</h1>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-accent text-accent" />
              {Number(product.rating).toFixed(1)}
            </span>
            <span className="text-muted-foreground">{reviews.length + product.review_count} reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-2xl">{formatINR(price)}</span>
            {mrp && mrp > price && (
              <>
                <span className="text-sm text-muted-foreground line-through">{formatINR(mrp)}</span>
                <span className="text-sm text-accent">{off}% off</span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          {sizes.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <h3 className="text-xs tracking-[0.2em] uppercase">Size</h3>
                <span className="text-xs text-muted-foreground">S · M · L · XL · XXL guide</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`min-w-14 border px-4 py-2 text-sm ${
                      (size ?? sizes[0]) === s
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs tracking-[0.2em] uppercase">Colour</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`border px-4 py-2 text-sm ${
                      (color ?? colors[0]) === c
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-6">
            <div className="flex items-center border border-border">
              <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                <Minus className="size-3.5" />
              </button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button
                className="px-3 py-2"
                onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
              >
                <Plus className="size-3.5" />
              </button>
            </div>
            <span className={`text-xs ${stock > 0 ? "text-muted-foreground" : "text-destructive"}`}>
              {stock > 0 ? `${stock} in stock` : "Out of Stock"}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" className="flex-1" disabled={stock < 1} onClick={addToCart}>
              Add to Bag
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="flex-1"
              disabled={stock < 1}
              onClick={() => {
                addToCart();
                navigate({ to: "/checkout" });
              }}
            >
              Buy Now
            </Button>
            <Button size="lg" variant="outline" onClick={addToWishlist} aria-label="Wishlist">
              <Heart className="size-4" />
            </Button>
          </div>

          <div className="mt-8 border border-border p-5">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="size-4 text-accent" /> Delivery & availability
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter pincode"
                maxLength={6}
              />
              <Button
                variant="outline"
                onClick={() =>
                  setPinResult(
                    /^\d{6}$/.test(pincode)
                      ? `Delivers by ${deliveryDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                      : "Enter a valid 6-digit pincode",
                  )
                }
              >
                Check
              </Button>
            </div>
            {pinResult && <p className="mt-2 text-xs text-muted-foreground">{pinResult}</p>}
          </div>

          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="details">
              <AccordionTrigger>Material & care</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>Material: {product.material}</li>
                  <li>Weight: {product.weight}</li>
                  {Object.entries((product.specs ?? {}) as Record<string, string>).map(([k, v]) => (
                    <li key={k}>
                      {k}: {v}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="size-chart">
              <AccordionTrigger>Size chart</AccordionTrigger>
              <AccordionContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground uppercase">
                      <th className="py-2">Size</th>
                      <th>Chest (in)</th>
                      <th>Length (in)</th>
                    </tr>
                  </thead>
                  <tbody className="text-muted-foreground">
                    {[
                      ["S", "36", "26"],
                      ["M", "38", "27"],
                      ["L", "40", "28"],
                      ["XL", "42", "29"],
                      ["XXL", "44", "30"],
                    ].map((row) => (
                      <tr key={row[0]} className="border-t border-border">
                        <td className="py-2">{row[0]}</td>
                        <td>{row[1]}</td>
                        <td>{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping information</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                Dispatched within 48 hours. Free shipping above {formatINR(settings?.free_shipping_threshold ?? 2499)}.
                7-day returns on unused items.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <section className="mt-20 border-t border-border pt-12">
        <h2 className="text-2xl">Reviews</h2>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground">No reviews yet for this product.</p>
            )}
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-border pb-5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${i < r.rating ? "fill-accent text-accent" : "text-border"}`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString("en-IN")}
                </p>
              </div>
            ))}
          </div>
          <div className="border border-border p-6">
            <h3 className="text-sm tracking-[0.15em] uppercase">Write a review</h3>
            {!user ? (
              <p className="mt-4 text-sm text-muted-foreground">
                <Link to="/auth" className="text-accent">
                  Sign in
                </Link>{" "}
                to review this product.
              </p>
            ) : !hasPurchased ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Only verified purchasers can review this product.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button key={i} onClick={() => setRating(i + 1)}>
                      <Star
                        className={`size-5 ${i < rating ? "fill-accent text-accent" : "text-border"}`}
                      />
                    </button>
                  ))}
                </div>
                <Textarea
                  value={reviewBody}
                  onChange={(e) => setReviewBody(e.target.value)}
                  placeholder="Tell others about the fit, warmth and finish"
                />
                <Button className="w-full" onClick={submitReview}>
                  Post review
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
