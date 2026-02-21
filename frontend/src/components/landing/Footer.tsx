import { Activity } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">PostureAI</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 PostureAI. For ergonomic awareness only — not a medical diagnostic tool.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
