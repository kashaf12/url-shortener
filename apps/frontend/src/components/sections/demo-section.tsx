"use client";

import { UrlShortenerForm } from "@/components/url-shortener-form";

export function DemoSection() {
  return (
    <section className="w-full py-16 md:py-24 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter mb-6">
            Try It Now
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            Experience the platform with our interactive demo. No signup
            required.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <UrlShortenerForm />
        </div>
      </div>
    </section>
  );
}
