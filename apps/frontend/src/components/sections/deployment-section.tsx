import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Cloud, Database, Lock } from "lucide-react";

export function DeploymentSection() {
  const deploymentOptions = [
    {
      title: "Managed Services",
      description: "Recommended for most teams",
      icon: Cloud,
      features: [
        "Frontend: Vercel",
        "Backend: Railway/Render",
        "Database: Supabase",
      ],
      buttonText: "Deploy Guide",
      variant: "outline" as const,
    },
    {
      title: "Docker Compose",
      description: "Self-hosted with containers",
      icon: Database,
      features: [
        "Single command deployment",
        "PostgreSQL included",
        "Nginx reverse proxy",
      ],
      buttonText: "Quick Start",
      variant: "default" as const,
      popular: true,
    },
    {
      title: "Kubernetes",
      description: "Enterprise scale",
      icon: Lock,
      features: ["Auto-scaling", "Service mesh ready", "Prometheus monitoring"],
      buttonText: "K8s Manifests",
      variant: "outline" as const,
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-6">
            Deploy Anywhere
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Choose your deployment strategy. From managed services to
            self-hosted infrastructure.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {deploymentOptions.map((option, index) => (
            <Card
              key={index}
              className={`text-center glass-effect hover:shadow-2xl transition-all duration-500 hover:scale-105 ${
                option.popular
                  ? "border-2 border-primary"
                  : "border-2 hover:border-primary/50"
              }`}
            >
              <CardHeader>
                {option.popular && (
                  <Badge className="mx-auto mb-3 animate-pulse">Popular</Badge>
                )}
                <div className="mx-auto p-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground mb-4">
                  <option.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <CardDescription className="text-base">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  {option.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="text-sm text-muted-foreground"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
                <Button variant={option.variant} className="w-full">
                  {option.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
