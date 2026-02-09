import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-image.jpg";
import ParallaxImage from "@/components/landing/ParallaxImage";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero opacity-[0.03]" />
      
      <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-xs font-medium text-secondary-foreground">
            <Shield className="h-3.5 w-3.5" />
            AI-Powered Ergonomic Health
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your Personal
            <span className="block text-primary"> Posture Coach</span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Real-time AI posture monitoring that helps remote workers prevent strain, 
            improve alignment, and build healthier work habits — all through your webcam.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2 px-8 shadow-elevated">
                Start Monitoring <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="outline" size="lg" className="gap-2 px-8">
                <Zap className="h-4 w-4" /> See How It Works
              </Button>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 w-full max-w-4xl"
        >
          <ParallaxImage
            src={heroImage}
            alt="AI posture analysis showing ergonomic alignment points on a person working at a desk"
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
