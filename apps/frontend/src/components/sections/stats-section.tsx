import { Gauge, Zap, Globe, Users } from "lucide-react";

export function StatsSection() {
  const stats = [
    { value: "99.9%", label: "Uptime SLA", icon: Gauge },
    { value: "<100ms", label: "Redirect Speed", icon: Zap },
    { value: "10M+", label: "URLs Shortened", icon: Globe },
    { value: "1000+", label: "Developers", icon: Users },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-muted/30 border-y">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="space-y-3 p-6 rounded-lg glass-effect hover:bg-background/50 transition-all duration-300"
            >
              <stat.icon className="h-8 w-8 mx-auto text-primary" />
              <h3 className="text-3xl lg:text-4xl font-bold text-foreground">
                {stat.value}
              </h3>
              <p className="text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
