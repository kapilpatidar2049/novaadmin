import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Mail, MapPin, Phone, Store, Landmark, ArrowDownToLine, History, DollarSign, Users } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { adminApi, type ApiVendor, type ApiCity, type ApiBeautician } from "@/lib/api";
import { cn } from "@/lib/utils";
import { EmbeddedReportsSection } from "@/components/reports/EmbeddedReportsSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentHistoryPanel } from "@/components/detail/AppointmentHistoryPanel";

const VendorDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<ApiVendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkedBeauticians, setLinkedBeauticians] = useState<ApiBeautician[]>([]);
  const [loadingLinkedBeauticians, setLoadingLinkedBeauticians] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi
      .getVendorById(id)
      .then((res) => {
        if (res.success && res.data) setVendor(res.data);
        else setVendor(null);
      })
      .catch(() => setVendor(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!vendor?._id) return;
    setLoadingLinkedBeauticians(true);
    adminApi
      .getBeauticians(1, 200, "", "", vendor._id)
      .then((res) => {
        if (res.success && res.data?.items) {
          setLinkedBeauticians(res.data.items);
        } else {
          setLinkedBeauticians([]);
        }
      })
      .catch(() => setLinkedBeauticians([]))
      .finally(() => setLoadingLinkedBeauticians(false));
  }, [vendor?._id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!id || !vendor) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate("/vendors")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Button>
          <p className="text-muted-foreground">Vendor not found.</p>
        </div>
      </AdminLayout>
    );
  }

  const cityName =
    typeof vendor.city === "object" && vendor.city ? (vendor.city as ApiCity).name : String(vendor.city || "—");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/vendors")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vendors
          </Button>
        </div>

        {/* Profile */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-lg font-bold text-primary-foreground">
            {vendor.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{vendor.name}</h1>
            <p className="flex items-center gap-1 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {vendor.email}
            </p>
            {vendor.phone && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                {vendor.phone}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-2 font-medium text-foreground">Business details</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">City:</span>
                <span className="text-foreground">{cityName}</span>
              </li>
              {vendor.address && (
                <li className="flex items-start gap-2">
                  <Store className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">Address:</span>
                  <span className="break-words text-foreground">{vendor.address}</span>
                </li>
              )}
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    vendor.isActive !== false ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                  )}
                >
                  {vendor.isActive !== false ? "Active" : "Inactive"}
                </span>
              </li>
              <li className="space-y-1">
                <div>
                  <span className="text-muted-foreground">Vendor commission:</span>{" "}
                  <span className="font-medium text-foreground">{vendor.platformCommissionPercent ?? 10}%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  This vendor&apos;s share of their beauticians&apos; earnings from completed bookings.
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Tabs */}
        <div className="rounded-lg border border-border bg-card p-4 sm:p-6">
          <Tabs defaultValue="appointments" className="w-full">
            <TabsList className="flex h-auto min-h-10 w-full flex-wrap gap-1 justify-start p-1">
              <TabsTrigger value="appointments" className="gap-1.5">
                <History className="h-4 w-4 shrink-0" />
                Appointment history
              </TabsTrigger>
              <TabsTrigger value="earnings" className="gap-1.5">
                <DollarSign className="h-4 w-4 shrink-0" />
                Earnings
              </TabsTrigger>
              <TabsTrigger value="beauticians" className="gap-1.5">
                <Users className="h-4 w-4 shrink-0" />
                Linked beauticians
              </TabsTrigger>
              <TabsTrigger value="bank" className="gap-1.5">
                <Landmark className="h-4 w-4 shrink-0" />
                Bank details
              </TabsTrigger>
              <TabsTrigger value="withdrawals" className="gap-1.5">
                <ArrowDownToLine className="h-4 w-4 shrink-0" />
                Withdrawal requests
              </TabsTrigger>
            </TabsList>
            <TabsContent value="appointments" className="mt-4">
              <AppointmentHistoryPanel vendorId={vendor._id} />
            </TabsContent>
            <TabsContent value="earnings" className="mt-4">
              <EmbeddedReportsSection vendorId={vendor._id} title="Payment reports" />
            </TabsContent>
            <TabsContent value="beauticians" className="mt-4">
              {loadingLinkedBeauticians ? (
                <div className="flex items-center justify-center rounded-lg border border-border px-4 py-8 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading linked beauticians...
                </div>
              ) : linkedBeauticians.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                  No linked beauticians found.
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedBeauticians.map((b) => (
                    <div key={b._id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">{b.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {b.phone || "—"} • {b.city || "—"} • {b.status}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate(`/beauticians/${b.id}`)}>
                        Open
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="bank" className="mt-4">
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                <Landmark className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                <p className="mb-1 font-medium text-foreground">No bank details on server</p>
                <p>Vendor settlement bank details are not stored in the admin API yet.</p>
              </div>
            </TabsContent>
            <TabsContent value="withdrawals" className="mt-4">
              <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
                <ArrowDownToLine className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                <p className="mb-1 font-medium text-foreground">No withdrawal requests</p>
                <p>Vendor withdrawal or settlement requests will appear here when enabled.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
};

export default VendorDetail;
