import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthView = "login" | "forgot" | "reset";

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
      if (event === "SIGNED_IN" && session && view !== "reset") {
        navigate("/dashboard", { replace: true });
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && view !== "reset") navigate("/dashboard", { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate, view]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <Activity className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold text-foreground">PostureAI</span>
        </div>

        <Card className="shadow-soft">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg">
              {view === "login" && "Sign in"}
              {view === "forgot" && "Reset your password"}
              {view === "reset" && "Set a new password"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              {(view === "login" || view === "forgot") && (
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11"
                    required
                    autoComplete="email"
                  />
                </div>
              )}
              {view === "login" && (
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11"
                      required
                      minLength={8}
                      autoComplete="current-password"
                    />
                  </div>
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
                      className="pl-10 h-11"
                      required
                      minLength={8}
                      autoComplete="new-password"
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
              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? "Please wait..." : view === "login" ? "Sign In" : view === "forgot" ? "Send Reset Link" : "Update Password"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {view === "forgot" && (<>Remember your password?{" "}<button onClick={() => setView("login")} className="text-primary hover:underline font-medium">Sign in</button></>)}
              {view === "reset" && (<><button onClick={() => setView("login")} className="text-primary hover:underline font-medium">Back to sign in</button></>)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
