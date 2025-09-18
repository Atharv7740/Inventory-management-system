import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  ArrowRight,
  Truck,
  BarChart3,
  Package,
  Users,
  Shield,
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle,
  Star,
  Zap,
  Globe,
  Mail,
  Phone,
  MapPin as LocationIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Transportation Management",
    description:
      "Complete trip planning, tracking, and profit calculation with real-time monitoring.",
    color: "primary",
    items: [
      "Trip Planning",
      "Route Optimization",
      "Real-time Tracking",
      "Profit Analytics",
    ],
  },
  {
    icon: Package,
    title: "Inventory Management",
    description:
      "Full truck lifecycle management from purchase to sale with detailed expense tracking.",
    color: "accent",
    items: [
      "Truck Registration",
      "Expense Tracking",
      "NOC Management",
      "Sale Analytics",
    ],
  },
  {
    icon: BarChart3,
    title: "Advanced Reports",
    description:
      "Comprehensive analytics and reporting with data visualization and export capabilities.",
    color: "success",
    items: [
      "Performance Metrics",
      "Financial Reports",
      "Trend Analysis",
      "Data Export",
    ],
  },
  {
    icon: Users,
    title: "User Management",
    description:
      "Role-based access control with granular permissions and user activity tracking.",
    color: "warning",
    items: [
      "Role Management",
      "Access Control",
      "User Permissions",
      "Activity Logs",
    ],
  },
  {
    icon: Shield,
    title: "Security & Compliance",
    description:
      "Enterprise-grade security with audit trails and compliance management.",
    color: "primary",
    items: ["Data Security", "Audit Trails", "Compliance", "Backup Systems"],
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description:
      "Live notifications and updates for all operations with instant synchronization.",
    color: "accent",
    items: [
      "Live Notifications",
      "Real-time Sync",
      "Instant Updates",
      "Mobile Alerts",
    ],
  },
];

const stats = [
  { number: "10,000+", label: "Trips Managed", icon: Truck },
  { number: "500+", label: "Fleet Vehicles", icon: Package },
  { number: "99.9%", label: "Uptime", icon: CheckCircle },
  { number: "24/7", label: "Support", icon: Clock },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">
                TransportPro
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Contact
              </a>
              <Button asChild className="admin-action-btn">
                <Link to="/login">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="login-background min-h-[90vh] flex items-center">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 login-backdrop">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-sidebar-primary/10 rounded-full blur-2xl animate-pulse delay-500" />
            <div className="absolute top-1/3 left-1/2 w-28 h-28 bg-success/10 rounded-full blur-3xl animate-pulse delay-700" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Professional Transport Management
                  </Badge>
                </div>

                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  <span className="block text-white">
                    Revolutionize Your
                  </span>
                  <span className="block bg-gradient-to-r from-primary via-accent to-success bg-clip-text text-transparent">
                    Transport Business
                  </span>
                </h1>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                  Complete transport management solution with advanced fleet
                  tracking, profit optimization, and real-time analytics. Scale
                  your operations with confidence and efficiency.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button
                    asChild
                    size="lg"
                    className="admin-action-btn text-lg px-8 py-6"
                  >
                    <Link to="/login">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 border-2"
                  >
                    Watch Demo
                    <Globe className="w-5 h-5 ml-2" />
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
                  {stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        <stat.icon className="w-5 h-5 text-primary mr-2" />
                        <div className="text-2xl font-bold text-foreground">
                          {stat.number}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Image/Illustration */}
              <div className="relative">
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-card to-card/95 backdrop-blur-xl border border-border/30 rounded-3xl p-8 shadow-2xl">
                    <div className="space-y-6">
                      {/* Dashboard Preview */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div className="flex-1 bg-muted/50 rounded-lg px-3 py-1 text-xs text-muted-foreground">
                          transportpro.com/dashboard
                        </div>
                      </div>

                      {/* Mock Dashboard Content */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <div className="text-sm font-medium">
                              Total Profit
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-primary">
                            ₹1,45,250
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Truck className="w-4 h-4 text-accent" />
                            <div className="text-sm font-medium">
                              Fleet Size
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-accent">
                            24
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-medium">
                            Recent Trips
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            Live
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {[
                            {
                              route: "Mumbai → Delhi",
                              status: "completed",
                              profit: "₹15,500",
                            },
                            {
                              route: "Pune → Bangalore",
                              status: "in-transit",
                              profit: "₹18,200",
                            },
                            {
                              route: "Chennai → Hyderabad",
                              status: "planned",
                              profit: "₹12,800",
                            },
                          ].map((trip, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-muted-foreground" />
                                <span>{trip.route}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    trip.status === "completed"
                                      ? "default"
                                      : trip.status === "in-transit"
                                        ? "secondary"
                                        : "outline"
                                  }
                                  className="text-xs"
                                >
                                  {trip.status}
                                </Badge>
                                <span className="text-success font-medium">
                                  {trip.profit}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-success/20 to-warning/20 rounded-2xl blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Star className="w-3 h-3 mr-1" />
                Features
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Manage Your Fleet
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive tools and features designed to streamline your
              transport operations, boost profitability, and provide real-time
              insights into your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="enhanced-card hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${feature.color} to-${feature.color}/80 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {feature.title}
                      </CardTitle>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {feature.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Badge className="bg-accent/10 text-accent border-accent/20">
                  <Globe className="w-3 h-3 mr-1" />
                  About TransportPro
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built for Modern
                <span className="block bg-gradient-to-r from-accent to-success bg-clip-text text-transparent">
                  Transport Companies
                </span>
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                TransportPro is designed by industry experts who understand the
                challenges of managing transport operations. Our platform
                combines cutting-edge technology with practical solutions to
                help you scale your business efficiently.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">
                    Real-time fleet tracking and monitoring
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-accent" />
                  </div>
                  <span className="font-medium">
                    Automated profit calculation and reporting
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <span className="font-medium">
                    Enterprise-grade security and compliance
                  </span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-card to-card/95 backdrop-blur-xl border border-border/30 rounded-3xl p-8 shadow-2xl">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    Trusted by Industry Leaders
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Join thousands of transport companies that have transformed
                    their operations with TransportPro.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary">
                        500+
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Companies
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-accent">10K+</div>
                      <div className="text-sm text-muted-foreground">
                        Vehicles
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-success">
                        99.9%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Uptime
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-accent to-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Transport Business?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of companies already using TransportPro to streamline
            their operations and boost profitability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
            >
              <Link to="/login">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6 border-white text-black hover:bg-white/10"
            >
              Schedule Demo
              <Clock className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        id="contact"
        className="bg-sidebar-background text-black"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Truck className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold">TransportPro</span>
              </div>
              <p className="text-black">
                Professional transport management system designed to help
                businesses scale efficiently and boost profitability.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 rounded-lg  flex items-center justify-center hover:bg-primary cursor-pointer transition-colors">
                  <Facebook className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-lg  flex items-center justify-center hover:bg-primary cursor-pointer transition-colors">
                  <Twitter className="w-4 h-4 " />
                </div>
                <div className="w-8 h-8 rounded-lg  flex items-center justify-center hover:bg-primary cursor-pointer transition-colors">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-lg  flex items-center justify-center hover:bg-primary cursor-pointer transition-colors">
                  <Linkedin className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <a
                  href="#features"
                  className="block text-black hover:text-sidebar-foreground transition-colors"
                >
                  Features
                </a>
                <a
                  href="#"
                  className="block text-black hover:text-sidebar-foreground transition-colors"
                >
                  Pricing
                </a>
                <a
                  href="#"
                  className="block text-black hover:text-sidebar-foreground transition-colors"
                >
                  API Documentation
                </a>
                <a
                  href="#"
                  className="block text-black hover:text-sidebar-foreground transition-colors"
                >
                  Integrations
                </a>
              </div>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <a
                  href="#"
                  className="block text-black hover:text-sidebar-foreground transition-colors"
                >
                  Help Center
                </a>
                <a
                  href="#"
                  className="block text-black hover:text-sidebar-foreground transition-colors"
                >
                  Contact Support
                </a>
                <a
                  href="#"
                  className="block text-black hover:text-sidebar-foreground transition-colors"
                >
                  System Status
                </a>
                <a
                  href="#"
                  className="block text-black hover:text-sidebar-foreground transition-colors"
                >
                  Bug Reports
                </a>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-black">
                    support@transportpro.com
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-black">
                    +91 98765 43210
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <LocationIcon className="w-4 h-4 text-primary" />
                  <span className="text-black">
                    Mumbai, Maharashtra, India
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-sidebar-border mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-black">
                © 2024 TransportPro. All rights reserved.
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a
                  href="#"
                  className="text-black hover:text-sidebar-foreground transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-black  hover:text-sidebar-foreground transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-black hover:text-sidebar-foreground transition-colors"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
