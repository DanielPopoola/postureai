import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";
import ParallaxImage from "@/components/landing/ParallaxImage";
import { useIsMobile } from "@/hooks/use-mobile";

const HeroSection = () => {
  const isMobile = useIsMobile();

  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      <div className="absolute inset-0 gradient-hero opacity-[0.03]" />

      <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 sm:py-20">
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 sm:px-4 sm:py-1.5 text-xs font-medium text-secondary-foreground">
            <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            AI-Powered Ergonomic Health
          </div>

          <h1 className="mb-4 sm:mb-6 text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Stop Slouching.
            <span className="block text-primary">Start Thriving.</span>
          </h1>

          <p className="mx-auto mb-6 sm:mb-8 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-lg">
            PostureAI watches your posture through your webcam and coaches you in real time — 
            so you can work longer, feel better, and protect your spine for years to come.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2 px-8 shadow-elevated">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-8">
                <Zap className="h-4 w-4" /> See How It Works
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 sm:mt-16 w-full max-w-4xl"
        >
          <ParallaxImage
            src={heroImage}
            alt="AI posture analysis showing spine alignment visualization on a person working at a desk"
            className="rounded-2xl border border-border shadow-elevated"
            speed={0.12}
            loading="eager"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
