import React , { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  TrendingUp,
  Truck,
  Package,
  AlertCircle,
  Plus,
  DollarSign,
  BarChart3,
  Calendar,
  Sparkles,
  Activity,
  MapPin,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "../components/ui/dialog";

import { Link } from "react-router-dom";
import { useReports } from "../contexts/ReportsContext";
import { useTransport } from "../contexts/TransportContext";
import { useInventory } from "../contexts/InventoryContext";

export default function Dashboard() {
  const { getDashboardMetrics, recentTrips, loading } = useReports();
  const { trips } = useTransport();
  const { trucks } = useInventory();
  
  // Get dashboard metrics from the reports context
  const dashboardMetrics = getDashboardMetrics();
  
  // Calculate derived metrics with proper null checks
  const totalTransportProfit = trips.reduce((sum, trip) => {
    const profit = trip.netProfit || 0;
    return sum + (isNaN(profit) ? 0 : profit);
  }, 0);
  
  const metrics = {
    totalTransportProfit: isNaN(totalTransportProfit) ? 0 : totalTransportProfit,
    totalTrucks: trucks.length || 0,
    pendingNOCs: trips.filter(trip => trip.status === 'pending').length,
    recentTrips: trips.length || 0,
    monthlyProfit: dashboardMetrics.transportMetrics.monthlyProfit || 0,
    trucksSold: trucks.filter(truck => truck.status === 'sold').length || 0,
  };
  
  const [open, setOpen] = useState(true);
  // Calculate actual percentage change from last month
  const calculateMonthlyGrowth = () => {
    const currentMonth = new Date().getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    
    const currentMonthTrips = trips.filter(trip => {
      const tripDate = new Date(trip.startDate);
      return tripDate.getMonth() === currentMonth;
    });
    



    const lastMonthTrips = trips.filter(trip => {
      const tripDate = new Date(trip.startDate);
      return tripDate.getMonth() === lastMonth;
    });
    
    const currentMonthProfit = currentMonthTrips.reduce((sum, trip) => sum + (trip.netProfit || 0), 0);
    const lastMonthProfit = lastMonthTrips.reduce((sum, trip) => sum + (trip.netProfit || 0), 0);
    
    if (lastMonthProfit === 0) return 0;
    return ((currentMonthProfit - lastMonthProfit) / lastMonthProfit * 100).toFixed(1);
  };
  
  const monthlyGrowth = calculateMonthlyGrowth();
  
  // Get recent trips (limit to 4 for dashboard)
  const recentTripsData = trips.slice(0, 4).map(trip => ({
    id: trip.tripId || trip._id,
    truck: trip.vehicleId,
    route: `${trip.source} → ${trip.destination}`,
    profit: trip.netProfit || 0,
    date: trip.startDate,
    status: trip.status,
  }));


  const activeTrips = trips.filter((trip) => trip.status === "in-transit");
  
  // Get truck inventory (limit to 3 for dashboard)
  const truckInventory = trucks.slice(0, 3).map(truck => ({
    id: truck._id,
    registration: truck.registrationNumber,
    model: truck.model,
    status: truck.status,
    lastTrip: truck.updatedAt || truck.createdAt,
  }));
  return (
    <div className="p-6 space-y-6 ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Dashboard
            </h1>
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
          </div>
          <p className="text-muted-foreground flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Welcome back! Here's your transport management overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild className="dashboard-action-btn group">
            <Link to="/transportation/new">
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              New Trip
            </Link>
          </Button>
          <Button asChild className="dashboard-secondary-btn group">
            <Link to="/inventory/new">
              <Package className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
              Add Truck
            </Link>
          </Button>
        </div>
      </div>

 {/* Active Trips Dialog */}


 <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Active Trips (In Transit)</DialogTitle>
            <DialogDescription>
              Monitor your currently active trips in real time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {activeTrips.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No active trips right now.
              </p>
            ) : (
              activeTrips.map((trip) => (
                <div
                  key={trip.tripId || trip._id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">
                      {trip.source} → {trip.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-warning/10 text-warning">
                      {trip.status}
                    </span>
                    <span className="text-success font-semibold">
                      ₹{trip.netProfit?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>


      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transport Profit
            </CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ₹{metrics.totalTransportProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trucks in Fleet
            </CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrucks}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.trucksSold} sold this month
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending NOCs</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {metrics.pendingNOCs}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Profit
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              ₹{metrics.monthlyProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current month earnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trips */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Recent Trips
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/transportation">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTripsData.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{trip.id}</span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          trip.status === "completed"
                            ? "bg-success/10 text-success"
                            : "bg-warning/10 text-warning"
                        }`}
                      >
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {trip.truck} • {trip.route}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(trip.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-success">
                      +₹{trip.profit.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Truck Inventory Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">
                Fleet Status
              </CardTitle>
              <Button asChild variant="outline" size="sm">
                <Link to="/inventory">View All</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {truckInventory.map((truck) => (
                <div
                  key={truck.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {truck.registration}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          truck.status === "available"
                            ? "bg-success/10 text-success"
                            : truck.status === "in-transit"
                              ? "bg-warning/10 text-warning"
                              : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {truck.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {truck.model}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last trip: {new Date(truck.lastTrip).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Truck className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
