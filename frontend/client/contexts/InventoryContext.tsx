import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { apiClient, API_ENDPOINTS, Truck, PaymentMethod, TruckStatus, ApiResponse, PaginatedResponse } from "../../shared/api";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "./AuthContext";

// Legacy types for compatibility (will be replaced by API types)
export type PaymentMode = PaymentMethod;
export type TruckStatusType = TruckStatus;

// Legacy interface for backward compatibility
export interface TruckInventory {
  id: string;
  registrationNumber: string;
  model: string;
  initialModelYear: number;
  status: TruckStatus;
  purchaseDate: string;
  fullPurchaseAmount: number;
  expenses: any;
  profit?: number;
  sellerDetails: any;
  nocApplied: boolean;
  nocReceivedDate?: string;
}

export interface PaymentEntry {
  id: string;
  mode: PaymentMode;
  amount: number;
  date: string;
  percentage: number;
}

interface InventoryContextType {
  trucks: Truck[];
  loading: boolean;
  truckModels: string[];
  addTruck: (truck: Omit<Truck, '_id' | 'truckId' | 'resaleProfit' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTruck: (id: string, truck: Partial<Truck>) => Promise<boolean>;
  deleteTruck: (id: string) => Promise<boolean>;
  getTruck: (id: string) => Truck | undefined;
  addTruckModel: (model: string) => void;
  updateTruckStatus: (id: string, status: TruckStatus) => Promise<boolean>;
  refreshTrucks: () => Promise<void>;
  calculateTruckProfit: (purchasePrice: number, expenses: number, salePrice: number, commission: number) => Promise<number | null>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(
  undefined,
);

// Truck models for form selection
const initialTruckModels = [
  "Tata 407",
  "Tata LPT 709",
  "Tata LPT 1109",
  "Ashok Leyland Dost",
  "Ashok Leyland Partner",
  "Eicher Pro 1049",
  "Eicher Pro 1110",
  "Mahindra Bolero Pickup",
  "Mahindra Jeeto",
  "Force Traveller",
];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(false);
  const [truckModels, setTruckModels] = useState<string[]>(initialTruckModels);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshTrucks();
    }
  }, [isAuthenticated]);

  const refreshTrucks = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<any>(API_ENDPOINTS.TRUCKS.LIST);
      
      // Handle different API response structures
      let trucksData: Truck[] = [];
      
      if (response.success) {
        trucksData = response.trucks || response.data || [];
      } else if (Array.isArray(response)) {
        trucksData = response;
      } else if (response.data && Array.isArray(response.data)) {
        trucksData = response.data;
      }
      
      // Ensure trucks have proper structure and handle missing fields
      const normalizedTrucks = trucksData.map(truck => {
        // Auto-determine status: if sale data exists, mark as sold
        let truckStatus = truck.status || 'available';
        if (truck.sale && (truck.sale.buyer?.name || truck.sale.price > 0 || truck.sale.date)) {
          truckStatus = 'sold';
        }
        
        return {
          ...truck,
          _id: truck._id || truck.truckId || `truck_${Date.now()}_${Math.random()}`,
          truckId: truck.truckId || truck._id,
          status: truckStatus,
          purchasePrice: truck.purchasePrice || 0,
        expenses: {
          transportation: truck.expenses?.transportation || 0,
          tollCharges: truck.expenses?.tollCharges || 0,
          tyreCharges: truck.expenses?.tyreCharges || 0,
          fattaExpenses: truck.expenses?.fattaExpenses || 0,
          driverCharges: truck.expenses?.driverCharges || 0,
          bodyWork: truck.expenses?.bodyWork || 0,
          paintExpenses: truck.expenses?.paintExpenses || 0,
          builtlyExpenses: truck.expenses?.builtlyExpenses || 0,
          diesel: truck.expenses?.diesel || 0,
          kamaniWork: truck.expenses?.kamaniWork || 0,
          floorExpenses: truck.expenses?.floorExpenses || 0,
          insuranceExpenses: truck.expenses?.insuranceExpenses || 0,
          tyres: truck.expenses?.tyres || 0,
          painting: truck.expenses?.painting || 0,
          misc: truck.expenses?.misc || 0,
        },
        // Handle resale profit for SOLD trucks
        resaleProfit: truck.resaleProfit !== undefined ? truck.resaleProfit : (
          truckStatus === 'sold' && truck.sale ? (
            truck.sale.price - truck.purchasePrice - (truck.sale.commission || 0) - 
            Object.values(truck.expenses || {}).reduce((sum: number, exp: number) => sum + (exp || 0), 0)
          ) : 0
        ),
        seller: truck.seller || {
          name: '',
          contact: '',
          address: '',
          aadhaarNumber: '',
          email: ''
        },
        documents: truck.documents || {
          NOC: false,
          insurance: false,
          fitness: false,
          tax: false
        }
        };
      });
      
      setTrucks(normalizedTrucks);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load trucks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTruck = async (
    truckData: Omit<Truck, '_id' | 'truckId' | 'resaleProfit' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiClient.post<any>(API_ENDPOINTS.TRUCKS.CREATE, truckData);
      
      if (response.success) {
        const newTruck = response.truck || response.data;
        if (newTruck) {
          setTrucks(prev => [...prev, newTruck]);
        } else {
          // Refresh the truck list to get the new truck
          refreshTrucks();
        }
        toast({ title: "Truck Added", description: "Truck has been added to inventory." });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add truck.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addTruckModel = (model: string) => {
    if (!truckModels.includes(model)) {
      setTruckModels(prev => [...prev, model]);
    }
  };

  const updateTruck = async (id: string, updates: Partial<Truck>): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiClient.put<ApiResponse<Truck>>(API_ENDPOINTS.TRUCKS.UPDATE(id), updates);
      if (response.success && response.data) {
        setTrucks(prev => prev.map(t => (t._id === id || t.truckId === id) ? response.data! : t));
        toast({ title: "Truck Updated", description: "Truck details updated." });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update truck.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTruckStatus = async (id: string, status: TruckStatus): Promise<boolean> => {
    try {
      const response = await apiClient.put<ApiResponse<Truck>>(API_ENDPOINTS.TRUCKS.UPDATE_STATUS(id), { status });
      if (response.success && response.data) {
        setTrucks(prev => prev.map(t => (t._id === id || t.truckId === id) ? response.data! : t));
        toast({ title: "Status Updated", description: "Truck status updated." });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update status.", variant: "destructive" });
      return false;
    }
  };

  const deleteTruck = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await apiClient.delete<ApiResponse>(API_ENDPOINTS.TRUCKS.DELETE(id));
      if (response.success) {
        setTrucks(prev => prev.filter(t => t._id !== id && t.truckId !== id));
        toast({ title: "Truck Deleted", description: "Truck removed from inventory." });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete truck.", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getTruck = (id: string): Truck | undefined => {
    return trucks.find(t => t._id === id || t.truckId === id);
  };

  const calculateTruckProfit = async (purchasePrice: number, expenses: number, salePrice: number, commission: number): Promise<number | null> => {
    try {
      const response = await apiClient.post<any>(
        API_ENDPOINTS.TRUCKS.CALCULATE_PROFIT,
        { 
          purchasePrice: purchasePrice || 0, 
          expenses: expenses || 0, 
          salePrice: salePrice || 0, 
          commission: commission || 0 
        }
      );
      
      // Handle different response formats
      let profit = 0;
      if (response.success && response.data) {
        profit = response.data.profit || response.data.resaleProfit || 0;
      } else if (response.profit !== undefined) {
        profit = response.profit;
      } else {
        // Fallback calculation
        profit = salePrice - (purchasePrice + expenses + commission);
      }
      
      return isNaN(profit) ? 0 : profit;
    } catch (error: any) {
      // Fallback calculation
      const fallbackProfit = salePrice - (purchasePrice + expenses + commission);
      return isNaN(fallbackProfit) ? 0 : fallbackProfit;
    }
  };

  const value = {
    trucks,
    loading,
    truckModels,
    addTruck,
    updateTruck,
    addTruckModel,
    deleteTruck,
    getTruck,
    updateTruckStatus,
    refreshTrucks,
    calculateTruckProfit,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error("useInventory must be used within an InventoryProvider");
  }
  return context;
}
