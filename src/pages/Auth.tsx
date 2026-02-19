import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type AuthView = "login" | "signup" | "forgot";

const validatePassword = (pwd: string) => {
  const errors: string[] = [];
  if (pwd.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(pwd)) errors.push("One number");
  return errors;
};

const viewConfig = {
  login:  { title: "Welcome back",     subtitle: "Sign in to continue your posture journey", cta: "Sign In"        },
  signup: { title: "Get started",      subtitle: "Create your free account today",            cta: "Create Account" },
  forgot: { title: "Forgot password?", subtitle: "We'll send a reset link to your email",     cta: "Send Reset Link"},
};

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "login") {
        await login(email, password);
        navigate("/dashboard", { replace: true });

      } else if (view === "signup") {
        const errors = validatePassword(password);
        if (errors.length > 0) { setPasswordErrors(errors); return; }
        if (password !== confirmPassword) {
          toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" });
          return;
        }
        await register(email, password, email.split("@")[0]);
        navigate("/dashboard", { replace: true });

      } else if (view === "forgot") {
        // TODO: wire to FastAPI password reset endpoint when implemented
        toast({ title: "Coming soon", description: "Password reset will be available shortly." });
      }

    } catch (err: any) {
      toast({ title: "Error", description: err.response?.data?.detail ?? err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const switchView = (next: AuthView) => {
    setPasswordErrors([]);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirm(false);
    setView(next);
  };

  const config = viewConfig[view];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-elevated">
            <Activity className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">PostureAI</span>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="shadow-elevated border-border/50">
              <CardHeader className="pb-2 pt-6 px-6">
                <h1 className="text-xl font-semibold text-foreground">{config.title}</h1>
                <p className="text-sm text-muted-foreground">{config.subtitle}</p>
              </CardHeader>

              <CardContent className="px-6 pb-6 pt-4 space-y-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email" placeholder="Email address" value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11" required autoComplete="email" disabled={loading}
                    />
                  </div>

                  {(view === "login" || view === "signup") && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"} placeholder="Password" value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (view === "signup") setPasswordErrors(validatePassword(e.target.value));
                        }}
                        className="pl-10 pr-10 h-11" required minLength={8}
                        autoComplete={view === "signup" ? "new-password" : "current-password"} disabled={loading}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  )}

                  {view === "signup" && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showConfirm ? "text" : "password"} placeholder="Confirm password" value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-11" required minLength={8} autoComplete="new-password" disabled={loading}
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  )}

                  <AnimatePresence>
                    {passwordErrors.length > 0 && view === "signup" && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-0.5 text-xs text-destructive overflow-hidden"
                      >
                        {passwordErrors.map((err) => <li key={err}>• {err}</li>)}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  {view === "login" && (
                    <div className="text-right">
                      <button type="button" onClick={() => switchView("forgot")}
                        className="text-xs text-primary hover:underline">Forgot password?</button>
                    </div>
                  )}

                  <Button type="submit" className="w-full h-11 gap-2 font-medium" disabled={loading}>
                    {loading
                      ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      : <ArrowRight className="h-4 w-4" />}
                    {loading ? "Please wait..." : config.cta}
                  </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  {view === "login" && <>Don't have an account?{" "}<button onClick={() => switchView("signup")} className="font-medium text-primary hover:underline">Sign up free</button></>}
                  {view === "signup" && <>Already have an account?{" "}<button onClick={() => switchView("login")} className="font-medium text-primary hover:underline">Sign in</button></>}
                  {view === "forgot" && <>Remember your password?{" "}<button onClick={() => switchView("login")} className="font-medium text-primary hover:underline">Sign in</button></>}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Auth;