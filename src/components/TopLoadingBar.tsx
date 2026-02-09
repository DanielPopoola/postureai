import { motion } from "framer-motion";

const TopLoadingBar = () => (
  <div className="fixed inset-0 z-[9999] bg-background">
    <motion.div
      className="h-[3px] bg-primary"
      initial={{ width: "0%" }}
      animate={{ width: "90%" }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    />
  </div>
);

export default TopLoadingBar;
