import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ctaImage from "@/assets/cta-image.jpg";
import ParallaxImage from "@/components/landing/ParallaxImage";

const CTASection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl overflow-hidden rounded-2xl shadow-elevated"
        >
          <div className="relative">
            <ParallaxImage
              src={ctaImage}
              alt="Happy remote worker with great posture in a modern home office"
              className="h-64"
              speed={0.2}
            />
            <div className="absolute inset-0 gradient-hero opacity-70" />
          </div>
          <div className="gradient-hero p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary-foreground">
              Your Spine Will Thank You
            </h2>
            <p className="mb-8 text-primary-foreground/80">
              Join thousands of remote workers who've eliminated back pain and built healthier habits with AI coaching.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="gap-2 px-8 shadow-elevated">
                Start Free Today <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
