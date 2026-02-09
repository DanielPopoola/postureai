import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import benefitsImage from "@/assets/benefits-image.jpg";

const benefits = [
  "Improved posture and spinal alignment",
  "Reduced neck and shoulder strain",
  "Better health awareness during work",
  "Injury prevention from prolonged sitting",
  "Increased productivity and focus",
  "Long-term musculoskeletal protection",
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
                Protect Your Body While You Work
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                PostureAI acts as your preventive health companion — not for diagnosis, but for building 
                awareness and habits that keep your body safe during remote work.
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
            className="flex-1 overflow-hidden rounded-2xl border border-border shadow-elevated"
          >
            <img
              src={benefitsImage}
              alt="Person doing neck stretches at their desk for better posture"
              className="w-full object-cover"
              loading="lazy"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
