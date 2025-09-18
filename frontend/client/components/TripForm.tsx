import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTransport, Trip } from "../contexts/TransportContext";
import { useInventory } from "../contexts/InventoryContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Calculator, Truck, MapPin, Calendar, IndianRupee } from "lucide-react";

interface TripFormProps {
  tripId?: string;
  mode: "create" | "edit";
}

export default function TripForm({ tripId, mode }: TripFormProps) {
  const navigate = useNavigate();
  const { availableTrucks, addTrip, updateTrip, getTrip, calculateTripProfit } = useTransport();
  const { trucks } = useInventory();
  const [isLoading, setIsLoading] = useState(false);
  
  // Use all trucks from inventory, not just available ones (include sold trucks too)
  const trucksToShow = availableTrucks.length > 0 ? availableTrucks : trucks;
  
  // Helper function to find truck by registration number
  const findTruckByRegistrationNumber = (registrationNumber: string) => {
    const allTrucks = [...availableTrucks, ...trucks];
    return allTrucks.find(truck => truck.registrationNumber === registrationNumber);
  };
  

  const [formData, setFormData] = useState({
    vehicleId: "",
    source: "",
    destination: "",
    goods: "",
    startDate: "",
    returnDate: "",
    distance: "",
    expenses: {
      diesel: "",
      driver: "",
      tolls: "",
      tyre: "",
      misc: "",
    },
    customerPayment: "",
    status: "pending" as Trip["status"],
  });

  const [profit, setProfit] = useState(0);

  useEffect(() => {
    if (mode === "edit" && tripId) {
      const trip = getTrip(tripId);
      if (trip) {
        // Find truck by registration number from the trip data
        const matchingTruck = findTruckByRegistrationNumber(trip.vehicleId) || 
          trucksToShow.find(truck => 
            truck._id === trip.vehicleId || 
            truck.truckId === trip.vehicleId ||
            truck.registrationNumber === trip.vehicleId
          );
        
        // Format dates properly for date inputs
        const formatDateForInput = (dateStr: string) => {
          if (!dateStr) return '';
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        };
        
        setFormData({
          vehicleId: matchingTruck?._id || matchingTruck?.truckId || trip.vehicleId,
          source: trip.source || '',
          destination: trip.destination || '',
          goods: trip.goods || '',
          startDate: formatDateForInput(trip.startDate),
          returnDate: formatDateForInput(trip.returnDate),
          distance: (trip.distance || 0).toString(),
          expenses: {
            diesel: (trip.expenses?.diesel || 0).toString(),
            driver: (trip.expenses?.driver || 0).toString(),
            tolls: (trip.expenses?.tolls || 0).toString(),
            tyre: (trip.expenses?.tyre || 0).toString(),
            misc: (trip.expenses?.misc || 0).toString(),
          },
          customerPayment: (trip.customerPayment || 0).toString(),
          status: trip.status || 'pending',
        });
        
        // Set the calculated profit
        setProfit(trip.netProfit || 0);
      }
    }
  }, [mode, tripId, getTrip, availableTrucks, trucks, trucksToShow]);

  useEffect(() => {
    const calculateProfitSimple = async () => {
      // Ensure all values are properly converted to numbers
      const expenses = {
        diesel: Math.max(0, parseFloat(formData.expenses.diesel) || 0),
        driver: Math.max(0, parseFloat(formData.expenses.driver) || 0),
        tolls: Math.max(0, parseFloat(formData.expenses.tolls) || 0),
        tyre: Math.max(0, parseFloat(formData.expenses.tyre) || 0),
        misc: Math.max(0, parseFloat(formData.expenses.misc) || 0),
      };
      const customerPayment = Math.max(0, parseFloat(formData.customerPayment) || 0);
      
      // Always calculate locally for comparison
      const totalExpenses = expenses.diesel + expenses.driver + expenses.tolls + expenses.tyre + expenses.misc;
      const localProfit = customerPayment - totalExpenses;
      
      
      // Use calculateTripProfit function (which now does local calculation only)
      try {
        const calculatedProfit = await calculateTripProfit(expenses, customerPayment);
        
        setProfit(calculatedProfit || localProfit);
      } catch (error) {
        setProfit(localProfit);
      }
    };
    
    // Debounce the calculation to prevent infinite calls
    const timer = setTimeout(calculateProfitSimple, 300);
    return () => clearTimeout(timer);
  }, [formData.expenses, formData.customerPayment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Find the selected truck to get its registration number
      const selectedTruck = trucksToShow.find(truck => 
        (truck._id && truck._id === formData.vehicleId) || 
        (truck.truckId && truck.truckId === formData.vehicleId)
      );
      
      if (!selectedTruck || !selectedTruck.registrationNumber) {
        throw new Error('Selected vehicle not found. Please select a valid vehicle.');
      }
      
      const tripData = {
        vehicleId: selectedTruck.registrationNumber,
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        goods: formData.goods.trim(),
        startDate: formData.startDate,
        returnDate: formData.returnDate,
        distance: Math.max(0, parseFloat(formData.distance) || 0),
        expenses: {
          diesel: Math.max(0, parseFloat(formData.expenses.diesel) || 0),
          driver: Math.max(0, parseFloat(formData.expenses.driver) || 0),
          tolls: Math.max(0, parseFloat(formData.expenses.tolls) || 0),
          tyre: Math.max(0, parseFloat(formData.expenses.tyre) || 0),
          misc: Math.max(0, parseFloat(formData.expenses.misc) || 0),
        },
        customerPayment: Math.max(0, parseFloat(formData.customerPayment) || 0),
        status: formData.status,
      };
      

      let success = false;
      
      if (mode === "create") {
        success = await addTrip(tripData);
      } else if (mode === "edit" && tripId) {
        success = await updateTrip(tripId, tripData);
      }

      if (success) {
        navigate("/transportation");
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    if (field.startsWith("expenses.")) {
      const expenseField = field.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        expenses: {
          ...prev.expenses,
          [expenseField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {mode === "create" ? "Create New Trip" : "Edit Trip"}
          </h1>
          <p className="text-muted-foreground">
            {mode === "create"
              ? "Enter trip details and track expenses for profit calculation."
              : `Editing trip ${tripId}`}
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/transportation")}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trip Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="truck">Vehicle *</Label>
                  <Select
                    value={formData.vehicleId}
                    onValueChange={(value) =>
                      updateFormData("vehicleId", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {trucksToShow.length === 0 ? (
                        <SelectItem value="" disabled>
                          No available trucks found
                        </SelectItem>
                      ) : (
                        trucksToShow.map((truck) => (
                          <SelectItem key={truck._id || truck.truckId} value={truck._id || truck.truckId || ''}>
                            {truck.registrationNumber} ({truck.model})
                        </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      updateFormData("status", value as Trip["status"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-transit">In Transit</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">Source Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="source"
                      placeholder="Enter source city"
                      value={formData.source}
                      onChange={(e) => updateFormData("source", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination">Destination *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="destination"
                      placeholder="Enter destination city"
                      value={formData.destination}
                      onChange={(e) =>
                        updateFormData("destination", e.target.value)
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goods">Goods/Cargo *</Label>
                  <Input
                    id="goods"
                    placeholder="Type of goods being transported"
                    value={formData.goods}
                    onChange={(e) => updateFormData("goods", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        updateFormData("startDate", e.target.value)
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="returnDate">Return Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="returnDate"
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) =>
                        updateFormData("returnDate", e.target.value)
                      }
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="distance">Distance (km) *</Label>
                  <Input
                    id="distance"
                    type="number"
                    placeholder="Enter distance in kilometers"
                    value={formData.distance}
                    onChange={(e) => updateFormData("distance", e.target.value)}
                    min="0"
                    step="0.1"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Calculator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Profit Calculator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Calculated Profit
                  </p>
                  <p
                    className={`text-2xl font-bold ${profit >= 0 ? "text-success" : "text-destructive"}`}
                  >
                    ₹{profit.toLocaleString()}
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Payment:</span>
                    <span className="font-medium">
                      ₹{(parseFloat(formData.customerPayment) || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Expenses:</span>
                    <span className="font-medium">
                      ₹
                      {(
                        (parseFloat(formData.expenses.diesel) || 0) +
                        (parseFloat(formData.expenses.driver) || 0) +
                        (parseFloat(formData.expenses.tolls) || 0) +
                        (parseFloat(formData.expenses.tyre) || 0) +
                        (parseFloat(formData.expenses.misc) || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Profit Margin:</span>
                    <span
                      className={
                        profit >= 0 ? "text-success" : "text-destructive"
                      }
                    >
                      {formData.customerPayment && parseFloat(formData.customerPayment) > 0
                        ? (
                            (profit / parseFloat(formData.customerPayment)) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expenses and Revenue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Trip Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diesel">Diesel Charges</Label>
                  <Input
                    id="diesel"
                    type="number"
                    placeholder="0"
                    value={formData.expenses.diesel}
                    onChange={(e) =>
                      updateFormData("expenses.diesel", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="driver">Driver Charges</Label>
                  <Input
                    id="driver"
                    type="number"
                    placeholder="0"
                    value={formData.expenses.driver}
                    onChange={(e) =>
                      updateFormData("expenses.driver", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tolls">Toll Charges</Label>
                  <Input
                    id="tolls"
                    type="number"
                    placeholder="0"
                    value={formData.expenses.tolls}
                    onChange={(e) =>
                      updateFormData("expenses.tolls", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tyre">Tyre Expenses</Label>
                  <Input
                    id="tyre"
                    type="number"
                    placeholder="0"
                    value={formData.expenses.tyre}
                    onChange={(e) =>
                      updateFormData("expenses.tyre", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="misc">Miscellaneous Expenses</Label>
                  <Input
                    id="misc"
                    type="number"
                    placeholder="0"
                    value={formData.expenses.misc}
                    onChange={(e) =>
                      updateFormData("expenses.misc", e.target.value)
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Customer Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="customerPayment">Customer Payment *</Label>
                <Input
                  id="customerPayment"
                  type="number"
                  placeholder="Enter customer payment amount"
                  value={formData.customerPayment}
                  onChange={(e) => updateFormData("customerPayment", e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Total amount paid by customer for transport
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/transportation")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading
              ? "Saving..."
              : mode === "create"
                ? "Create Trip"
                : "Update Trip"}
          </Button>
        </div>
      </form>
    </div>
  );
}
