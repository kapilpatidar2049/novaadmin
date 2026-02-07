import { Users, Store, Scissors, DollarSign } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { LiveMap } from "@/components/dashboard/LiveMap";
import { RevenueChart, CityRevenueChart, ServiceDistributionChart } from "@/components/dashboard/Charts";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { TopVendorsTable } from "@/components/dashboard/TopVendorsTable";

// Mock data
const stats = [
  { title: "Total Customers", value: "24,583", change: 12.5, icon: Users, iconColor: "bg-primary/10 text-primary" },
  { title: "Active Beauticians", value: "1,284", change: 8.2, icon: Scissors, iconColor: "bg-accent/10 text-accent" },
  { title: "Vendors", value: "156", change: 4.1, icon: Store, iconColor: "bg-success/10 text-success" },
  { title: "Monthly Revenue", value: "₹12.4L", change: 15.3, icon: DollarSign, iconColor: "bg-warning/10 text-warning" },
];

const beauticians = [
  { id: "1", name: "Priya Sharma", status: "online" as const, city: "Mumbai", lat: 19.076, lng: 72.877 },
  { id: "2", name: "Anita Patel", status: "busy" as const, city: "Delhi", lat: 28.644, lng: 77.216 },
  { id: "3", name: "Sneha Reddy", status: "online" as const, city: "Bangalore", lat: 12.971, lng: 77.594 },
  { id: "4", name: "Kavita Singh", status: "offline" as const, city: "Chennai", lat: 13.082, lng: 80.270 },
  { id: "5", name: "Meera Joshi", status: "online" as const, city: "Hyderabad", lat: 17.385, lng: 78.486 },
  { id: "6", name: "Deepa Nair", status: "busy" as const, city: "Pune", lat: 18.520, lng: 73.856 },
  { id: "7", name: "Ritu Verma", status: "online" as const, city: "Ahmedabad", lat: 23.022, lng: 72.571 },
  { id: "8", name: "Sunita Das", status: "busy" as const, city: "Kolkata", lat: 22.572, lng: 88.363 },
];

const alerts = [
  { id: "1", type: "critical" as const, title: "Service Delay Alert", description: "Beautician delayed by more than 30 mins", time: "5 min ago", city: "Mumbai" },
  { id: "2", type: "warning" as const, title: "Low Beautician Availability", description: "Only 2 beauticians available in area", time: "15 min ago", city: "Delhi" },
  { id: "3", type: "info" as const, title: "New Vendor Registration", description: "Beauty Plus has registered as vendor", time: "1 hour ago", city: "Bangalore" },
  { id: "4", type: "warning" as const, title: "Payment Pending", description: "3 vendor settlements overdue", time: "2 hours ago" },
];

const topVendors = [
  { id: "1", name: "Glamour Studios", city: "Mumbai", revenue: 245000, beauticians: 24, growth: 18, avatar: "GS" },
  { id: "2", name: "Beauty Hub", city: "Delhi", revenue: 198000, beauticians: 18, growth: 12, avatar: "BH" },
  { id: "3", name: "Style Manor", city: "Bangalore", revenue: 175000, beauticians: 15, growth: 8, avatar: "SM" },
  { id: "4", name: "Luxe Beauty", city: "Chennai", revenue: 142000, beauticians: 12, growth: -3, avatar: "LB" },
  { id: "5", name: "Elite Salon", city: "Hyderabad", revenue: 128000, beauticians: 10, growth: 22, avatar: "ES" },
];

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-description">Monitor your beautician management system in real-time</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Map - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Live Beautician Tracking</h3>
                  <p className="text-sm text-muted-foreground">Real-time location of active beauticians</p>
                </div>
                <span className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  Live
                </span>
              </div>
              <LiveMap beauticians={beauticians} />
            </div>
          </div>

          {/* Alerts - Takes 1 column */}
          <RecentAlerts alerts={alerts} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <CityRevenueChart />
        </div>

        {/* Service Distribution & Top Vendors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ServiceDistributionChart />
          <div className="lg:col-span-2">
            <TopVendorsTable vendors={topVendors} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
