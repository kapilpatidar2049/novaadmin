import { useState, useEffect } from "react";
import { Users, Store, Scissors, DollarSign } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { LiveMap } from "@/components/dashboard/LiveMap";
import { RevenueChart, CityRevenueChart, ServiceDistributionChart } from "@/components/dashboard/Charts";
import { RecentAlerts } from "@/components/dashboard/RecentAlerts";
import { TopVendorsTable } from "@/components/dashboard/TopVendorsTable";
import { adminApi } from "@/lib/api";

function useDashboardStats() {
  const [stats, setStats] = useState<Array<{ title: string; value: string; change: number; icon: typeof Users; iconColor: string }>>([
    { title: "Total Cities", value: "—", change: 0, icon: Store, iconColor: "bg-primary/10 text-primary" },
    { title: "Vendors", value: "—", change: 0, icon: Store, iconColor: "bg-success/10 text-success" },
    { title: "Services", value: "—", change: 0, icon: Scissors, iconColor: "bg-accent/10 text-accent" },
    { title: "Appointments", value: "—", change: 0, icon: DollarSign, iconColor: "bg-warning/10 text-warning" },
  ]);
  useEffect(() => {
    adminApi.getDashboard().then((res) => {
      if (res.success && res.data) {
        const d = res.data;
        setStats([
          { title: "Total Cities", value: String(d.totalCities), change: 0, icon: Store, iconColor: "bg-primary/10 text-primary" },
          { title: "Vendors", value: String(d.totalVendors), change: 0, icon: Store, iconColor: "bg-success/10 text-success" },
          { title: "Services", value: String(d.totalServices), change: 0, icon: Scissors, iconColor: "bg-accent/10 text-accent" },
          { title: "Paid Payments", value: String(d.totalPaidPayments), change: 0, icon: DollarSign, iconColor: "bg-warning/10 text-warning" },
        ]);
      }
    });
  }, []);
  return stats;
}

const defaultBeauticians: Array<{ id: string; name: string; status: "online" | "busy" | "offline"; city: string; lat: number; lng: number }> = [];
const defaultAlerts: Array<{ id: string; type: "critical" | "warning" | "info"; title: string; description: string; time: string; city?: string }> = [];
const defaultTopVendors: Array<{ id: string; name: string; city: string; revenue: number; beauticians: number; growth: number; avatar: string }> = [];

const Dashboard = () => {
  const stats = useDashboardStats();
  const [liveBeauticians, setLiveBeauticians] = useState(defaultBeauticians);
  const [recentAlerts, setRecentAlerts] = useState(defaultAlerts);
  const [topVendors, setTopVendors] = useState(defaultTopVendors);

  const fetchDashboard = () => {
    adminApi.getDashboard().then((res) => {
      if (res.success && res.data) {
        if (res.data.liveBeauticians?.length) setLiveBeauticians(res.data.liveBeauticians);
        else if (Array.isArray(res.data.liveBeauticians)) setLiveBeauticians([]);
        if (res.data.recentAlerts?.length) setRecentAlerts(res.data.recentAlerts);
        else if (Array.isArray(res.data.recentAlerts)) setRecentAlerts([]);
        if (res.data.topVendors?.length) setTopVendors(res.data.topVendors);
        else if (Array.isArray(res.data.topVendors)) setTopVendors([]);
      }
    });
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="page-description">Monitor your beautician management system in real-time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
              <LiveMap beauticians={liveBeauticians} />
            </div>
          </div>
          <RecentAlerts alerts={recentAlerts} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <CityRevenueChart />
        </div>

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
