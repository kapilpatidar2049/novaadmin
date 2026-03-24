import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { DataTable } from "@/components/common/DataTable";
import { adminApi, type ApiPayment } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Payments = () => {
  const [items, setItems] = useState<ApiPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    adminApi
      .getPayments(page, pageSize, statusFilter === "all" ? "" : statusFilter)
      .then((res) => {
        if (res.success && res.data?.items) {
          setItems(res.data.items);
          setTotal(res.data.meta.total);
        } else {
          setItems([]);
        }
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Payment Management</h1>
            <p className="page-description">Track customer payments and settlement statuses</p>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable<ApiPayment>
          columns={[
            {
              key: "customer",
              header: "Customer",
              render: (p) => <span className="text-sm text-foreground">{p.customerName || "—"}</span>,
            },
            {
              key: "beautician",
              header: "Beautician",
              render: (p) => <span className="text-sm text-foreground">{p.beauticianName || "—"}</span>,
            },
            {
              key: "vendor",
              header: "Vendor",
              render: (p) => <span className="text-sm text-muted-foreground">{p.vendorName || "—"}</span>,
            },
            {
              key: "amount",
              header: "Amount",
              render: (p) => <span className="font-medium text-foreground">₹{(p.amount || 0).toLocaleString()}</span>,
            },
            {
              key: "status",
              header: "Status",
              render: (p) => <span className="text-sm uppercase text-foreground">{p.status}</span>,
            },
            {
              key: "order",
              header: "Order ID",
              render: (p) => <span className="text-xs text-muted-foreground">{p.providerOrderId || "—"}</span>,
            },
          ]}
          items={items}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          emptyMessage="No payments found."
        />
      </div>
    </AdminLayout>
  );
};

export default Payments;
