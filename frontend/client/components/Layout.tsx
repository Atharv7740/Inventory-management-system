import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import {
  Truck,
  BarChart3,
  Package,
  Users,
  LogOut,
  Menu,
  X,
  Home,
} from "lucide-react";
import { cn } from "../lib/utils";
import LogoutConfirmation from "./LogoutConfirmation";
import { useToast } from "../hooks/use-toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    roles: ["admin", "staff"],
  },
  {
    name: "Transportation",
    href: "/transportation",
    icon: Truck,
    roles: ["admin", "staff"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
    roles: ["admin", "staff"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "staff"],
  },
  { name: "User Management", href: "/users", icon: Users, roles: ["admin"] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    try {
      const username = user?.username;
      logout();
      setSidebarOpen(false); // Close mobile sidebar if open
      setShowLogoutConfirm(false);

      // Show success toast
      toast({
        title: "Signed out successfully",
        description: `Goodbye ${username}! You have been signed out of TransportPro.`,
        duration: 3000,
      });

      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout even if there's an error
      setShowLogoutConfirm(false);

      // Show error toast
      toast({
        title: "Signed out",
        description: "You have been signed out due to an error.",
        variant: "destructive",
        duration: 3000,
      });

      navigate("/login", { replace: true });
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || ""),
  );

  // Add keyboard shortcut for logout (Ctrl+Shift+L or Cmd+Shift+L)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "L" &&
        event.shiftKey &&
        (event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault();
        handleLogoutClick();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden",
        )}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="absolute left-0 top-0 h-full w-72 bg-sidebar-background shadow-2xl transform transition-transform duration-300 ease-out animate-in slide-in-from-left-72">
          <div className="sidebar-header flex h-16 items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="sidebar-brand text-lg">TransportPro</span>
                <span className="text-xs text-sidebar-foreground/70 font-medium">
                  Transport Management
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-sidebar-foreground hover:bg-sidebar-accent rounded-lg p-2"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="mt-8 px-4 flex-1">
            <div className="nav-section mb-4">
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-3">
                Navigation
              </h3>
              <ul className="space-y-1">
                {filteredNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        "nav-link",
                        location.pathname === item.href && "active",
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Mobile User info and logout */}
          <div className="p-4 border-t border-sidebar-border/50 bg-gradient-to-r from-sidebar-background to-sidebar-accent/30">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="user-avatar w-10 h-10 rounded-xl flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-sidebar-background animate-pulse"
                    title="Online"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {user?.username}
                  </p>
                  <p className="text-xs text-sidebar-foreground/80 capitalize font-medium">
                    {user?.role} User
                  </p>
                  {user?.lastLogin && (
                    <p className="text-xs text-sidebar-foreground/60">
                      Last: {new Date(user.lastLogin).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogoutClick}
                className="w-full justify-start text-sidebar-foreground border-sidebar-border/70 hover:bg-sidebar-accent hover:border-sidebar-border font-medium transition-all duration-200 hover:shadow-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:w-72 lg:flex lg:flex-col">
        <div className="sidebar-backdrop flex flex-col flex-1 shadow-xl">
          {/* Logo */}
          <div className="sidebar-header flex h-16 items-center px-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="sidebar-brand text-lg">TransportPro</span>
                <span className="text-xs text-sidebar-foreground/70 font-medium">
                  Transport Management
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 px-4 flex-1">
            <div className="nav-section mb-4">
              <h3 className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider px-3 mb-3">
                Navigation
              </h3>
              <ul className="space-y-1">
                {filteredNavigation.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        "nav-link",
                        location.pathname === item.href && "active",
                      )}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-sidebar-border/50 bg-gradient-to-r from-sidebar-background to-sidebar-accent/30">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-default flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative">
                      <div className="user-avatar w-9 h-9 rounded-lg flex items-center justify-center">
                        <span className="text-sm font-bold">
                          {user?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div
                        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-sidebar-background animate-pulse"
                        title="Online"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-sidebar-foreground truncate">
                        {user?.username}
                      </p>
                      <p className="text-xs text-sidebar-foreground/80 capitalize font-medium">
                        {user?.role} User
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Last login:{" "}
                    {user?.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "Unknown"}
                  </p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogoutClick}
                    className="text-sidebar-foreground hover:bg-sidebar-accent rounded-lg p-2 transition-all duration-200 hover:shadow-sm ml-2"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sign Out (Ctrl+Shift+L)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile header */}
        <div className="lg:hidden bg-card border-b border-border">
          <div className="flex h-16 items-center justify-between px-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <Truck className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">TransportPro</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogoutClick}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        username={user?.username}
      />
    </div>
  );
}
