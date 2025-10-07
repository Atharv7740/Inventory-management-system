import React, { useState } from "react";
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
import { ArrowLeft, Mail, Sparkles } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword(email);
      setMessage(response.message);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen login-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 login-backdrop" />
      <Card className="w-full max-w-md login-card border-0 shadow-2xl backdrop-blur-xl bg-card/95 relative">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {message ? (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">{message}</p>
              <Button asChild variant="outline">
                <Link to="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}
          <div className="mt-4 text-center">
            <Button asChild variant="link" className="text-muted-foreground">
              <Link to="/login">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Remembered your password? Sign in.
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
