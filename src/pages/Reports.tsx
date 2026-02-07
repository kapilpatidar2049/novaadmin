import { useState } from "react";
import { Download, Calendar, TrendingUp, DollarSign, CheckCircle, MapPin } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";

const monthlyRevenue = [
  { month: "Jan", revenue: 850000, services: 1420 },
  { month: "Feb", revenue: 920000, services: 1580 },
  { month: "Mar", revenue: 880000, services: 1490 },
  { month: "Apr", revenue: 1050000, services: 1720 },
  { month: "May", revenue: 980000, services: 1640 },
  { month: "Jun", revenue: 1150000, services: 1890 },
  { month: "Jul", revenue: 1240000, services: 2050 },
];

const cityRevenue = [
  { city: "Mumbai", revenue: 285000, growth: 18 },
  { city: "Delhi", revenue: 234000, growth: 12 },
  { city: "Bangalore", revenue: 198000, growth: 15 },
  { city: "Chennai", revenue: 156000, growth: 8 },
  { city: "Hyderabad", revenue: 142000, growth: 22 },
  { city: "Pune", revenue: 118000, growth: 10 },
];

const vendorEarnings = [
  { name: "Glamour Studios", earnings: 145000, services: 286 },
  { name: "Beauty Hub", earnings: 128000, services: 254 },
  { name: "Style Manor", earnings: 112000, services: 228 },
  { name: "Elite Salon", earnings: 98000, services: 196 },
  { name: "Luxe Beauty", earnings: 86000, services: 172 },
];

const serviceStats = [
  { month: "Jan", completed: 1380, cancelled: 40 },
  { month: "Feb", completed: 1520, cancelled: 60 },
  { month: "Mar", completed: 1440, cancelled: 50 },
  { month: "Apr", completed: 1680, cancelled: 40 },
  { month: "May", completed: 1590, cancelled: 50 },
  { month: "Jun", completed: 1840, cancelled: 50 },
  { month: "Jul", completed: 2000, cancelled: 50 },
];

const Reports = () => {
  const [period, setPeriod] = useState("7d");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-description">Comprehensive business insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">This Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="stat-card-label">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹12.4L</p>
                <p className="stat-card-trend positive">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +15.3% vs last period
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="stat-card-label">Services Completed</p>
                <p className="text-2xl font-bold text-foreground">11,790</p>
                <p className="stat-card-trend positive">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +12.8% vs last period
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="stat-card-label">Active Cities</p>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="stat-card-trend positive">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +2 new cities
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="stat-card-label">Completion Rate</p>
                <p className="text-2xl font-bold text-foreground">97.2%</p>
                <p className="stat-card-trend positive">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +0.8% vs last period
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Revenue Trend</h3>
                <p className="text-sm text-muted-foreground">Monthly revenue analysis</p>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(234, 89%, 54%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(234, 89%, 54%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="month" stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} />
                  <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} tickFormatter={(value) => `₹${value / 100000}L`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₹${(value / 100000).toFixed(2)}L`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(234, 89%, 54%)" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* City-wise Revenue */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">City-wise Revenue</h3>
                <p className="text-sm text-muted-foreground">Revenue by city</p>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cityRevenue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" horizontal={false} />
                  <XAxis type="number" stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} tickFormatter={(value) => `₹${value / 1000}K`} />
                  <YAxis dataKey="city" type="category" stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`₹${(value / 1000).toFixed(0)}K`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(173, 80%, 40%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Completion Stats */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Service Completion</h3>
                <p className="text-sm text-muted-foreground">Completed vs cancelled services</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-muted-foreground">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-destructive" />
                  <span className="text-muted-foreground">Cancelled</span>
                </div>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={serviceStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                  <XAxis dataKey="month" stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} />
                  <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(220, 13%, 91%)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="completed" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="cancelled" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Vendor Earnings */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Top Vendor Earnings</h3>
                <p className="text-sm text-muted-foreground">This month's top performers</p>
              </div>
            </div>
            <div className="space-y-4">
              {vendorEarnings.map((vendor, index) => (
                <div key={vendor.name} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground truncate">{vendor.name}</span>
                      <span className="text-sm font-medium text-foreground">₹{(vendor.earnings / 1000).toFixed(0)}K</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all duration-500"
                        style={{ width: `${(vendor.earnings / vendorEarnings[0].earnings) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{vendor.services} services completed</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
