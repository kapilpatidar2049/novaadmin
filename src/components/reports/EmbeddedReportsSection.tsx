import { useState, useEffect, useMemo } from "react";
import { Calendar, DollarSign, CheckCircle } from "lucide-react";
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

type Props = {
  beauticianId?: string;
  vendorId?: string;
  title?: string;
  className?: string;
};

export function EmbeddedReportsSection({ beauticianId, vendorId, title = "Reports", className }: Props) {
  const [period, setPeriod] = useState("30d");
  const [paymentsByStatus, setPaymentsByStatus] = useState<Array<{ _id: string; totalAmount: number; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  const { from, to } = useMemo(() => getDateRange(period), [period]);
  const scope = useMemo(
    () => ({
      ...(beauticianId ? { beauticianId } : {}),
      ...(vendorId ? { vendorId } : {}),
    }),
    [beauticianId, vendorId],
  );

  useEffect(() => {
    if (!beauticianId && !vendorId) {
      setPaymentsByStatus([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    adminApi
      .getReports(from, to, scope)
      .then((reportRes) => {
        if (reportRes.success && reportRes.data && "payments" in reportRes.data) {
          const payments = (reportRes.data as { payments: Array<{ _id: string; totalAmount: number; count: number }> })
            .payments || [];
          setPaymentsByStatus(payments);
        } else {
          setPaymentsByStatus([]);
        }
      })
      .catch(() => setPaymentsByStatus([]))
      .finally(() => setLoading(false));
  }, [from, to, scope, beauticianId, vendorId]);

  if (!beauticianId && !vendorId) return null;

  const totalPaid = paymentsByStatus.find((p) => p._id === "paid")?.totalAmount ?? 0;
  const paidCount = paymentsByStatus.find((p) => p._id === "paid")?.count ?? 0;
  const paymentChartData = paymentsByStatus.map((p) => ({ status: p._id, amount: p.totalAmount, count: p.count }));

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">This year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="stat-card-label">Paid revenue</p>
              <p className="text-xl font-bold text-foreground">
                {loading ? "—" : `₹${(totalPaid / 100000).toFixed(2)}L`}
              </p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="stat-card-label">Paid transactions</p>
              <p className="text-xl font-bold text-foreground">{loading ? "—" : paidCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <p className="text-sm font-medium text-foreground mb-1">Payments by status</p>
        <p className="text-xs text-muted-foreground mb-3">
          {from} — {to} · appointment-linked payments only
        </p>
        <div className="h-[240px]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Loading...</div>
          ) : paymentChartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No payment data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                <XAxis dataKey="status" stroke="hsl(220, 9%, 46%)" fontSize={11} tickLine={false} />
                <YAxis stroke="hsl(220, 9%, 46%)" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}K`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 13%, 91%)", borderRadius: "8px" }}
                  formatter={(value: number, _name: string, props: { payload: { count: number } }) => [
                    `₹${(value / 1000).toFixed(0)}K (${props.payload.count} txns)`,
                    "Amount",
                  ]}
                />
                <Bar dataKey="amount" fill="hsl(234, 89%, 54%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
