import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { apiClient, API_ENDPOINTS } from "@shared/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ArrowLeft, KeyRound } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [valid, setValid] = useState<boolean | null>(null);

  React.useEffect(() => {
    const validate = async () => {
      if (!token) return setValid(false);
      try {
        const res = await apiClient.get(API_ENDPOINTS.AUTH.VALIDATE_RESET(token));
        if (res && res.success) setValid(true);
        else setValid(false);
      } catch (err) {
        setValid(false);
      }
    };
    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await resetPassword(token!, password);
      setMessage(response.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // determine body content for rendering
  let body: React.ReactNode;
  if (message) {
    body = (
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">{message}</p>
        <Button asChild variant="outline">
          <Link to="/login">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
        </Button>
      </div>
    );
  } else if (valid === null) {
    body = <div className="text-center p-6">Validating token...</div>;
  } else if (valid === false) {
    body = (
      <div className="text-center p-6 space-y-4">
        <p className="text-destructive">This reset link is invalid or has expired.</p>
        <Button asChild variant="outline">
          <Link to="/forgot-password">Request a new reset link</Link>
        </Button>
      </div>
    );
  } else {
    body = (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Confirm your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    );
  }

  return (
    <div className="min-h-screen login-background relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 login-backdrop" />
      <Card className="w-full max-w-md login-card border-0 shadow-2xl backdrop-blur-xl bg-card/95 relative">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center flex items-center justify-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {body}
        </CardContent>
      </Card>
    </div>
  );
}
