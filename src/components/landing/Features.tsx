import { MessageCircle, BarChart3, Link2, Shield, Users, Volume2 } from "lucide-react";

const features = [
  { icon: MessageCircle, title: "WhatsApp-Style Chat", desc: "Realistic chat experience with typing animations, delays, and mobile-first design." },
  { icon: Users, title: "Lead Capture", desc: "Collect names, emails, and phone numbers. Export leads as CSV anytime." },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Track visitors, completion rates, and click-through rates per step." },
  { icon: Link2, title: "Shareable Links", desc: "Generate unique funnel links perfect for Meta Ads, TikTok, and more." },
  { icon: Shield, title: "Anti-Copy Protection", desc: "Detect cloned pages, redirect copycats, and protect your funnels." },
  { icon: Volume2, title: "Audio Autoplay", desc: "Play notification sounds on page load to boost engagement and urgency." },
];

const Features = () => (
  <section id="features" className="py-20 md:py-32 bg-secondary/30">
    <div className="container px-4">
      <div className="text-center mb-16 space-y-3">
        <h2 className="text-3xl md:text-5xl font-bold">
          Why teams choose <span className="text-gradient">Zapify</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Everything you need to build high-converting conversational funnels.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <div key={i} className="group p-6 rounded-xl bg-card border border-border hover:border-primary/40 transition-all hover:shadow-glow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <f.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
