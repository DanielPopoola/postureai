import { motion } from "framer-motion";
import { Camera, Brain, Bell, BarChart3, Heart, Clock } from "lucide-react";
import featuresImage from "@/assets/features-image.jpg";

const features = [
  {
    icon: Camera,
    title: "Webcam Posture Detection",
    description: "Uses your webcam and AI computer vision to detect body position and joint angles in real time.",
  },
  {
    icon: Brain,
    title: "AI Posture Analysis",
    description: "Machine learning models classify your posture as good, poor, or risky based on medical ergonomics standards.",
  },
  {
    icon: Bell,
    title: "Real-Time Coaching Alerts",
    description: "Instant notifications when your posture needs correction — gentle nudges to keep you aligned.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track your posture score, session history, and improvement trends with visual reports.",
  },
  {
    icon: Heart,
    title: "Medical Ergonomics Standards",
    description: "Built on established guidelines for spine alignment, neck angle, and shoulder positioning.",
  },
  {
    icon: Clock,
    title: "Break Reminders",
    description: "Smart reminders to take breaks based on your session duration and posture patterns.",
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
            Everything You Need for Healthy Posture
          </h2>
          <p className="text-muted-foreground">
            A comprehensive AI coaching system designed to protect your body during long work sessions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-4xl overflow-hidden rounded-2xl border border-border shadow-elevated"
        >
          <img
            src={featuresImage}
            alt="Futuristic AI posture analysis visualization showing spine alignment and health metrics"
            className="w-full object-cover"
            loading="lazy"
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
