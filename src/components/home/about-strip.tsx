import { Leaf, Clock, Heart, Coffee } from "lucide-react";

const pillars = [
  {
    icon: Coffee,
    title: "Specialty Coffee",
    desc: "Single-origin beans roasted locally and brewed to order with precision.",
  },
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    desc: "Seasonal produce, local suppliers, and made-from-scratch every day.",
  },
  {
    icon: Heart,
    title: "Made with Love",
    desc: "Every item on our menu reflects our passion for quality and community.",
  },
  {
    icon: Clock,
    title: "Always Fresh",
    desc: "Baked and prepped daily — if it's not fresh, it doesn't leave our kitchen.",
  },
];

export function AboutStrip() {
  return (
    <section className="py-16 bg-amber-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {pillars.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 text-amber-700 mb-4 mx-auto">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-1">{title}</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
