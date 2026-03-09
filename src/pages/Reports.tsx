import { useState, useEffect, useMemo } from "react";
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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { adminApi } from "@/lib/api";

function getDateRange(period: string): { from?: string; to?: string } {
  const to = new Date();
  const from = new Date();
  if (period === "7d") from.setDate(from.getDate() - 7);
  else if (period === "30d") from.setDate(from.getDate() - 30);
  else if (period === "90d") from.setDate(from.getDate() - 90);
  else if (period === "1y") from.setFullYear(from.getFullYear() - 1);
  return { from: from.toISOString().split("T")[0], to: to.toISOString().split("T")[0] };
}

const Reports = () => {
  const [period, setPeriod] = useState("7d");
  const [paymentsByStatus, setPaymentsByStatus] = useState<Array<{ _id: string; totalAmount: number; count: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<{ totalPaidPayments?: number; topVendors?: Array<{ name: string; revenue: number }> } | null>(null);

  const { from, to } = useMemo(() => getDateRange(period), [period]);

  useEffect(() => {
    setLoading(true);
    Promise.all([adminApi.getReports(from, to), adminApi.getDashboard()]).then(([reportRes, dashRes]) => {
      if (reportRes.success && reportRes.data && "payments" in reportRes.data) {
        const payments = (reportRes.data as { payments: Array<{ _id: string; totalAmount: number; count: number }> }).payments || [];
        setPaymentsByStatus(payments);
      }
      if (dashRes.success && dashRes.data) {
        setDashboard({
          totalPaidPayments: dashRes.data.totalPaidPayments,
          topVendors: dashRes.data.topVendors?.map((v) => ({ name: v.name, revenue: v.revenue })),
        });
      }
      setLoading(false);
    });
  }, [from, to]);

  const totalPaid = paymentsByStatus.find((p) => p._id === "paid")?.totalAmount ?? 0;
  const paidCount = paymentsByStatus.find((p) => p._id === "paid")?.count ?? 0;
  const paymentChartData = paymentsByStatus.map((p) => ({ status: p._id, amount: p.totalAmount, count: p.count }));
  const vendorEarnings = dashboard?.topVendors ?? [];

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
                <p className="stat-card-label">Total Revenue (Paid)</p>
                <p className="text-2xl font-bold text-foreground">
                  {loading ? "—" : `₹${(totalPaid / 100000).toFixed(2)}L`}
                </p>
                <p className="text-xs text-muted-foreground">From payments in selected period</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="stat-card-label">Paid Transactions</p>
                <p className="text-2xl font-bold text-foreground">{loading ? "—" : paidCount}</p>
                <p className="text-xs text-muted-foreground">In selected period</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <MapPin className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="stat-card-label">Payment Statuses</p>
                <p className="text-2xl font-bold text-foreground">{loading ? "—" : paymentsByStatus.length}</p>
                <p className="text-xs text-muted-foreground">paid, pending, failed, etc.</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="stat-card-label">Period</p>
                <p className="text-2xl font-bold text-foreground">{period}</p>
                <p className="text-xs text-muted-foreground">{from} to {to}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment by Status */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Payments by Status</h3>
                <p className="text-sm text-muted-foreground">Amount and count in selected period</p>
              </div>
            </div>
            <div className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
              ) : paymentChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">No payment data for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="status" stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} />
                    <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px" }}
                      formatter={(value: number, name: string, props: { payload: { count: number } }) => [`₹${(value / 1000).toFixed(0)}K (${props.payload.count} txns)`, "Amount"]}
                    />
                    <Bar dataKey="amount" fill="hsl(234, 89%, 54%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Payment count by status */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Transaction Count by Status</h3>
                <p className="text-sm text-muted-foreground">Number of payments per status</p>
              </div>
            </div>
            <div className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">Loading...</div>
              ) : paymentChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="status" stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} />
                    <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px" }} />
                    <Bar dataKey="count" fill="hsl(173, 80%, 40%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* Top Vendor Earnings */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Top Vendor Earnings</h3>
                <p className="text-sm text-muted-foreground">From dashboard (paid payments by vendor)</p>
              </div>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading...</div>
              ) : vendorEarnings.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">No vendor earnings data yet</div>
              ) : (
                vendorEarnings.map((vendor, index) => (
                  <div key={vendor.name} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-foreground truncate">{vendor.name}</span>
                        <span className="text-sm font-medium text-foreground">₹{(vendor.revenue / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all duration-500"
                          style={{ width: `${vendorEarnings[0].revenue ? (vendor.revenue / vendorEarnings[0].revenue) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
