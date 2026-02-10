import { motion } from "framer-motion";
import howItWorksImage from "@/assets/how-it-works-image.jpg";
import ParallaxImage from "@/components/landing/ParallaxImage";
import { useIsMobile } from "@/hooks/use-mobile";

const steps = [
  { number: "01", title: "Open Your Webcam", description: "One click to grant camera access — no downloads, no hardware." },
  { number: "02", title: "AI Maps Your Body", description: "Our pose engine tracks 17 keypoints across your neck, shoulders, and spine." },
  { number: "03", title: "Get Coached Live", description: "Instant, non-intrusive alerts when your alignment slips out of the safe zone." },
  { number: "04", title: "Watch Yourself Improve", description: "Review your posture score trends and build lasting healthy habits over time." },
];

const HowItWorksSection = () => {
  const isMobile = useIsMobile();

  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={isMobile ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-10 sm:mb-16 max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">How It Works</p>
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Better Posture in 60 Seconds
          </h2>
        </motion.div>

        <div className="mx-auto max-w-5xl flex flex-col items-center gap-10 sm:gap-16 lg:flex-row lg:gap-12">
          <motion.div
            initial={isMobile ? false : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2"
          >
            <ParallaxImage
              src={howItWorksImage}
              alt="Four-step process showing webcam setup, AI skeleton detection, alert notification, and analytics chart"
              className="rounded-2xl border border-border shadow-elevated"
              speed={0.18}
            />
          </motion.div>

          <div className="w-full lg:w-1/2 grid gap-6 sm:gap-8 grid-cols-2">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={isMobile ? false : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: isMobile ? 0 : i * 0.15 }}
                className="text-center lg:text-left"
              >
                <div className="mx-auto lg:mx-0 mb-3 sm:mb-4 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm sm:text-lg">
                  {step.number}
                </div>
                <h3 className="mb-1 sm:mb-2 text-sm sm:text-base font-semibold text-foreground">{step.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
