import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BarChart, 
  IndianRupee, 
  TrendingUp, 
  ChevronLeft, 
  Download,
  Calendar,
  Filter
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api";
import { DataTable } from "@/components/common/DataTable";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinancialData {
  beautician: { id: string; name: string; adminCommissionPercent: number; vendorCommissionPercent: number };
  summary: {
    totalRevenue: number;
    totalAdminCommission: number;
    totalVendorEarnings: number;
    totalBeauticianEarnings: number;
    appointmentCount: number;
  };
  transactions: Array<{
    id: string;
    date: string;
    customer: string;
    service: string;
    revenue: number;
    adminFee: number;
    vendorShare: number;
    beauticianFinalEarnings: number;
  }>;
}

const BeauticianFinancials = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");

  useEffect(() => {
    if (id) {
      setLoading(true);
      adminApi.getBeauticianFinancials(id, range).then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
        setLoading(false);
      });
    }
  }, [id, range]);

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!data) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <BarChart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Report Not Found</h2>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const { summary, transactions, beautician } = data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="page-header gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="page-title">{beautician.name} Earnings Report</h1>
              <p className="page-description">Performance and commission breakdown for the selected period.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 no-print">
            <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={range} onValueChange={setRange}>
                <SelectTrigger className="border-none bg-transparent h-7 w-[130px] shadow-none focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                  <SelectItem value="all">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="stat-card-label">Net Sales</p>
                <p className="text-2xl font-bold text-foreground">₹{summary.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="stat-card-label">Admin Commission</p>
                <p className="text-2xl font-bold text-foreground">₹{summary.totalAdminCommission.toLocaleString()}</p>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Fee: {beautician.adminCommissionPercent}%
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-orange-500/10">
                <BarChart className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="stat-card-label">Vendor Share</p>
                <p className="text-2xl font-bold text-foreground">₹{summary.totalVendorEarnings.toLocaleString()}</p>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
              Share: {beautician.vendorCommissionPercent}%
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <IndianRupee className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="stat-card-label">Net Payout</p>
                <p className="text-2xl font-bold text-foreground">₹{summary.totalBeauticianEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground capitalize">{range.replace(/_/g, ' ')} Breakdown</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              {summary.appointmentCount} Bookings
            </div>
          </div>

          <DataTable
            columns={[
              {
                key: "date",
                header: "Date",
                render: (t) => (
                  <span className="text-sm text-muted-foreground">
                    {new Date(t.date).toLocaleDateString()}
                  </span>
                ),
              },
              {
                key: "customer",
                header: "Customer",
                render: (t) => <span className="font-medium">{t.customer}</span>,
              },
              {
                key: "service",
                header: "Service",
                render: (t) => <span className="text-sm">{t.service}</span>,
              },
              {
                key: "revenue",
                header: "Revenue",
                className: "text-right",
                render: (t) => <span className="font-bold">₹{t.revenue}</span>,
              },
              {
                key: "adminFee",
                header: "Admin Fee",
                className: "text-right text-accent",
                render: (t) => <span>₹{t.adminFee}</span>,
              },
              {
                key: "vendorShare",
                header: "Vendor",
                className: "text-right text-orange-500",
                render: (t) => <span>₹{t.vendorShare}</span>,
              },
              {
                key: "earnings",
                header: "Your Share",
                className: "text-right text-success",
                render: (t) => (
                  <span className="font-semibold">₹{t.beauticianFinalEarnings}</span>
                ),
              },
            ]}
            items={transactions}
            page={1}
            pageSize={100}
            loading={loading}
            total={transactions.length}
            onPageChange={() => {}}
            emptyMessage="No completed bookings for this period."
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default BeauticianFinancials;
