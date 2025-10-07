
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import {
  Truck,
  Users,
  DollarSign,
  LineChart,
  ArrowRight,
  Globe,
  Sparkles,
  TrendingUp,
  MapPin,
  CheckCircle,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


const trips = [
  { route: "Mumbai → Delhi", status: "completed", profit: "₹15,500" },
  { route: "Pune → Bangalore", status: "in-transit", profit: "₹18,200" },
  { route: "Chennai → Hyderabad", status: "planned", profit: "₹12,800" },
];
const features = [
  {
    icon: Truck,
    title: "Fleet Management",
    description:
      "Advanced tools to manage and track your fleet in real-time with detailed analytics.",
    color: "from-blue-500 to-blue-400",
    items: ["GPS Tracking", "Maintenance Alerts", "Fuel Management"],
  },
  {
    icon: Users,
    title: "Client Management",
    description:
      "Easily manage client relationships and streamline communication channels.",
    color: "from-purple-500 to-purple-400",
    items: ["Client Portal", "Contract Management", "Service History"],
  },
  {
    icon: DollarSign,
    title: "Profit Optimization",
    description:
      "Maximize revenue with smart insights and expense tracking features.",
    color: "from-green-500 to-green-400",
    items: ["Cost Analysis", "Revenue Forecasting", "Expense Tracking"],
  },
  {
    icon: LineChart,
    title: "Advanced Analytics",
    description:
      "Make data-driven decisions with comprehensive reports and visualizations.",
    color: "from-orange-500 to-orange-400",
    items: ["Custom Reports", "Trend Analysis", "Performance Metrics"],
  },
];

export default function LandingPage() {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );
    gsap.fromTo(
      featuresRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power2.out" }
    );
    gsap.fromTo(
      ctaRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power2.out" }
    );
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-900 to-neutral-950 text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-neutral-900/70 border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-lg">TransportPro</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            {["Features", "Pricing", "About", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="hover:text-blue-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          <Button asChild className="bg-blue-500 hover:bg-blue-600 rounded-full px-5">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
    <section
        ref={heroRef}
        className="relative flex flex-col lg:flex-row items-center justify-between px-8 lg:px-20 py-20 lg:py-32"
      >
        {/* Left Side: Text */}
        <div className="max-w-2xl space-y-6 text-center lg:text-left">
          <Badge variant="secondary" className="text-sm bg-blue-500/10 text-blue-400">
            Professional Transport Management
          </Badge>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
            Revolutionize Your{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Transport Business
            </span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-xl">
            Complete transport management solution with advanced fleet
            tracking, profit optimization, and real-time analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 py-3">
              <Link to="/login">Get Started Free</Link>
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-6 py-3 border-gray-600 text-gray-800 hover:bg-gray-800"
            >
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Right Side: Dashboard Preview */}
        <div className="hidden lg:block w-full max-w-lg mt-12 lg:mt-0">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="space-y-6">
              {/* Browser-like header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <div className="flex-1 bg-gray-900/50 rounded-lg px-3 py-1 text-xs text-white">
                  transportpro.com/dashboard
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <div className="text-sm font-medium text-white">
                      Total Profit
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-300">
                    ₹1,45,250
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-400/10 to-cyan-400/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-cyan-300" />
                    <div className="text-sm font-medium text-white">
                      Fleet Size
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-cyan-300">24</div>
                </div>
              </div>

              {/* Recent Trips */}
              <div className="bg-gray-900/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-white">
                    Recent Trips
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-green-500/10 text-green-400"
                  >
                    Live
                  </Badge>
                </div>
                <div className="space-y-2">
                  {trips.map((trip, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-white" />
                        <span className="text-white">{trip.route}</span>
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
                          className={`text-xs font-semibold ${
                            trip.status === "completed"
                              ? "bg-green-500/10 text-green-300"
                              : trip.status === "in-transit"
                              ? "bg-yellow-500/10 text-yellow-300"
                              : "bg-gray-600/20 text-white"
                          }`}
                        >
                          {trip.status}
                        </Badge>
                        <span className="text-green-300 font-medium">
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
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-24 bg-neutral-950" id="features">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Everything you need to{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                succeed
              </span>
            </h2>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Powerful features designed to optimize your transport operations
              and maximize profitability.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl hover:border-blue-500/40 hover:shadow-lg transition-all"
              >
                <CardHeader className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-400 mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.items.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-neutral-300"
                      >
                        <CheckCircle className="w-4 h-4 text-green-400" />{" "}
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        ref={ctaRef}
        className="relative bg-gradient-to-r from-blue-600 to-blue-500 py-20"
      >
        <div className="max-w-6xl mx-auto px-6 text-center text-white space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to transform your transport business?
          </h2>
          <p className="text-neutral-200 max-w-2xl mx-auto">
            Join thousands of businesses already using TransportPro to optimize
            their operations and boost profits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="px-8 py-6 rounded-full bg-white text-blue-600 hover:bg-neutral-100 shadow-md"
            >
              <Link to="/login">Start Free Trial</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 rounded-full border-white text-blue-700 hover:bg-blue-700"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-950 border-t border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-neutral-400">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-blue-400" />
              <span className="text-xl font-bold text-white">TransportPro</span>
            </div>
            <p>
              Professional transport management system designed to help
              businesses scale efficiently.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="hover:text-blue-400">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-blue-400">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="hover:text-blue-400">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Product</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Demo
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Company</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-3">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-blue-400">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400">
                  Security
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 py-6 text-center text-neutral-500 text-xs">
          © {new Date().getFullYear()} TransportPro. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
