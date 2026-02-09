import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, Mail, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useToast } from "@/hooks/use-toast";
type AuthView = "login" | "signup" | "forgot" | "reset";

const validatePassword = (pwd: string) => {
  const errors: string[] = [];
  if (pwd.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(pwd)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(pwd)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(pwd)) errors.push("One number");
  return errors;
};

const Auth = () => {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setView("reset");
        return;
      }
      if (session && view !== "reset") navigate("/dashboard");
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && view !== "reset") navigate("/dashboard");
    });
    return () => subscription.unsubscribe();
  }, [navigate, view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate password for signup and reset views
    if (view === "signup") {
      const errors = validatePassword(password);
      setPasswordErrors(errors);
      if (errors.length > 0) return;
    }
    if (view === "reset") {
      const errors = validatePassword(newPassword);
      setPasswordErrors(errors);
      if (errors.length > 0) return;
    }
    setLoading(true);
    try {
      if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "You're now logged in." });
      } else if (view === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast({ title: "Account created!", description: "Please check your email to verify your account." });
      } else if (view === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });
        if (error) throw error;
        toast({ title: "Email sent!", description: "Check your inbox for a password reset link." });
        setView("login");
      } else if (view === "reset") {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <Activity className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">PostureAI</span>
        </div>
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-center text-lg">
              {view === "login" && "Sign in to your account"}
              {view === "signup" && "Create your account"}
              {view === "forgot" && "Reset your password"}
              {view === "reset" && "Set a new password"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {(view === "login" || view === "signup" || view === "forgot") && (
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              )}
              {(view === "login" || view === "signup") && (
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (view === "signup") setPasswordErrors(validatePassword(e.target.value));
                      }}
                      className="pl-10"
                      required
                      minLength={8}
                    />
                  </div>
                  {view === "signup" && passwordErrors.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-xs text-destructive">
                      {passwordErrors.map((err) => <li key={err}>• {err}</li>)}
                    </ul>
                  )}
                </div>
              )}
              {view === "reset" && (
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPasswordErrors(validatePassword(e.target.value));
                      }}
                      className="pl-10"
                      required
                      minLength={8}
                    />
                  </div>
                  {passwordErrors.length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 text-xs text-destructive">
                      {passwordErrors.map((err) => <li key={err}>• {err}</li>)}
                    </ul>
                  )}
                </div>
              )}
              {view === "login" && (
                <div className="text-right">
                  <button type="button" onClick={() => setView("forgot")} className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Please wait..." : view === "login" ? "Sign In" : view === "signup" ? "Sign Up" : view === "forgot" ? "Send Reset Link" : "Update Password"}
              </Button>
            </form>

            {(view === "login" || view === "signup") && (
              <>
                <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    or
                  </span>
                </div>
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const { error } = await lovable.auth.signInWithOAuth("google", {
                        redirect_uri: window.location.origin,
                      });
                      if (error) throw error;
                    } catch (err: any) {
                      toast({ title: "Error", description: err.message, variant: "destructive" });
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.76h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </Button>
              </>
            )}

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {view === "login" && (<>Don't have an account?{" "}<button onClick={() => setView("signup")} className="text-primary hover:underline font-medium">Sign up</button></>)}
              {view === "signup" && (<>Already have an account?{" "}<button onClick={() => setView("login")} className="text-primary hover:underline font-medium">Sign in</button></>)}
              {view === "forgot" && (<>Remember your password?{" "}<button onClick={() => setView("login")} className="text-primary hover:underline font-medium">Sign in</button></>)}
              {view === "reset" && (<><button onClick={() => setView("login")} className="text-primary hover:underline font-medium">Back to sign in</button></>)}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
