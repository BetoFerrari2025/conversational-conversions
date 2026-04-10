import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Pedro M.",
    role: "Digital Marketer",
    text: "Zapify replaced our entire landing page. Conversions jumped 40% in the first week.",
    stars: 5,
  },
  {
    name: "Robyn A.",
    role: "E-commerce Owner",
    text: "The WhatsApp-style chat makes visitors feel like they're talking to a real person. Game changer.",
    stars: 5,
  },
  {
    name: "Eder H.",
    role: "Growth Hacker",
    text: "Simple, beautiful, and it works. I created my first funnel in under 10 minutes.",
    stars: 5,
  },
];

const Testimonials = () => (
  <section id="testimonials" className="py-20 md:py-32">
    <div className="container px-4">
      <div className="text-center mb-16 space-y-3">
        <h2 className="text-3xl md:text-5xl font-bold">
          What our <span className="text-gradient">clients</span> say
        </h2>
        <p className="text-muted-foreground">Real results from real users.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <div key={i} className="p-6 rounded-xl bg-card border border-border">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: t.stars }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
            <div>
              <p className="font-bold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;
