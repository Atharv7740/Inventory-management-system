import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiClient, API_ENDPOINTS, Trip as ApiTrip, Truck, ApiResponse, PaginatedResponse } from "../../shared/api";

// Re-export Trip type for components to use
export type Trip = ApiTrip;
import { useToast } from "../hooks/use-toast";
import { useAuth } from "./AuthContext";

interface TransportContextType {
  trips: Trip[];
  availableTrucks: Truck[];
  loading: boolean;
  addTrip: (trip: Omit<Trip, '_id' | 'tripId' | 'netProfit' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTrip: (id: string, trip: Partial<Trip>) => Promise<boolean>;
  deleteTrip: (id: string) => Promise<boolean>;
  getTrip: (id: string) => Trip | undefined;
  refreshTrips: () => Promise<void>;
  refreshTrucks: () => Promise<void>;
  calculateTripProfit: (expenses: Trip['expenses'], customerPayment: number) => Promise<number | null>;
}

const TransportContext = createContext<TransportContextType | undefined>(
  undefined,
);

export function TransportProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [availableTrucks, setAvailableTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();


  // Initialize data on mount only if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshTrips();
      refreshTrucks();
    }
  }, [isAuthenticated]);


  const refreshTrips = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.TRIPS.LIST);
      
      let tripsData: ApiTrip[] = [];
      
      if (response.success) {
        tripsData = response.trips || response.data || [];
      } else if (Array.isArray(response)) {
        tripsData = response;
      } else if (response.data && Array.isArray(response.data)) {
        tripsData = response.data;
      }
      
      
      const normalizedTrips = tripsData.map(trip => {
        // Ensure all values are numbers before calculation
        const customerPayment = Number(trip.customerPayment) || 0;
        const expenses = {
          diesel: Number(trip.expenses?.diesel) || 0,
          driver: Number(trip.expenses?.driver) || 0,
          tolls: Number(trip.expenses?.tolls) || 0,
          tyre: Number(trip.expenses?.tyre) || 0,
          misc: Number(trip.expenses?.misc) || 0,
        };
        
        const calculatedProfit = customerPayment - (expenses.diesel + expenses.driver + expenses.tolls + expenses.tyre + expenses.misc);
        
        // FRONTEND FIX: Always use local calculation since backend has profit calculation issues
        const finalProfit = calculatedProfit;
        
        
        return {
          ...trip,
          _id: trip._id || trip.tripId,
          tripId: trip.tripId || trip._id || `TRK${Date.now().toString().slice(-6)}`,
          netProfit: finalProfit,
          expenses: expenses,
          customerPayment: customerPayment,
          distance: trip.distance || 0,
          status: trip.status || 'pending',
          source: trip.source || '',
          destination: trip.destination || '',
          goods: trip.goods || '',
          vehicleId: trip.vehicleId || '',
          startDate: trip.startDate || new Date().toISOString(),
          returnDate: trip.returnDate || new Date().toISOString(),
        };
      });
      
      setTrips(normalizedTrips);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load trips. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshTrucks = async () => {
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.TRUCKS.LIST);
      
      if (response.success) {
        const trucksData = response.trucks || response.data;
        if (trucksData && Array.isArray(trucksData)) {
          setAvailableTrucks(trucksData);
        } else {
          setAvailableTrucks([]);
        }
      } else if (Array.isArray(response)) {
        setAvailableTrucks(response);
      } else {
        setAvailableTrucks([]);
      }
    } catch (error: any) {
      setAvailableTrucks([]);
    }
  };

  const addTrip = async (tripData: Omit<Trip, '_id' | 'tripId' | 'netProfit' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.TRIPS.CREATE, tripData);
      
      if (response.success) {
        const newTrip = response.trip || response.data;
        if (newTrip) {
          setTrips(prev => [...prev, newTrip]);
        } else {
          // If no trip data returned, refresh the trips list
          await refreshTrips();
        }
        toast({
          title: "Trip Created",
          description: "Trip has been successfully created.",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create trip. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTrip = async (id: string, updates: Partial<Trip>): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiClient.put<ApiResponse<Trip>>(API_ENDPOINTS.TRIPS.UPDATE(id), updates);
      if (response.success) {
        // Refresh trips from API to get latest data with proper profit calculations
        await refreshTrips();
        toast({
          title: "Trip Updated",
          description: "Trip has been successfully updated.",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update trip. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiClient.delete<ApiResponse>(API_ENDPOINTS.TRIPS.DELETE(id));
      if (response.success) {
        setTrips(prev => prev.filter(trip => trip._id !== id && trip.tripId !== id));
        toast({
          title: "Trip Deleted",
          description: "Trip has been successfully deleted.",
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete trip. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTrip = (id: string): Trip | undefined => {
    return trips.find(trip => trip._id === id || trip.tripId === id);
  };

  const calculateTripProfit = async (expenses: Trip['expenses'], customerPayment: number): Promise<number | null> => {
    // FRONTEND FIX: Use only local calculation since backend has profit calculation issues
    const totalExpenses = Object.values(expenses).reduce((sum, exp) => sum + (Number(exp) || 0), 0);
    const profit = (customerPayment || 0) - totalExpenses;
    
    
    return isNaN(profit) ? 0 : profit;
  };

  const value = {
    trips,
    availableTrucks,
    loading,
    addTrip,
    updateTrip,
    deleteTrip,
    getTrip,
    refreshTrips,
    refreshTrucks,
    calculateTripProfit,
  };

  return (
    <TransportContext.Provider value={value}>
      {children}
    </TransportContext.Provider>
  );
}

export function useTransport() {
  const context = useContext(TransportContext);
  if (context === undefined) {
    throw new Error("useTransport must be used within a TransportProvider");
  }
  return context;
}
