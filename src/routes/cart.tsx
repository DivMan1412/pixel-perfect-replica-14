import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { fetchSettings, formatINR } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — HIMORA" },
      { name: "description", content: "Review the woollens in your HIMORA shopping bag before checkout." },
      { property: "og:title", content: "Your Bag — HIMORA" },
      { property: "og:description", content: "Review your HIMORA shopping bag." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: fetchSettings });

  const subtotal = cart.subtotal;
  const shipping =
    subtotal === 0 || subtotal >= Number(settings?.free_shipping_threshold ?? 2499)
      ? 0
      : Number(settings?.shipping_fee ?? 99);
  const tax = Math.round((subtotal * Number(settings?.tax_percent ?? 5)) / 100);
  const total = subtotal + shipping + tax;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="eyebrow">Shopping</div>
      <h1 className="mt-3 text-4xl">Your Bag</h1>

      {cart.items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Link
            to="/shop"
            className="mt-6 inline-block bg-primary px-8 py-4 text-xs tracking-[0.2em] text-primary-foreground uppercase"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
          <div className="divide-y divide-border border-y border-border">
            {cart.items.map((item) => (
              <div key={item.variantId} className="flex gap-5 py-6">
                <Link to="/product/$slug" params={{ slug: item.slug }} className="w-24 shrink-0">
                  <div className="product-media aspect-[4/5]">
                    {item.image && (
                      <img src={item.image} alt={item.name} loading="lazy" className="size-full object-cover" />
                    )}
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link to="/product/$slug" params={{ slug: item.slug }}>
                        <h3 className="font-display text-lg">{item.name}</h3>
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.size} · {item.color}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">{formatINR(item.price * item.quantity)}</div>
                      <div className="text-xs text-muted-foreground">{formatINR(item.price)} each</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        className="px-3 py-1.5"
                        onClick={() => cart.setQuantity(item.variantId, item.quantity - 1)}
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        className="px-3 py-1.5"
                        onClick={() => cart.setQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <button
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => cart.remove(item.variantId)}
                    >
                      <Trash2 className="size-3.5" /> Remove
                    </button>
                  </div>
                  {item.quantity >= item.maxStock && (
                    <p className="mt-2 text-xs text-accent-foreground/70">
                      Only {item.maxStock} available in this option.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <aside className="h-fit border border-border p-6">
            <h2 className="text-sm tracking-[0.2em] uppercase">Order Summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Tax ({settings?.tax_percent ?? 5}%)</dt>
                <dd>{formatINR(tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <dt>Total</dt>
                <dd>{formatINR(total)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Coupons can be applied at checkout.
            </p>
            <Link to="/checkout" className="mt-6 block">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
