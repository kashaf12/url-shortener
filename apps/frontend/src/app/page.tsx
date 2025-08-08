import Header from "@/components/header";
import Footer from "@/components/footer";
import {
  HeroSection,
  StatsSection,
  FeaturesSection,
  DemoSection,
  CodeExampleSection,
  DeploymentSection,
  CTASection,
} from "@/components/sections";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <DemoSection />
        <CodeExampleSection />
        <DeploymentSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
