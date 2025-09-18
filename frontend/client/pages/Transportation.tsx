import React, { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useLocation } from "react-router-dom";
import { useTransport, Trip } from "../contexts/TransportContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Badge } from "../components/ui/badge";
import {
  Plus,
  Truck,
  TrendingUp,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  IndianRupee,
  Eye,
} from "lucide-react";
import TripForm from "../components/TripForm";

const ITEMS_PER_PAGE = 10;

export default function Transportation() {
  const { trips, availableTrucks, deleteTrip } = useTransport();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [truckFilter, setTruckFilter] = useState<string>("all");
  const [dateFromFilter, setDateFromFilter] = useState<string>("");
  const [dateToFilter, setDateToFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Determine view based on URL path or search params
  const isNewRoute = location.pathname === "/transportation/new";
  const view = isNewRoute ? "create" : searchParams.get("view") || "list";
  const editTripId = searchParams.get("edit");

  // Auto-redirect to main transportation page after form submission when coming from /new route
  useEffect(() => {
    if (isNewRoute && view !== "create") {
      // This will be handled by TripForm component navigation
    }
  }, [isNewRoute, view]);

  // Calculate metrics
  const metrics = useMemo(() => {
    console.log('DEBUG - Transportation metrics calculation:');
    console.log('DEBUG - trips data:', trips.map(t => ({ 
      id: t._id || t.tripId, 
      netProfit: t.netProfit, 
      status: t.status, 
      customerPayment: t.customerPayment,
      expenses: t.expenses
    })));
    
    const activeTrips = trips.filter(
      (trip) => trip.status === "in-transit" || trip.status === "pending",
    ).length;
    
    const totalProfit = trips.reduce((sum, trip) => {
      const profit = trip.netProfit || 0;
      console.log(`DEBUG - Trip ${trip._id}: netProfit=${trip.netProfit}, calculated profit=${profit}`);
      return sum + (isNaN(profit) ? 0 : profit);
    }, 0);
    
    console.log('DEBUG - Total profit calculated:', totalProfit);
    
    const monthlyTrips = trips.filter((trip) => {
      const tripDate = new Date(trip.startDate);
      const now = new Date();
      return (
        tripDate.getMonth() === now.getMonth() &&
        tripDate.getFullYear() === now.getFullYear()
      );
    });
    
    const monthlyProfit = monthlyTrips.reduce((sum, trip) => {
      const profit = trip.netProfit || 0;
      return sum + (isNaN(profit) ? 0 : profit);
    }, 0);

    const result = {
      activeTrips: isNaN(activeTrips) ? 0 : activeTrips,
      totalProfit: isNaN(totalProfit) ? 0 : totalProfit,
      monthlyProfit: isNaN(monthlyProfit) ? 0 : monthlyProfit,
      totalTrips: trips.length || 0,
    };
    
    console.log('DEBUG - Final metrics result:', result);
    return result;
  }, [trips]);

  // Filter trips
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        searchTerm === "" ||
        (trip._id || trip.tripId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trip.vehicleId || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        trip.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || trip.status === statusFilter;

      const matchesTruck =
        truckFilter === "all" || trip.vehicleId === truckFilter;

      const matchesDateRange =
        (dateFromFilter === "" ||
          new Date(trip.startDate) >= new Date(dateFromFilter)) &&
        (dateToFilter === "" ||
          new Date(trip.startDate) <= new Date(dateToFilter));

      return matchesSearch && matchesStatus && matchesTruck && matchesDateRange;
    });
  }, [
    trips,
    searchTerm,
    statusFilter,
    truckFilter,
    dateFromFilter,
    dateToFilter,
  ]);

  // Paginate trips
  const paginatedTrips = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredTrips.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredTrips, currentPage]);

  const totalPages = Math.ceil(filteredTrips.length / ITEMS_PER_PAGE);

  const getStatusColor = (status: Trip["status"]) => {
    switch (status) {
      case "completed":
        return "bg-success/10 text-success hover:bg-success/20";
      case "in-transit":
        return "bg-warning/10 text-warning hover:bg-warning/20";
      case "pending":
        return "bg-primary/10 text-primary hover:bg-primary/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const handleDeleteTrip = (tripId: string) => {
    deleteTrip(tripId);
  };

  if (view === "create") {
    return <TripForm mode="create" />;
  }

  if (view === "edit" && editTripId) {
    return <TripForm mode="edit" tripId={editTripId} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transportation</h1>
          <p className="text-muted-foreground">
            Manage trips, calculate profits, and track expenses.
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link to="/transportation?view=create">
            <Plus className="w-4 h-4 mr-2" />
            New Trip
          </Link>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Truck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeTrips}</div>
            <p className="text-xs text-muted-foreground">
              In transit & planned
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Calendar className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrips}</div>
            <p className="text-xs text-muted-foreground">All time trips</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              ₹{metrics.totalProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <IndianRupee className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              ₹{metrics.monthlyProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Monthly profit</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search trips, trucks, routes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-transit">In Transit</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="truck">Truck</Label>
              <Select value={truckFilter} onValueChange={setTruckFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Trucks</SelectItem>
                  {availableTrucks.map((truck) => (
                    <SelectItem key={truck._id} value={truck._id || ''}>
                      {truck.registrationNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trips Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Trip Records</CardTitle>
            <div className="text-sm text-muted-foreground">
              Showing {paginatedTrips.length} of {filteredTrips.length} trips
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip ID</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedTrips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No trips found. Create your first trip to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTrips.map((trip) => (
                    <TableRow key={trip._id || trip.tripId}>
                      <TableCell className="font-medium">{trip.tripId || 'N/A'}</TableCell>
                      <TableCell>{trip.vehicleId || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          {trip.source || 'N/A'} → {trip.destination || 'N/A'}
                        </div>
                      </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>
                          {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-muted-foreground">
                          to {trip.returnDate ? new Date(trip.returnDate).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(trip.status || 'pending')}
                      >
                        {(trip.status || 'pending').replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-medium ${
                          (trip.netProfit || 0) >= 0 ? "text-success" : "text-destructive"
                        }`}
                      >
                        ₹{(trip.netProfit || 0).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            to={`/transportation?view=edit&edit=${trip._id || trip.tripId}`}
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        {user?.role === "admin" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Trip {trip.tripId || trip._id}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this trip?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteTrip(trip._id || trip.tripId || '')}
                                  className="bg-destructive hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
