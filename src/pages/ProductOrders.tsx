import { useCallback, useEffect, useState } from "react";
import { ShoppingCart, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApi } from "@/lib/api";
import { toast } from "sonner";

type Row = {
  _id: string;
  customer?: { name?: string; phone?: string };
  vendor?: { name?: string };
  totalAmount: number;
  status: string;
  paymentMode?: string;
  address?: string;
  createdAt?: string;
};

const statuses = ["confirmed", "processing", "shipped", "delivered", "cancelled"] as const;

const ProductOrders = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getProductOrders(1, 100);
    if (res.success && res.data?.items) setRows(res.data.items as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    const res = await adminApi.updateProductOrderStatus(id, status);
    if (res.success) {
      toast.success("Status updated");
      load();
    } else {
      toast.error(res.message || "Update failed");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2">
            <ShoppingCart className="h-7 w-7 text-primary" />
            Product orders
          </h1>
          <p className="page-description">E-commerce orders from the customer app (same stock as salon inventory).</p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Date</th>
                <th className="text-left p-3 font-medium">Customer</th>
                <th className="text-left p-3 font-medium">Vendor</th>
                <th className="text-right p-3 font-medium">Amount</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              )}
              {!loading &&
                rows.map((r) => (
                  <tr key={r._id} className="border-t border-border">
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "—"}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{r.customer?.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.customer?.phone}</div>
                    </td>
                    <td className="p-3">{r.vendor?.name || "—"}</td>
                    <td className="p-3 text-right font-semibold">₹{r.totalAmount}</td>
                    <td className="p-3 min-w-[10rem]">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground capitalize">{r.status.replace(/_/g, " ")}</span>
                        {r.status === "pending_payment" ? (
                          <span className="text-xs">Awaiting online payment</span>
                        ) : r.status === "cancelled" ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <Select value={r.status} onValueChange={(v) => updateStatus(r._id, v)}>
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/invoices/${r._id}`)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Invoice
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <Button variant="outline" onClick={load}>
          Refresh
        </Button>
      </div>
    </AdminLayout>
  );
};

export default ProductOrders;
