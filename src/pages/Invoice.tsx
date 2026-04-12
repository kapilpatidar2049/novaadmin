import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, Printer, ChevronLeft, IndianRupee } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";

interface InvoiceData {
  _id: string;
  invoiceNumber: string;
  type: "service" | "product";
  date: string;
  customer: { name: string; email: string; phone: string; address: string };
  vendor: { name: string; address: string; phone: string };
  items: Array<{ name: string; quantity: number; price: number; total: number }>;
  subTotal: number;
  gstAmount: number;
  total: number;
  paymentMode: string;
  status: string;
}

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      adminApi.getInvoice(id).then((res) => {
        if (res.success && res.data) {
          setInvoice(res.data);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout>
        <div className="text-center py-20">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground">Invoice Not Found</h2>
          <p className="text-muted-foreground mb-6">The invoice you are looking for does not exist or is not available.</p>
          <Button onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between no-print">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm print:shadow-none print:border-none">
          {/* Header */}
          <div className="p-8 border-b border-border bg-muted/30">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <img src="/logo.png" alt="Nova Beauty" className="h-12 w-auto mb-4" />
                <h1 className="text-2xl font-bold text-foreground">{invoice.vendor.name}</h1>
                <p className="text-sm text-muted-foreground max-w-xs">{invoice.vendor.address}</p>
                <p className="text-sm text-muted-foreground">{invoice.vendor.phone}</p>
              </div>
              <div className="text-left md:text-right">
                <h2 className="text-4xl font-black text-primary/20 uppercase tracking-tighter mb-2">Invoice</h2>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Number: <span className="font-mono">{invoice.invoiceNumber}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {new Date(invoice.date).toLocaleDateString()}
                  </p>
                  <div className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2",
                    invoice.status === "PAID" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  )}>
                    {invoice.status}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Bill To</p>
              <div className="space-y-1">
                <p className="text-lg font-bold text-foreground">{invoice.customer.name}</p>
                <p className="text-sm text-muted-foreground">{invoice.customer.address}</p>
                <p className="text-sm text-muted-foreground">{invoice.customer.phone}</p>
                <p className="text-sm text-muted-foreground">{invoice.customer.email}</p>
              </div>
            </div>
            <div className="md:text-right">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Payment Method</p>
              <p className="text-sm font-medium text-foreground uppercase">{invoice.paymentMode.replace(/_/g, ' ')}</p>
            </div>
          </div>

          {/* Table */}
          <div className="px-8 pb-8">
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold uppercase tracking-wider">Description</th>
                    <th className="text-center py-3 px-4 font-semibold uppercase tracking-wider">Qty</th>
                    <th className="text-right py-3 px-4 font-semibold uppercase tracking-wider">Price</th>
                    <th className="text-right py-3 px-4 font-semibold uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-4 px-4 font-medium text-foreground">{item.name}</td>
                      <td className="py-4 px-4 text-center text-foreground">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-foreground">₹{item.price.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-foreground">₹{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="p-8 bg-muted/20 border-t border-border flex justify-end">
            <div className="w-full max-w-xs space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">₹{invoice.subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">GST (Included)</span>
                <span className="font-medium text-foreground">₹{invoice.gstAmount.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-lg font-bold text-foreground">Total</span>
                <span className="text-lg font-bold text-primary flex items-center">
                  <IndianRupee className="h-5 w-5 mr-0.5" />
                  {invoice.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="p-8 text-center border-t border-border">
            <p className="text-xs text-muted-foreground italic">
              Thank you for choosing {invoice.vendor.name}. This is a computer-generated invoice.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .AdminLayout_main { padding: 0 !important; }
        }
      `}</style>
    </AdminLayout>
  );
};

export default Invoice;
