import { Zap } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border py-12">
    <div className="container px-4">
      <div className="grid md:grid-cols-4 gap-8">
        <div>
          <a href="#" className="flex items-center gap-2 font-heading text-lg font-bold mb-3">
            <Zap className="h-5 w-5 text-primary" />
            Zapify
          </a>
          <p className="text-sm text-muted-foreground">
            Conversational funnels that convert better than landing pages.
          </p>
        </div>

        {[
          { title: "Product", links: ["Features", "Pricing", "Templates", "API"] },
          { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
          { title: "Support", links: ["Help Center", "Documentation", "Status", "Privacy"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="font-bold text-sm mb-3">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border mt-8 pt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Zapify. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
