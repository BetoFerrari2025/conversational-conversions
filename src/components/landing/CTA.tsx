import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTA = () => (
  <section className="py-20 md:py-32">
    <div className="container px-4">
      <div className="relative max-w-3xl mx-auto text-center space-y-6 p-12 rounded-2xl bg-card border border-border overflow-hidden">
        <div className="absolute inset-0 glow-bg opacity-50 pointer-events-none" />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to convert with{" "}
            <span className="text-gradient">conversations</span>?
          </h2>
          <p className="text-muted-foreground mt-4 max-w-md mx-auto">
            Build your first funnel in minutes. No credit card required.
          </p>
          <Button size="lg" className="mt-8 text-base gap-2 shadow-glow">
            Start Free Now <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default CTA;
