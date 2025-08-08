import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code2, Zap, Shield, BarChart3, Globe, Boxes } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Code2,
      title: "React Hook",
      description:
        "Drop-in React hook with TypeScript support. Integrate URL shortening in minutes with full error handling and loading states.",
      code: "npm install @url-shortener/react",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Zap,
      title: "High Performance",
      description:
        "Sub-100ms redirects with PostgreSQL indexing, connection pooling, and optimized database queries. Built to handle enterprise scale.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: Shield,
      title: "Security First",
      description:
        "Malicious URL detection, rate limiting, input validation, and GDPR compliance. Enterprise security without the complexity.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description:
        "Detailed click tracking, geographic data, device analytics, and referrer insights. Privacy-focused with opt-out capabilities.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Self-Hostable",
      description:
        "Deploy anywhere with Docker, Kubernetes, or traditional hosting. Full control over your data and infrastructure.",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: Boxes,
      title: "Monorepo Architecture",
      description:
        "Organized with Turbo + pnpm workspaces. Shared types, UI components, and optimized builds across frontend, backend, and packages.",
      gradient: "from-red-500 to-pink-500",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-6">
            Built for Developers
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Everything you need to integrate URL shortening into your
            applications, with enterprise-grade features and self-hosting
            options.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group border-2 hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl glass-effect"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
                {feature.code && (
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm border">
                    {feature.code}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
