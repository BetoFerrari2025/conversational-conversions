const stats = [
  { value: "+43.7%", label: "Conversion increase" },
  { value: "3x", label: "More engagement" },
  { value: "100%", label: "No-code" },
];

const Stats = () => (
  <section className="py-20 md:py-28 bg-secondary/30">
    <div className="container px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold">
          Zapify is <span className="text-gradient">transformation</span>
        </h2>
      </div>

      <div className="flex flex-wrap justify-center gap-8 md:gap-16">
        {stats.map((s, i) => (
          <div key={i} className="text-center p-6 rounded-xl bg-card border border-border min-w-[160px]">
            <p className="text-3xl md:text-4xl font-bold text-gradient font-heading">{s.value}</p>
            <p className="text-sm text-muted-foreground mt-2">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
