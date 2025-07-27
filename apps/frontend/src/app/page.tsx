"use client";

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
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-gray-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  <Github className="h-3 w-3 mr-1" />
                  Open Source
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <Code2 className="h-3 w-3 mr-1" />
                  Developer First
                </Badge>
              </div>

              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
                The Complete
                <br />
                <span className="relative bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
                  URL Shortener Platform
                </span>
              </h1>

              <p className="max-w-[700px] text-gray-600 md:text-xl leading-relaxed">
                Self-hostable, pluggable, and developer-first URL shortening
                platform. Complete with React hooks, REST API, analytics, and
                enterprise features.
              </p>

              <div className="flex flex-col gap-4 min-[400px]:flex-row">
                <Link href="/docs/getting-started">
                  <Button size="lg" className="gap-2 px-8">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link
                  href="https://github.com/kashaf12/url-shortener"
                  target="_blank"
                >
                  <Button
                    variant="outline"
                    size="lg"
                    className="gap-2 px-8 bg-transparent"
                  >
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </Link>
              </div>

              {/* GitHub Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  <span className="font-medium">2.1k</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork className="h-4 w-4" />
                  <span className="font-medium">340</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  <span className="font-medium">15k/month</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="w-full py-12 md:py-16 bg-white border-y">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4 text-center">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-black">99.9%</h3>
                <p className="text-gray-600">Uptime SLA</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-black">&lt;100ms</h3>
                <p className="text-gray-600">Redirect Speed</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-black">10M+</h3>
                <p className="text-gray-600">URLs Shortened</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold text-black">1000+</h3>
                <p className="text-gray-600">Developers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Built for Developers
              </h2>
              <p className="text-gray-600 md:text-xl max-w-2xl mx-auto">
                Everything you need to integrate URL shortening into your
                applications, with enterprise-grade features and self-hosting
                options.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-2 hover:border-gray-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black text-white rounded-lg">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">React Hook</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Drop-in React hook with TypeScript support. Integrate URL
                    shortening in minutes with full error handling and loading
                    states.
                  </CardDescription>
                  <div className="mt-4 p-3 bg-gray-100 rounded-md font-mono text-sm">
                    npm install @kashaf12/react
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-gray-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black text-white rounded-lg">
                      <Zap className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">High Performance</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Sub-100ms redirects with PostgreSQL indexing, connection
                    pooling, and optimized database queries. Built to handle
                    enterprise scale.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-gray-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black text-white rounded-lg">
                      <Shield className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">Security First</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Malicious URL detection, rate limiting, input validation,
                    and GDPR compliance. Enterprise security without the
                    complexity.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-gray-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black text-white rounded-lg">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">
                      Advanced Analytics
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Detailed click tracking, geographic data, device analytics,
                    and referrer insights. Privacy-focused with opt-out
                    capabilities.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-gray-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black text-white rounded-lg">
                      <Globe className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">Self-Hostable</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Deploy anywhere with Docker, Kubernetes, or traditional
                    hosting. Full control over your data and infrastructure.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-gray-300 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black text-white rounded-lg">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">
                      Monorepo Architecture
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    Organized with Turbo + pnpm workspaces. Shared types, UI
                    components, and optimized builds across frontend, backend,
                    and packages.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Try It Now
              </h2>
              <p className="text-gray-600 md:text-xl max-w-2xl mx-auto">
                Experience the platform with our interactive demo. No signup
                required.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <UrlShortenerForm />
            </div>
          </div>
        </section>

        {/* Code Example Section */}
        <section className="w-full py-16 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Developer Experience
              </h2>
              <p className="text-gray-600 md:text-xl max-w-2xl mx-auto">
                Integrate URL shortening in your React app with just a few lines
                of code.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid gap-8 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code2 className="h-5 w-5" />
                      React Hook Usage
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`import { useShortener } from '@kashaf12/react';

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
}`}</pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      REST API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                      <pre>{`curl -X POST https://api.your-domain.com/shorten \\
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
}`}</pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Deployment Options */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Deploy Anywhere
              </h2>
              <p className="text-gray-600 md:text-xl max-w-2xl mx-auto">
                Choose your deployment strategy. From managed services to
                self-hosted infrastructure.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-xl">Managed Services</CardTitle>
                  <CardDescription>Recommended for most teams</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div>Frontend: Vercel</div>
                    <div>Backend: Railway/Render</div>
                    <div>Database: Supabase</div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Deploy Guide
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-black">
                <CardHeader>
                  <Badge className="mx-auto mb-2">Popular</Badge>
                  <CardTitle className="text-xl">Docker Compose</CardTitle>
                  <CardDescription>Self-hosted with containers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div>Single command deployment</div>
                    <div>PostgreSQL included</div>
                    <div>Nginx reverse proxy</div>
                  </div>
                  <Button className="w-full">Quick Start</Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <CardTitle className="text-xl">Kubernetes</CardTitle>
                  <CardDescription>Enterprise scale</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <div>Auto-scaling</div>
                    <div>Service mesh ready</div>
                    <div>Prometheus monitoring</div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    K8s Manifests
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 bg-black text-white">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-gray-300 md:text-xl max-w-2xl mx-auto mb-8">
              Join thousands of developers building with our URL shortener
              platform. Open source, self-hostable, and production-ready.
            </p>
            <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
              <Link href="/docs/getting-started">
                <Button size="lg" variant="secondary" className="gap-2 px-8">
                  Read Documentation
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link
                href="https://github.com/kashaf12/url-shortener"
                target="_blank"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 px-8 border-white text-white hover:bg-white hover:text-black bg-transparent"
                >
                  <Github className="h-4 w-4" />
                  Star on GitHub
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
