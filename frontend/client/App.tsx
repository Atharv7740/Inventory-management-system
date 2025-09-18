import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TransportProvider } from "./contexts/TransportContext";
import { InventoryProvider } from "./contexts/InventoryContext";
import { ReportsProvider } from "./contexts/ReportsContext";
import { UserProvider } from "./contexts/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transportation from "./pages/Transportation";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import UserManagement from "./pages/UserManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AuthenticatedDataProviders>
              <Layout />
            </AuthenticatedDataProviders>
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="transportation" element={<Transportation />} />
        <Route path="transportation/new" element={<Transportation />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="inventory/new" element={<Inventory />} />
        <Route path="reports" element={<Reports />} />
        <Route
          path="users"
          element={
            <ProtectedRoute requireRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="users/new"
          element={
            <ProtectedRoute requireRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

// Create a wrapper for authenticated data providers
function AuthenticatedDataProviders({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <TransportProvider>
        <InventoryProvider>
          <ReportsProvider>
            {children}
          </ReportsProvider>
        </InventoryProvider>
      </TransportProvider>
    </UserProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
