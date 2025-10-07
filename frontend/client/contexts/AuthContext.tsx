import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiClient, API_ENDPOINTS, User, LoginRequest, LoginResponse, ApiResponse } from "../../shared/api";
import { useToast } from "../hooks/use-toast";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resetPassword: (token: string, password: string) => Promise<{ message: string }>;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const response = await apiClient.get<ApiResponse<User>>(API_ENDPOINTS.AUTH.PROFILE);
          if (response.success && response.data) {
            setUser(response.data);
            localStorage.setItem('user', JSON.stringify(response.data));
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          apiClient.clearToken();
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const loginData: LoginRequest = { email, password };
      const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, loginData);
      
      if (response.success && response.user && response.token) {
        apiClient.setToken(response.token);
        const userWithLastLogin = {
          ...response.user,
          lastLogin: new Date().toISOString(),
        };
        setUser(userWithLastLogin);
        localStorage.setItem('user', JSON.stringify(userWithLastLogin));
        localStorage.setItem('authToken', response.token);
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.user.fullName || response.user.username}!`,
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiClient.put<ApiResponse<User>>(API_ENDPOINTS.AUTH.PROFILE, data);
      
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
        
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiClient.put<ApiResponse>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        oldPassword,
        newPassword
      });
      
      if (response.success) {
        toast({
          title: "Password Changed",
          description: "Your password has been successfully changed.",
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Change password error:', error);
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<{ message: string }> => {
    setLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      if (response.success && response.data) {
        toast({
          title: "Password Reset Email Sent",
          description: response.data.message,
        });
        return response.data;
      }
      throw new Error(response.message || 'Failed to send reset email.');
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        title: "Request Failed",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token: string, password: string): Promise<{ message: string }> => {
    setLoading(true);
    try {
      const response = await apiClient.post<ApiResponse<{ message: string }>>(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, newPassword: password });
      
      if (response.success && response.data) {
        toast({
          title: "Password Reset Successful",
          description: response.data.message,
        });
        return response.data;
      }
      throw new Error(response.message || 'Failed to reset password.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Reset Failed",
        description: error.message || "Invalid or expired token. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      apiClient.clearToken();
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      localStorage.removeItem("sessionId");
      sessionStorage.clear();

      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      setUser(null);
      localStorage.clear();
      apiClient.clearToken();
    }
  };

  const value = {
    user,
    login,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
