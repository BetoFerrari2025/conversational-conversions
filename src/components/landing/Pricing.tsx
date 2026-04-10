import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$19",
    desc: "Perfect to get started",
    featured: false,
    features: [
      "3 active funnels",
      "500 leads/month",
      "Basic analytics",
      "WhatsApp-style chat",
      "Shareable links",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    desc: "For growing businesses",
    featured: true,
    features: [
      "Unlimited funnels",
      "Unlimited leads",
      "Advanced analytics",
      "Conditional logic",
      "Audio autoplay",
      "Anti-copy protection",
      "CSV export",
      "Priority support",
    ],
  },
  {
    name: "Scale",
    price: "$99",
    desc: "For teams & agencies",
    featured: false,
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Custom branding",
      "API access",
      "Webhook integrations",
      "Dedicated support",
    ],
  },
];

const Pricing = () => (
  <section id="pricing" className="py-20 md:py-32">
    <div className="container px-4">
      <div className="text-center mb-16 space-y-3">
        <h2 className="text-3xl md:text-5xl font-bold">
          Choose your <span className="text-gradient">plan</span>
        </h2>
        <p className="text-muted-foreground">Start free. Scale when ready.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
        {plans.map((p, i) => (
          <div
            key={i}
            className={`rounded-xl p-6 border ${
              p.featured
                ? "border-primary bg-card shadow-glow scale-105"
                : "border-border bg-card"
            }`}
          >
            {p.featured && (
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-primary-foreground bg-primary px-3 py-1 rounded-full mb-4">
                Most Popular
              </span>
            )}
            <h3 className="font-heading font-bold text-lg">{p.name}</h3>
            <p className="text-muted-foreground text-sm">{p.desc}</p>
            <div className="mt-4 mb-6">
              <span className="text-4xl font-bold">{p.price}</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <Button
              className="w-full mb-6"
              variant={p.featured ? "default" : "outline"}
            >
              Get Started
            </Button>
            <ul className="space-y-3">
              {p.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Pricing;
