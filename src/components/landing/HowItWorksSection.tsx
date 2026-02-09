import { motion } from "framer-motion";
import howItWorksImage from "@/assets/how-it-works-image.jpg";
import ParallaxImage from "@/components/landing/ParallaxImage";

const steps = [
  { number: "01", title: "Enable Your Webcam", description: "Grant camera access and the AI begins monitoring your posture instantly." },
  { number: "02", title: "AI Analyzes Posture", description: "Our pose detection engine tracks 17 body keypoints to evaluate your positioning." },
  { number: "03", title: "Get Real-Time Feedback", description: "Receive coaching alerts when your posture deviates from ergonomic standards." },
  { number: "04", title: "Track & Improve", description: "Review your posture analytics and build healthier long-term habits." },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">How It Works</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple Setup, Powerful Results
          </h2>
        </motion.div>

        <div className="mx-auto max-w-5xl flex flex-col items-center gap-16 lg:flex-row lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <ParallaxImage
              src={howItWorksImage}
              alt="Person with perfect posture at a modern ergonomic workspace"
              className="rounded-2xl border border-border shadow-elevated"
              speed={0.18}
            />
          </motion.div>

          <div className="w-full lg:w-1/2 grid gap-8 sm:grid-cols-2">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center lg:text-left"
              >
                <div className="mx-auto lg:mx-0 mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {step.number}
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
