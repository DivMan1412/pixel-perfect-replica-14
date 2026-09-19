import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/store";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — HIMORA Woollens" },
      {
        name: "description",
        content: "Explore HIMORA categories: shawls, stoles, sadri, Himachali caps, mufflers, socks and more.",
      },
      { property: "og:title", content: "Categories — HIMORA Woollens" },
      { property: "og:description", content: "Explore every HIMORA woollen category." },
    ],
  }),
  component: Categories,
});

function Categories() {
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="eyebrow">Explore</div>
      <h1 className="mt-3 text-4xl">Categories</h1>
      <div className="mt-12 grid grid-cols-2 gap-8 lg:grid-cols-3">
        {categories
          .filter((c) => c.is_active)
          .map((c) => (
            <Link key={c.id} to="/shop" search={{ category: c.slug }} className="group">
              <div className="product-media aspect-[4/3]">
                {c.image_url && (
                  <img src={c.image_url} alt={c.name} loading="lazy" className="size-full object-cover" />
                )}
              </div>
              <h2 className="mt-4 font-display text-xl group-hover:text-accent">{c.name}</h2>
              {c.description && (
                <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              )}
            </Link>
          ))}
      </div>
    </div>
  );
}
