"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UrlShortenerForm } from "@/components/url-shortener-form";
import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Boxes,
  ArrowRight,
  Github,
  Star,
  GitFork,
  Download,
  ChevronDown,
  Sparkles,
  Terminal,
  Database,
  Cloud,
  Lock,
  Gauge,
  Users,
} from "lucide-react";
import { useInView } from "react-intersection-observer";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [mounted, setMounted] = useState(false);

  const { ref: heroRef, inView: heroInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const { ref: featuresRef, inView: featuresInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const { ref: demoRef, inView: demoInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const { ref: codeRef, inView: codeInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        {/* Hero Section with Video Background */}
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 video-overlay" />
          </div>

          {/* Hero Content */}
          <div ref={heroRef} className="relative z-20 container px-4 md:px-6">
            <div
              className={`flex flex-col items-center space-y-8 text-center transition-all duration-1000 ${
                heroInView ? "animate-fade-in" : "opacity-0 translate-y-10"
              }`}
            >
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

        {/* Stats Section */}
        <section className="w-full py-16 md:py-24 bg-muted/30 border-y">
          <div className="container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { value: "99.9%", label: "Uptime SLA", icon: Gauge },
                { value: "<100ms", label: "Redirect Speed", icon: Zap },
                { value: "10M+", label: "URLs Shortened", icon: Globe },
                { value: "1000+", label: "Developers", icon: Users },
              ].map((stat, index) => (
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

        {/* Features Section */}
        <section
          ref={featuresRef}
          className="w-full py-16 md:py-24 bg-background"
        >
          <div className="container">
            <div
              className={`text-center mb-16 transition-all duration-1000 ${
                featuresInView ? "animate-slide-up" : "opacity-0 translate-y-10"
              }`}
            >
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
              {[
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
              ].map((feature, index) => (
                <Card
                  key={index}
                  className={`group border-2 hover:border-primary/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl glass-effect ${
                    featuresInView ? "animate-fade-in" : "opacity-0"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
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

        {/* Demo Section */}
        <section ref={demoRef} className="w-full py-16 md:py-24 bg-muted/30">
          <div className="container">
            <div
              className={`text-center mb-12 transition-all duration-1000 ${
                demoInView ? "animate-slide-up" : "opacity-0 translate-y-10"
              }`}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-6">
                Try It Now
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Experience the platform with our interactive demo. No signup
                required.
              </p>
            </div>
            <div
              className={`max-w-4xl mx-auto transition-all duration-1000 delay-300 ${
                demoInView ? "animate-fade-in" : "opacity-0 translate-y-10"
              }`}
            >
              <UrlShortenerForm />
            </div>
          </div>
        </section>

        {/* Code Example Section */}
        <section ref={codeRef} className="w-full py-16 md:py-24 bg-background">
          <div className="container">
            <div
              className={`text-center mb-12 transition-all duration-1000 ${
                codeInView ? "animate-slide-up" : "opacity-0 translate-y-10"
              }`}
            >
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-6">
                Developer Experience
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Integrate URL shortening in your React app with just a few lines
                of code.
              </p>
            </div>

            <div className="max-w-7xl mx-auto">
              <div className="grid gap-8 lg:grid-cols-2">
                <Card
                  className={`glass-effect hover:shadow-2xl transition-all duration-500 ${
                    codeInView ? "animate-fade-in" : "opacity-0 translate-x-10"
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                        <Code2 className="h-5 w-5" />
                      </div>
                      React Hook Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-card border rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-foreground">
                        {`import { useShortener } from '@url-shortener/react';

function MyComponent() {
  const { shorten, loading, data, error } = useShortener({
    baseUrl: 'https://your-domain.com'
  });

  const handleShorten = async () => {
    await shorten({
      url: 'https://example.com/very-long-url',
      metadata: {
        title: 'My Link',
        tags: ['marketing', 'campaign']
      }
    });
  };

  return (
    <div>
      <button onClick={handleShorten} disabled={loading}>
        {loading ? 'Shortening...' : 'Shorten URL'}
      </button>
      {data && <p>Short URL: {data.short_url}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`glass-effect hover:shadow-2xl transition-all duration-500 ${
                    codeInView ? "animate-fade-in" : "opacity-0 translate-x-10"
                  }`}
                  style={{ animationDelay: "200ms" }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        <Terminal className="h-5 w-5" />
                      </div>
                      REST API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-card border rounded-lg p-4 font-mono text-sm overflow-x-auto">
                      <pre className="text-foreground">
                        {`curl -X POST https://api.your-domain.com/shorten \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very-long-url",
    "custom_slug": "my-link",
    "metadata": {
      "title": "My Link",
      "tags": ["marketing", "campaign"],
      "user_name": "john_doe"
    },
    "deduplicate": true
  }'

# Response
{
  "short_url": "https://your-domain.com/my-link",
  "slug": "my-link",
  "url": "https://example.com/very-long-url",
  "metadata": { ... },
  "created_at": "2024-01-15T10:30:00Z",
  "is_duplicate": false
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Deployment Options */}
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
              {[
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
                  features: [
                    "Auto-scaling",
                    "Service mesh ready",
                    "Prometheus monitoring",
                  ],
                  buttonText: "K8s Manifests",
                  variant: "outline" as const,
                },
              ].map((option, index) => (
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
                      <Badge className="mx-auto mb-3 animate-pulse">
                        Popular
                      </Badge>
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

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-gradient-to-r from-background via-muted/50 to-background">
          <div className="container text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                Join thousands of developers building with our URL shortener
                platform. Open source, self-hostable, and production-ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Link href="/docs/getting-started" className="flex-1">
                  <Button
                    size="lg"
                    className="w-full gap-2 px-8 py-4 text-lg animate-glow"
                  >
                    Read Documentation
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link
                  href="https://github.com/kashaf12/url-shortener"
                  target="_blank"
                  className="flex-1"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full gap-2 px-8 py-4 text-lg glass-effect hover:bg-background/90 bg-transparent"
                  >
                    <Github className="h-5 w-5" />
                    Star on GitHub
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
