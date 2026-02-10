import { motion } from "framer-motion";
import { Camera, Brain, Bell, BarChart3, Heart, Clock } from "lucide-react";
import featuresImage from "@/assets/how-it-works-image.jpg";
import ParallaxImage from "@/components/landing/ParallaxImage";

const features = [
  {
    icon: Camera,
    title: "Webcam Pose Detection",
    description: "No wearables needed. Our AI uses your laptop camera to map 17 body keypoints in real time.",
  },
  {
    icon: Brain,
    title: "Intelligent Scoring",
    description: "Machine learning classifies your posture against medical ergonomics standards and gives you a live score.",
  },
  {
    icon: Bell,
    title: "Gentle Coaching Nudges",
    description: "Receive non-intrusive alerts the moment your posture drifts — before strain sets in.",
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Visualize your posture trends, session history, and weekly improvement with rich charts.",
  },
  {
    icon: Heart,
    title: "Ergonomic Standards",
    description: "Built on clinical guidelines for spine, neck, and shoulder alignment used by physiotherapists.",
  },
  {
    icon: Clock,
    title: "Smart Break Reminders",
    description: "Timed reminders adapt to your session length and posture quality so you stretch when it matters.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">Features</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your Complete Posture Toolkit
          </h2>
          <p className="text-muted-foreground">
            Six powerful capabilities working together to keep your body safe during every work session.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-4xl"
        >
          <ParallaxImage
            src={featuresImage}
            alt="AI posture analytics dashboard with body skeleton overlay, score gauges, and trend charts"
            className="rounded-2xl border border-border shadow-elevated"
            speed={0.15}
          />
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group rounded-xl border border-border bg-card p-6 shadow-soft transition-all hover:shadow-card"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 font-semibold text-card-foreground">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
