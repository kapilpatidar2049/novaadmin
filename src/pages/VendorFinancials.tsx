import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  BarChart, 
  IndianRupee, 
  TrendingUp, 
  Users, 
  ChevronLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download,
  Calendar
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { DataTable } from "@/components/common/DataTable";

interface FinancialData {
  vendor: { id: string; name: string; commissionPercent: number };
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
    beautician: string;
    revenue: number;
    adminFee: number;
    vendorShare: number;
    beauticianFinalEarnings: number;
  }>;
}

const VendorFinancials = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      adminApi.getVendorFinancials(id).then((res) => {
        if (res.success && res.data) {
          setData(res.data);
        }
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
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

  const { summary, transactions, vendor } = data;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="page-header gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="page-title">{vendor.name} Financial Report</h1>
              <p className="page-description">Detailed breakdown of revenue, commissions, and share distribution.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.print()} className="no-print">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <IndianRupee className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="stat-card-label">Total Revenue</p>
                <p className="text-2xl font-bold text-foreground">₹{summary.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-xs text-success font-medium">
              <ArrowUpRight className="h-3 w-3" />
              <span>Full volume generated</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10">
                <TrendingUp className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="stat-card-label">My Commission</p>
                <p className="text-2xl font-bold text-foreground">₹{summary.totalAdminCommission.toLocaleString()}</p>
              </div>
            </div>
            <p className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest font-bold font-mono">Platform Fee (10%)</p>
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
            <p className="mt-4 text-xs text-muted-foreground font-medium">Based on {vendor.commissionPercent}% setup</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-success/10">
                <Users className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="stat-card-label">Team Earnings</p>
                <p className="text-2xl font-bold text-foreground">₹{summary.totalBeauticianEarnings.toLocaleString()}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground font-medium">Earned by {summary.appointmentCount} beauticians</p>
          </div>
        </div>

        {/* Detailed Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Performance Breakdown</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              All-time summary
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
                key: "beautician",
                header: "Beautician Share",
                className: "text-right text-success",
                render: (t) => (
                  <div className="flex flex-col items-end">
                    <span className="font-semibold">₹{t.beauticianFinalEarnings}</span>
                    <span className="text-[10px] text-muted-foreground">{t.beautician}</span>
                  </div>
                ),
              },
            ]}
            items={transactions}
            page={1}
            pageSize={100}
            total={transactions.length}
            onPageChange={() => {}}
            emptyMessage="No completed appointments yet."
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default VendorFinancials;
