import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import benefitsImage from "@/assets/benefits-image.jpg";
import ParallaxImage from "@/components/landing/ParallaxImage";

const benefits = [
  "Stronger spinal alignment throughout the day",
  "Less neck and shoulder tension after long sessions",
  "Proactive injury prevention — not reactive treatment",
  "Measurable posture improvement week over week",
  "More energy and focus from reduced physical strain",
  "Healthier long-term work habits built on data",
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-24">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1 space-y-6"
          >
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Benefits</p>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Work Longer. Feel Better.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                PostureAI is your silent ergonomic companion — building awareness, correcting habits, and 
                protecting your body so you can do your best work without the aches.
              </p>
            </div>

            <ul className="space-y-4">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
                  <span className="text-foreground">{benefit}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex-1"
          >
            <ParallaxImage
              src={benefitsImage}
              alt="Professional stretching at her desk for better posture and wellness"
              className="rounded-2xl border border-border shadow-elevated"
              speed={0.15}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
