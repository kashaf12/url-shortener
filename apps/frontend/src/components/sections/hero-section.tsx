import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Sparkles,
  Github,
  Star,
  GitFork,
  Download,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10" />
      </div>

      {/* Hero Content */}
      <div className="relative z-20 container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8 text-center">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Badge
              variant="outline"
              className="px-4 py-2 glass-effect animate-glow"
            >
              <Github className="h-4 w-4 mr-2" />
              Open Source
            </Badge>
            <Badge variant="outline" className="px-4 py-2 glass-effect">
              <Code2 className="h-4 w-4 mr-2" />
              Developer First
            </Badge>
            <Badge variant="outline" className="px-4 py-2 glass-effect">
              <Sparkles className="h-4 w-4 mr-2" />
              Self-Hostable
            </Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter max-w-6xl leading-tight">
            The Complete
            <br />
            <span className="gradient-text animate-pulse-slow">
              URL Shortener Platform
            </span>
          </h1>

          <p className="max-w-3xl text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed">
            Self-hostable, pluggable, and developer-first URL shortening
            platform. Complete with React hooks, REST API, analytics, and
            enterprise features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Link href="/docs/getting-started" className="flex-1">
              <Button
                size="lg"
                className="w-full gap-2 px-8 py-4 text-lg font-semibold animate-glow"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link
              href="https://github.com/kashaf12/url-shortener"
              target="_blank"
              className="flex-1"
            >
              <Button
                variant="outline"
                size="lg"
                className="w-full gap-2 px-8 py-4 text-lg glass-effect hover:bg-background/90 bg-transparent"
              >
                <Github className="h-5 w-5" />
                GitHub
              </Button>
            </Link>
          </div>

          {/* GitHub Stats */}
          <div className="flex items-center gap-8 text-sm text-muted-foreground flex-wrap justify-center">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span className="font-medium">2.1k stars</span>
            </div>
            <div className="flex items-center gap-2">
              <GitFork className="h-4 w-4" />
              <span className="font-medium">340 forks</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="font-medium">15k/month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <ChevronDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  );
}
