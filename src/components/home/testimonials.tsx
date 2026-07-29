import { Star } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    text: "Best latte in the neighborhood. The baristas remember my name and order — it truly feels like a second home.",
    rating: 5,
  },
  {
    id: 2,
    name: "James T.",
    text: "The avocado toast is unreal. I come in three times a week just for that. Plus the cold brew is phenomenal.",
    rating: 5,
  },
  {
    id: 3,
    name: "Priya K.",
    text: "Warm, welcoming, and the food is always fresh. AnticCafe is the gem of our block.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-stone-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-2">
            Guest Love
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            What our guests say
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="bg-stone-950 rounded-2xl p-6 border border-stone-800"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-stone-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
              <p className="text-sm font-semibold text-white">— {t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
