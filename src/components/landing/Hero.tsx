import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroMockup from "@/assets/hero-mockup.jpg";

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] glow-bg animate-pulse-glow pointer-events-none" />

      <div className="container relative px-4">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-sm text-primary font-medium">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Conversational Funnels That Sell
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
            Turn conversations into{" "}
            <span className="text-gradient">sales</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            Build WhatsApp-style chat funnels that convert visitors into buyers — no code, no friction, just results.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="w-full sm:w-auto text-base gap-2 shadow-glow">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base gap-2">
              <Play className="h-4 w-4" /> Watch Demo
            </Button>
          </div>
        </div>

        <div className="mt-16 md:mt-24 relative max-w-4xl mx-auto">
          <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-2xl" />
          <img
            src={heroMockup}
            alt="Zapify funnel builder interface"
            className="relative rounded-xl border border-border shadow-2xl w-full"
            width={1280}
            height={800}
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
