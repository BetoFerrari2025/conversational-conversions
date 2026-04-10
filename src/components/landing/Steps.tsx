import { MousePointerClick, MessageSquare, Rocket } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: MousePointerClick,
    title: "Build Your Flow",
    desc: "Drag and drop blocks to create your conversational funnel — text, buttons, inputs, delays, and more.",
  },
  {
    num: "02",
    icon: MessageSquare,
    title: "Customize & Connect",
    desc: "Add conditional logic, personalization with variables, and connect blocks to create powerful sales flows.",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Launch & Convert",
    desc: "Share your unique funnel link, embed it anywhere, and watch your conversions skyrocket.",
  },
];

const Steps = () => (
  <section id="steps" className="py-20 md:py-32">
    <div className="container px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold">
          Zero to sales in{" "}
          <span className="text-gradient">3 steps</span>
        </h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-12">
        {steps.map((s, i) => (
          <div key={i} className="flex gap-6 items-start group">
            <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover:border-primary/50 transition-colors">
              <s.icon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <span className="text-primary font-heading font-bold text-sm">{s.num}</span>
              <h3 className="text-xl font-bold mt-1">{s.title}</h3>
              <p className="text-muted-foreground mt-2">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Steps;
