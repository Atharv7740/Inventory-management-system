import React, { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { apiClient, API_ENDPOINTS, ApiResponse } from "../../shared/api";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "./AuthContext";
import { useTransport } from "./TransportContext";
import { useInventory } from "./InventoryContext";

export interface ReportFilter {
  dateFrom?: string;
  dateTo?: string;
  truckId?: string;
  status?: string;
}

export interface TransportReport {
  totalTrips: number;
  completedTrips: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  averageProfitPerTrip: number;
  topPerformingTrucks: Array<{
    truckId: string;
    trips: number;
    profit: number;
  }>;
  monthlyData: Array<{
    month: string;
    trips: number;
    revenue: number;
    profit: number;
  }>;
  expenseBreakdown: {
    diesel: number;
    toll: number;
    driver: number;
    other: number;
  };
}

export interface InventoryReport {
  totalTrucks: number;
  soldTrucks: number;
  availableTrucks: number;
  totalInvestment: number;
  totalSalesRevenue: number;
  totalProfit: number;
  averageProfitPerTruck: number;
  pendingNOCs: number;
  topSellingModels: Array<{
    model: string;
    count: number;
    profit: number;
  }>;
  monthlyPurchases: Array<{
    month: string;
    purchases: number;
    investment: number;
  }>;
  monthlySales: Array<{
    month: string;
    sales: number;
    revenue: number;
    profit: number;
  }>;
  expenseBreakdown: {
    transportation: number;
    bodyWork: number;
    kamaniWork: number;
    tyre: number;
    paint: number;
    insurance: number;
    other: number;
  };
}

export interface DashboardMetrics {
  transportMetrics: {
    totalTrips: number;
    activeTrips: number;
    monthlyProfit: number;
    totalRevenue: number;
  };
  inventoryMetrics: {
    totalTrucks: number;
    soldTrucks: number;
    pendingNOCs: number;
    totalProfit: number;
  };
  overallMetrics: {
    totalProfit: number;
    totalRevenue: number;
    totalInvestment: number;
    roi: number;
  };
}

interface ReportsContextType {
  generateTransportReport: (filter?: ReportFilter) => TransportReport;
  generateInventoryReport: (filter?: ReportFilter) => InventoryReport;
  getDashboardMetrics: () => DashboardMetrics;
  dashboardOverview: any;
  recentTrips: any[];
  fleetStatus: any;
  loading: boolean;
  refreshDashboardData: () => Promise<void>;
  exportToPDF: (reportType: "transport" | "inventory", data: any) => void;
  exportToCSV: (reportType: "transport" | "inventory", data: any) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const { trips } = useTransport();
  const { trucks } = useInventory();
  const [dashboardOverview, setDashboardOverview] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [fleetStatus, setFleetStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      refreshDashboardData();
    }
  }, [isAuthenticated]);

  const refreshDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch dashboard overview
      const overviewResponse = await apiClient.get<ApiResponse>(API_ENDPOINTS.DASHBOARD.OVERVIEW);
      if (overviewResponse.success) {
        setDashboardOverview(overviewResponse.data);
      }

      // Fetch recent trips
      const tripsResponse = await apiClient.get<ApiResponse>(API_ENDPOINTS.DASHBOARD.RECENT_TRIPS);
      if (tripsResponse.success) {
        setRecentTrips(tripsResponse.data || []);
      }

      // Fetch fleet status
      const fleetResponse = await apiClient.get<ApiResponse>(API_ENDPOINTS.DASHBOARD.FLEET_STATUS);
      if (fleetResponse.success) {
        setFleetStatus(fleetResponse.data);
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Using local data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTransportReport = (filter?: ReportFilter): TransportReport => {
    let filteredTrips = trips;

    if (filter) {
      filteredTrips = trips.filter((trip) => {
        const matchesDate =
          (!filter.dateFrom ||
            new Date(trip.startDate) >= new Date(filter.dateFrom)) &&
          (!filter.dateTo ||
            new Date(trip.startDate) <= new Date(filter.dateTo));
        const matchesTruck =
          !filter.truckId || trip.truckRegistration === filter.truckId;
        const matchesStatus = !filter.status || trip.status === filter.status;
        return matchesDate && matchesTruck && matchesStatus;
      });
    }

    const totalTrips = filteredTrips.length;
    const completedTrips = filteredTrips.filter(
      (trip) => trip.status === "completed",
    ).length;
    const totalRevenue = filteredTrips.reduce(
      (sum, trip) => {
        const revenue = trip.customerPayment || 0;
        return sum + (isNaN(revenue) ? 0 : revenue);
      },
      0,
    );
    const totalExpenses = filteredTrips.reduce(
      (sum, trip) => {
        const expenses = (
          (trip.expenses?.diesel || 0) +
          (trip.expenses?.tolls || 0) +
          (trip.expenses?.driver || 0) +
          (trip.expenses?.tyre || 0) +
          (trip.expenses?.misc || 0)
        );
        return sum + (isNaN(expenses) ? 0 : expenses);
      },
      0,
    );
    const totalProfit = filteredTrips.reduce(
      (sum, trip) => {
        const profit = trip.netProfit || 0;
        return sum + (isNaN(profit) ? 0 : profit);
      },
      0,
    );
    const averageProfitPerTrip = totalTrips > 0 ? (totalProfit / totalTrips) : 0;

    // Top performing trucks
    const truckPerformance = new Map<
      string,
      { trips: number; profit: number }
    >();
    filteredTrips.forEach((trip) => {
      const truckId = trip.vehicleId || 'Unknown';
      const current = truckPerformance.get(truckId) || {
        trips: 0,
        profit: 0,
      };
      const profit = trip.netProfit || 0;
      truckPerformance.set(truckId, {
        trips: current.trips + 1,
        profit: current.profit + (isNaN(profit) ? 0 : profit),
      });
    });

    const topPerformingTrucks = Array.from(truckPerformance.entries())
      .map(([truckId, data]) => ({ 
        truckId: truckId || 'Unknown',
        trips: data.trips || 0,
        profit: isNaN(data.profit) ? 0 : data.profit
      }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    // Monthly data
    const monthlyData = new Map<
      string,
      { trips: number; revenue: number; profit: number }
    >();
    filteredTrips.forEach((trip) => {
      const month = new Date(trip.startDate).toISOString().substring(0, 7);
      const current = monthlyData.get(month) || {
        trips: 0,
        revenue: 0,
        profit: 0,
      };
      const revenue = trip.customerPayment || 0;
      const profit = trip.netProfit || 0;
      monthlyData.set(month, {
        trips: current.trips + 1,
        revenue: current.revenue + (isNaN(revenue) ? 0 : revenue),
        profit: current.profit + (isNaN(profit) ? 0 : profit),
      });
    });

    const monthlyDataArray = Array.from(monthlyData.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Expense breakdown
    const expenseBreakdown = filteredTrips.reduce(
      (acc, trip) => ({
        diesel: acc.diesel + (trip.expenses?.diesel || 0),
        toll: acc.toll + (trip.expenses?.tolls || 0), // Keep 'toll' for UI consistency
        driver: acc.driver + (trip.expenses?.driver || 0),
        other: acc.other + ((trip.expenses?.tyre || 0) + (trip.expenses?.misc || 0)),
      }),
      { diesel: 0, toll: 0, driver: 0, other: 0 },
    );

    return {
      totalTrips,
      completedTrips,
      totalRevenue,
      totalExpenses,
      totalProfit,
      averageProfitPerTrip,
      topPerformingTrucks,
      monthlyData: monthlyDataArray,
      expenseBreakdown,
    };
  };

  const generateInventoryReport = (filter?: ReportFilter): InventoryReport => {
    let filteredTrucks = trucks;

    if (filter) {
      filteredTrucks = trucks.filter((truck) => {
        const matchesDate =
          (!filter.dateFrom ||
            new Date(truck.purchaseDate) >= new Date(filter.dateFrom)) &&
          (!filter.dateTo ||
            new Date(truck.purchaseDate) <= new Date(filter.dateTo));
        const matchesStatus = !filter.status || truck.status === filter.status;
        return matchesDate && matchesStatus;
      });
    }

    const totalTrucks = filteredTrucks.length;
    const soldTrucksList = filteredTrucks.filter(
      (truck) => truck.status === "sold" || truck.status === "SOLD",
    );
    const soldTrucks = soldTrucksList.length;
    const availableTrucks = filteredTrucks.filter(
      (truck) => truck.status === "available",
    ).length;
    const pendingNOCs = filteredTrucks.filter(
      (truck) => !truck.documents?.NOC || !truck.documents?.fitness,
    ).length;

    const totalInvestment = filteredTrucks.reduce((sum, truck) => {
      const expenses = Object.values(truck.expenses || {}).reduce(
        (expSum, exp) => expSum + (exp || 0),
        0,
      );
      const purchasePrice = truck.purchasePrice || 0;
      return sum + purchasePrice + (isNaN(expenses) ? 0 : expenses);
    }, 0);

    const totalSalesRevenue = soldTrucksList.reduce(
      (sum, truck) => {
        const salePrice = truck.sale?.price || 0;
        return sum + (isNaN(salePrice) ? 0 : salePrice);
      },
      0,
    );
    const totalProfit = soldTrucksList.reduce(
      (sum, truck) => {
        const profit = truck.resaleProfit || 0;
        return sum + (isNaN(profit) ? 0 : profit);
      },
      0,
    );
    const averageProfitPerTruck = soldTrucks > 0 ? totalProfit / soldTrucks : 0;

    // Top selling models
    const modelPerformance = new Map<
      string,
      { count: number; profit: number }
    >();
    soldTrucksList.forEach((truck) => {
      const current = modelPerformance.get(truck.model) || {
        count: 0,
        profit: 0,
      };
      const profit = truck.resaleProfit || 0;
      modelPerformance.set(truck.model, {
        count: current.count + 1,
        profit: current.profit + (isNaN(profit) ? 0 : profit),
      });
    });

    const topSellingModels = Array.from(modelPerformance.entries())
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    // Monthly purchases
    const monthlyPurchases = new Map<
      string,
      { purchases: number; investment: number }
    >();
    filteredTrucks.forEach((truck) => {
      const month = new Date(truck.purchaseDate).toISOString().substring(0, 7);
      const current = monthlyPurchases.get(month) || {
        purchases: 0,
        investment: 0,
      };
      const expenses = Object.values(truck.expenses || {}).reduce(
        (sum, exp) => sum + (exp || 0),
        0,
      );
      const purchasePrice = truck.purchasePrice || 0;
      monthlyPurchases.set(month, {
        purchases: current.purchases + 1,
        investment: current.investment + purchasePrice + (isNaN(expenses) ? 0 : expenses),
      });
    });

    const monthlyPurchasesArray = Array.from(monthlyPurchases.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Monthly sales
    const monthlySales = new Map<
      string,
      { sales: number; revenue: number; profit: number }
    >();
    soldTrucksList.forEach((truck) => {
      if (truck.sale) {
        const month = new Date(truck.sale.date)
          .toISOString()
          .substring(0, 7);
        const current = monthlySales.get(month) || {
          sales: 0,
          revenue: 0,
          profit: 0,
        };
        const revenue = truck.sale.price || 0;
        const profit = truck.resaleProfit || 0;
        monthlySales.set(month, {
          sales: current.sales + 1,
          revenue: current.revenue + (isNaN(revenue) ? 0 : revenue),
          profit: current.profit + (isNaN(profit) ? 0 : profit),
        });
      }
    });

    const monthlySalesArray = Array.from(monthlySales.entries())
      .map(([month, data]) => ({ month, ...data }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Expense breakdown
    const expenseBreakdown = filteredTrucks.reduce(
      (acc, truck) => ({
        transportation: acc.transportation + (truck.expenses?.transportation || 0),
        bodyWork: acc.bodyWork + (truck.expenses?.bodyWork || 0),
        kamaniWork: acc.kamaniWork + (truck.expenses?.kamaniWork || 0),
        tyre: acc.tyre + (truck.expenses?.tyres || truck.expenses?.tyreCharges || 0),
        paint: acc.paint + (truck.expenses?.painting || truck.expenses?.paintExpenses || 0),
        insurance: acc.insurance + (truck.expenses?.insuranceExpenses || 0),
        other:
          acc.other +
          (truck.expenses?.driverCharges || 0) +
          (truck.expenses?.diesel || 0) +
          (truck.expenses?.tollCharges || 0) +
          (truck.expenses?.floorExpenses || 0) +
          (truck.expenses?.fattaExpenses || 0) +
          (truck.expenses?.builtlyExpenses || 0) +
          (truck.expenses?.misc || 0),
      }),
      {
        transportation: 0,
        bodyWork: 0,
        kamaniWork: 0,
        tyre: 0,
        paint: 0,
        insurance: 0,
        other: 0,
      },
    );

    return {
      totalTrucks,
      soldTrucks,
      availableTrucks,
      totalInvestment,
      totalSalesRevenue,
      totalProfit,
      averageProfitPerTruck,
      pendingNOCs,
      topSellingModels,
      monthlyPurchases: monthlyPurchasesArray,
      monthlySales: monthlySalesArray,
      expenseBreakdown,
    };
  };

  const getDashboardMetrics = (): DashboardMetrics => {
    const transportReport = generateTransportReport();
    const inventoryReport = generateInventoryReport();

    const totalRevenue =
      transportReport.totalRevenue + inventoryReport.totalSalesRevenue;
    const totalProfit =
      transportReport.totalProfit + inventoryReport.totalProfit;
    const roi =
      inventoryReport.totalInvestment > 0
        ? (totalProfit / inventoryReport.totalInvestment) * 100
        : 0;

    return {
      transportMetrics: {
        totalTrips: transportReport.totalTrips,
        activeTrips: trips.filter(
          (trip) => trip.status === "in-transit" || trip.status === "planned",
        ).length,
        monthlyProfit: transportReport.monthlyData
          .filter(
            (data) => data.month === new Date().toISOString().substring(0, 7),
          )
          .reduce((sum, data) => sum + data.profit, 0),
        totalRevenue: transportReport.totalRevenue,
      },
      inventoryMetrics: {
        totalTrucks: inventoryReport.totalTrucks,
        soldTrucks: inventoryReport.soldTrucks,
        pendingNOCs: inventoryReport.pendingNOCs,
        totalProfit: inventoryReport.totalProfit,
      },
      overallMetrics: {
        totalProfit,
        totalRevenue,
        totalInvestment: inventoryReport.totalInvestment,
        roi,
      },
    };
  };

  const exportToPDF = (reportType: "transport" | "inventory", data: any) => {
    // Mock PDF export - in real implementation, use libraries like jsPDF
    alert(
      `PDF export feature will be implemented.`,
    );
  };

  const exportToCSV = (reportType: "transport" | "inventory", data: any) => {
    // Mock CSV export - in real implementation, convert data to CSV format

    let csvContent = "";

    if (reportType === "transport") {
      csvContent =
        "Trip ID,Truck,Source,Destination,Start Date,Customer Payment,Net Profit,Status\n";
      trips.forEach((trip) => {
        const tripId = trip.tripId || trip._id || 'N/A';
        csvContent += `${tripId},${trip.vehicleId},${trip.source},${trip.destination},${trip.startDate},${trip.customerPayment || 0},${trip.netProfit || 0},${trip.status}\n`;
      });
    } else {
      csvContent =
        "Truck ID,Registration,Model,Purchase Date,Purchase Price,Status,Resale Profit\n";
      trucks.forEach((truck) => {
        csvContent += `${truck._id || truck.truckId},${truck.registrationNumber},${truck.model},${truck.purchaseDate},${truck.purchasePrice || 0},${truck.status},${truck.resaleProfit || 0}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${reportType}_report.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const value = {
    generateTransportReport,
    generateInventoryReport,
    getDashboardMetrics,
    dashboardOverview,
    recentTrips,
    fleetStatus,
    loading,
    refreshDashboardData,
    exportToPDF,
    exportToCSV,
  };

  return (
    <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
}
