import Link from "next/link";
import { Twitter, Zap, ExternalLink, Github } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="col-span-1 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-3 mb-4 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">URLShortener</span>
              <Badge variant="outline" className="text-xs">
                Open Source
              </Badge>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
              Open-source, developer-first URL shortening platform.
              Self-hostable with enterprise features and React integration.
              Built by developers, for developers.
            </p>
            <div className="flex space-x-4">
              <Link
                href="https://github.com/kashaf12/url-shortener"
                className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 duration-300"
                target="_blank"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link
                href="https://twitter.com/kashaf12"
                className="text-muted-foreground hover:text-foreground transition-colors hover:scale-110 duration-300"
                target="_blank"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">
              Product
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Analytics
                </Link>
              </li>
              <li>
                <Link
                  href="/qr-code"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  QR Codes
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">
              Developers
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/docs"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/api-reference"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  API Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/integration/react-hook"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  React Hook
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/deployment"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Self-Hosting
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4 text-foreground">
              Company
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} URLShortener. Open source under MIT License.
          </p>
          <div className="flex items-center space-x-6 text-sm">
            <Link
              href="https://github.com/kashaf12/url-shortener/releases"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              target="_blank"
            >
              v2.1.0
              <ExternalLink className="h-3 w-3" />
            </Link>
            <Link
              href="https://status.kashaf12.com"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              target="_blank"
            >
              Status
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
