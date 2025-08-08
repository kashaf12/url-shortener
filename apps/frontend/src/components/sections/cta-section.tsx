import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

export function CTASection() {
  return (
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
  );
}
