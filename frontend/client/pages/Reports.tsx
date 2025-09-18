import React, { useState, useMemo } from "react";
import { useReports, ReportFilter } from "../contexts/ReportsContext";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  Calendar,
  IndianRupee,
  Truck,
  Package,
  PieChart,
  LineChart,
  Filter,
} from "lucide-react";

export default function Reports() {
  const {
    generateTransportReport,
    generateInventoryReport,
    getDashboardMetrics,
    exportToPDF,
    exportToCSV,
  } = useReports();

  const [activeTab, setActiveTab] = useState("overview");
  const [transportFilter, setTransportFilter] = useState<ReportFilter>({});
  const [inventoryFilter, setInventoryFilter] = useState<ReportFilter>({});

  // Generate reports with filters
  const transportReport = useMemo(
    () => generateTransportReport(transportFilter),
    [generateTransportReport, transportFilter],
  );

  const inventoryReport = useMemo(
    () => generateInventoryReport(inventoryFilter),
    [generateInventoryReport, inventoryFilter],
  );

  const dashboardMetrics = useMemo(
    () => getDashboardMetrics(),
    [getDashboardMetrics],
  );

  const updateTransportFilter = (key: keyof ReportFilter, value: string) => {
    setTransportFilter((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const updateInventoryFilter = (key: keyof ReportFilter, value: string) => {
    setInventoryFilter((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (monthString: string) => {
    const date = new Date(monthString + "-01");
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground">
            Generate insights and reports for your transport business.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="transport" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Transport Reports
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Inventory Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  {formatCurrency(dashboardMetrics.overallMetrics.totalRevenue)}
                </div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Profit
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">
                  {formatCurrency(dashboardMetrics.overallMetrics.totalProfit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  ROI: {dashboardMetrics.overallMetrics.roi.toFixed(1)}%
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Investment
                </CardTitle>
                <Package className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">
                  {formatCurrency(
                    dashboardMetrics.overallMetrics.totalInvestment,
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Inventory + Expenses
                </p>
              </CardContent>
            </Card>

            <Card className="metric-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Trips
                </CardTitle>
                <Truck className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dashboardMetrics.transportMetrics.activeTrips}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dashboardMetrics.transportMetrics.totalTrips} total trips
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Business Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Transport Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Trips:</span>
                    <span className="font-bold">
                      {transportReport.totalTrips}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Completed:</span>
                    <span className="font-bold text-success">
                      {transportReport.completedTrips}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Avg Profit/Trip:
                    </span>
                    <span className="font-bold text-warning">
                      {formatCurrency(transportReport.averageProfitPerTrip)}
                    </span>
                  </div>
                  <Separator />
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Transport Profit
                    </p>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(transportReport.totalProfit)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Inventory Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Trucks:</span>
                    <span className="font-bold">
                      {inventoryReport.totalTrucks}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Sold:</span>
                    <span className="font-bold text-success">
                      {inventoryReport.soldTrucks}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pending NOCs:</span>
                    <span className="font-bold text-warning">
                      {inventoryReport.pendingNOCs}
                    </span>
                  </div>
                  <Separator />
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      Total Inventory Profit
                    </p>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(inventoryReport.totalProfit)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transport Reports Tab */}
        <TabsContent value="transport" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Transport Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transportDateFrom">From Date</Label>
                  <Input
                    id="transportDateFrom"
                    type="date"
                    value={transportFilter.dateFrom || ""}
                    onChange={(e) =>
                      updateTransportFilter("dateFrom", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transportDateTo">To Date</Label>
                  <Input
                    id="transportDateTo"
                    type="date"
                    value={transportFilter.dateTo || ""}
                    onChange={(e) =>
                      updateTransportFilter("dateTo", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transportStatus">Status</Label>
                  <Select
                    value={transportFilter.status || "all"}
                    onValueChange={(value) =>
                      updateTransportFilter(
                        "status",
                        value === "all" ? "" : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                      <SelectItem value="in-transit">In Transit</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={() => exportToCSV("transport", transportReport)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    onClick={() => exportToPDF("transport", transportReport)}
                    variant="outline"
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transport Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performing Trucks */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Trucks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transportReport.topPerformingTrucks.map((truck, index) => (
                    <div
                      key={truck.truckId}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          #{index + 1} {truck.truckId}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {truck.trips} trips
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-success">
                          {formatCurrency(truck.profit)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(transportReport.expenseBreakdown).map(
                    ([category, amount]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">
                            {category}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2"
                            style={{
                              width: `${
                                (amount / transportReport.totalExpenses) * 100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Trips</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transportReport.monthlyData.map((data) => (
                      <TableRow key={data.month}>
                        <TableCell className="font-medium">
                          {formatMonth(data.month)}
                        </TableCell>
                        <TableCell className="text-right">
                          {data.trips}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(data.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              data.profit >= 0
                                ? "text-success"
                                : "text-destructive"
                            }
                          >
                            {formatCurrency(data.profit)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Reports Tab */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Inventory Report Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inventoryDateFrom">From Date</Label>
                  <Input
                    id="inventoryDateFrom"
                    type="date"
                    value={inventoryFilter.dateFrom || ""}
                    onChange={(e) =>
                      updateInventoryFilter("dateFrom", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventoryDateTo">To Date</Label>
                  <Input
                    id="inventoryDateTo"
                    type="date"
                    value={inventoryFilter.dateTo || ""}
                    onChange={(e) =>
                      updateInventoryFilter("dateTo", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inventoryStatus">Status</Label>
                  <Select
                    value={inventoryFilter.status || "all"}
                    onValueChange={(value) =>
                      updateInventoryFilter(
                        "status",
                        value === "all" ? "" : value,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="noc-pending">NOC Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={() => exportToCSV("inventory", inventoryReport)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button
                    onClick={() => exportToPDF("inventory", inventoryReport)}
                    variant="outline"
                    className="flex-1"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Selling Models */}
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryReport.topSellingModels.map((model, index) => (
                    <div
                      key={model.model}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          #{index + 1} {model.model}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {model.count} sold
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-success">
                          {formatCurrency(model.profit)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expense Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(inventoryReport.expenseBreakdown).map(
                    ([category, amount]) => {
                      const totalExpenses = Object.values(
                        inventoryReport.expenseBreakdown,
                      ).reduce((sum, exp) => sum + exp, 0);
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium capitalize">
                              {category.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(amount)}
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div
                              className="bg-accent rounded-full h-2"
                              style={{
                                width: `${(amount / totalExpenses) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Sales Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Sales</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryReport.monthlySales.map((data) => (
                      <TableRow key={data.month}>
                        <TableCell className="font-medium">
                          {formatMonth(data.month)}
                        </TableCell>
                        <TableCell className="text-right">
                          {data.sales}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(data.revenue)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              data.profit >= 0
                                ? "text-success"
                                : "text-destructive"
                            }
                          >
                            {formatCurrency(data.profit)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
