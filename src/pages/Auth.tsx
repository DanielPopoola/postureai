import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Mail, Lock, Eye, EyeOff, ArrowRight, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type AuthView = "login" | "signup" | "forgot" | "reset";

const validatePassword = (pwd: string) => {
  const errors: string[] = [];
  if (pwd.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(pwd)) errors.push("One number");
  return errors;
};

const viewConfig = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to continue your posture journey",
    cta: "Sign In",
  },
  signup: {
    title: "Get started",
    subtitle: "Create your free account today",
    cta: "Create Account",
  },
  forgot: {
    title: "Forgot password?",
    subtitle: "We'll send a reset link to your email",
    cta: "Send Reset Link",
  },
  reset: {
    title: "Set new password",
    subtitle: "Choose a strong password for your account",
    cta: "Update Password",
  },
};

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setView("reset");
        return;
      }
      if (event === "SIGNED_IN" && session && view !== "reset") {
        navigate("/dashboard", { replace: true });
      }
    });

    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true });
    });

    return () => subscription.unsubscribe();
  }, [navigate, view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "You're now logged in." });

      } else if (view === "signup") {
        const errors = validatePassword(password);
        if (errors.length > 0) {
          setPasswordErrors(errors);
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          toast({ title: "Passwords don't match", description: "Please make sure both passwords are the same.", variant: "destructive" });
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        if (error) throw error;
        toast({
          title: "Check your email!",
          description: "We sent you a confirmation link. Click it to activate your account.",
        });
        // Reset form back to login after signup
        setView("login");
        setPassword("");
        setConfirmPassword("");

      } else if (view === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast({ title: "Email sent!", description: "Check your inbox for a password reset link." });
        setView("login");

      } else if (view === "reset") {
        const errors = validatePassword(newPassword);
        setPasswordErrors(errors);
        if (errors.length > 0) {
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast({ title: "Password updated!", description: "You can now sign in with your new password." });
        setView("login");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
      // Browser will redirect — no need to setLoading(false)
    } catch (err: any) {
      toast({ title: "Google sign-in failed", description: err.message, variant: "destructive" });
      setGoogleLoading(false);
    }
  };

  const switchView = (next: AuthView) => {
    setPasswordErrors([]);
    setPassword("");
    setConfirmPassword("");
    setNewPassword("");
    setShowPassword(false);
    setShowConfirm(false);
    setView(next);
  };

  const config = viewConfig[view];
  const showMainForm = view !== "reset";

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 overflow-hidden">
      {/* Subtle background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
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
                {/* Google OAuth — only on login/signup */}
                {(view === "login" || view === "signup") && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-11 gap-2 font-medium"
                      onClick={handleGoogleSignIn}
                      disabled={googleLoading || loading}
                    >
                      {googleLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                      ) : (
                        <GoogleIcon />
                      )}
                      {view === "signup" ? "Sign up with Google" : "Continue with Google"}
                    </Button>

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted-foreground">or</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  </>
                )}

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Email — all views except reset */}
                  {view !== "reset" && (
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11"
                        required
                        autoComplete="email"
                        disabled={loading}
                      />
                    </div>
                  )}

                  {/* Password — login and signup */}
                  {(view === "login" || view === "signup") && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (view === "signup") setPasswordErrors(validatePassword(e.target.value));
                        }}
                        className="pl-10 pr-10 h-11"
                        required
                        minLength={8}
                        autoComplete={view === "signup" ? "new-password" : "current-password"}
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  )}

                  {/* Confirm password — signup only */}
                  {view === "signup" && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showConfirm ? "text" : "password"}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 h-11"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  )}

                  {/* New password — reset view */}
                  {view === "reset" && (
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="New password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordErrors(validatePassword(e.target.value));
                        }}
                        className="pl-10 pr-10 h-11"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  )}

                  {/* Password validation hints */}
                  <AnimatePresence>
                    {passwordErrors.length > 0 && (view === "signup" || view === "reset") && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-0.5 text-xs text-destructive overflow-hidden"
                      >
                        {passwordErrors.map((err) => (
                          <li key={err}>• {err}</li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>

                  {/* Forgot password link — login only */}
                  {view === "login" && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => switchView("forgot")}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 gap-2 font-medium"
                    disabled={loading || googleLoading}
                  >
                    {loading ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                    {loading ? "Please wait..." : config.cta}
                  </Button>
                </form>

                {/* Footer links */}
                <p className="text-center text-sm text-muted-foreground">
                  {view === "login" && (
                    <>
                      Don't have an account?{" "}
                      <button
                        onClick={() => switchView("signup")}
                        className="font-medium text-primary hover:underline"
                      >
                        Sign up free
                      </button>
                    </>
                  )}
                  {view === "signup" && (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => switchView("login")}
                        className="font-medium text-primary hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                  {view === "forgot" && (
                    <>
                      Remember your password?{" "}
                      <button
                        onClick={() => switchView("login")}
                        className="font-medium text-primary hover:underline"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                  {view === "reset" && (
                    <button
                      onClick={() => switchView("login")}
                      className="font-medium text-primary hover:underline"
                    >
                      Back to sign in
                    </button>
                  )}
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

// Inline Google SVG icon to avoid external dependency
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default Auth;
