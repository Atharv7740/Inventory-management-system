import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Eye,
  EyeOff,
  Truck,
  Shield,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen login-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 login-backdrop">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-sidebar-primary/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <div
          className={`w-full max-w-md transform transition-all duration-1000 ease-out ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 login-logo mb-6 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300" />
              <div className="relative bg-gradient-to-br from-primary to-accent rounded-2xl p-4 shadow-2xl">
                <Truck className="w-8 h-8 text-white" />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-accent animate-bounce" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-3">
              TransportPro
            </h1>
            <p className="text-black text-lg font-medium">
              Professional Transport Management System
            </p>
          </div>

          {/* Login Card */}
          <Card className="login-card border-0 shadow-2xl backdrop-blur-xl bg-card/95 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <CardHeader className="space-y-1 pb-6 relative">
              <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
                Welcome Back
                <ArrowRight className="w-5 h-5 text-primary" />
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Sign in to access your transport management dashboard
              </p>
            </CardHeader>
            <CardContent className="relative">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 login-submit-btn relative overflow-hidden group"
                  disabled={isLoading || loading}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                      </>
                    )}
                  </span>
                </Button>
              </form>

              {/* Demo Credentials */}
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground text-center mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Demo Credentials
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className="demo-credential-card group cursor-pointer"
                    onClick={() => {
                      setEmail("admin@transportpro.com");
                      setPassword("admin123");
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-semibold">Admin</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono bg-background/50 px-2 py-1 rounded">
                      admin@transportpro.com
                    </p>
                  </div>
                  <div
                    className="demo-credential-card group cursor-pointer"
                    onClick={() => {
                      setEmail("staff@transportpro.com");
                      setPassword("staff123");
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                        <Users className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-semibold">Staff</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono bg-background/50 px-2 py-1 rounded">
                      staff@transportpro.com
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground/80">
            <p className="flex items-center justify-center gap-2">
              © 2024 TransportPro. Professional transport management.
              <Truck className="w-4 h-4" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
