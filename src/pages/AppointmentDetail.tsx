import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  User,
  Scissors,
  MapPin,
  Loader2,
  Save,
  Mail,
  Phone,
  ListChecks,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi, type ApiAppointmentDetail, type ApiBeautician } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const UNASSIGN_VALUE = "__unassign__";

const AppointmentDetail = () => {
  const { isVendor } = useAuth();
  const readOnly = isVendor;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ApiAppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [beauticians, setBeauticians] = useState<ApiBeautician[]>([]);
  const [assignBeauticianId, setAssignBeauticianId] = useState<string>(UNASSIGN_VALUE);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi
      .getAppointmentById(id)
      .then((res) => {
        if (res.success && res.data) {
          setDetail(res.data as ApiAppointmentDetail);
          setAssignBeauticianId(res.data.beautician?.id ?? UNASSIGN_VALUE);
        } else {
          setDetail(null);
        }
      })
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    adminApi
      .getBeauticians(1, 50)
      .then((res) => {
        if (res.success && res.data?.items) {
          // Show only currently available (online or busy) beauticians in the assign dropdown
          const available = res.data.items.filter((b) => b.status === "online" || b.status === "busy");
          setBeauticians(available);
        } else {
          setBeauticians([]);
        }
      })
      .catch(() => setBeauticians([]));
  }, []);

  const beauticianLabel = (b: ApiBeautician) => {
    const status =
      b.status === "online" ? "Online" : b.status === "busy" ? "In Service" : "Offline";
    return `${b.name}${b.phone ? ` (${b.phone})` : ""} • ${status}`;
  };

  const handleSaveAssign = async () => {
    if (readOnly || !id) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await adminApi.updateAppointment(id, {
        beautician: assignBeauticianId && assignBeauticianId !== UNASSIGN_VALUE ? assignBeauticianId : null,
      });
      if (res.success && res.data) {
        setDetail(res.data as ApiAppointmentDetail);
        setMessage({ type: "success", text: "Beautician assignment saved." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e instanceof Error ? e.message : "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  if (!detail) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => navigate("/appointments")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
          <p className="text-muted-foreground">Appointment not found.</p>
        </div>
      </AdminLayout>
    );
  }

  const statusKey = detail.status as keyof typeof statusLabels;
  const statusLabel = statusLabels[statusKey] ?? detail.status;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/appointments")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Appointments
          </Button>
        </div>

        {readOnly && (
          <p className="text-sm rounded-md border border-border bg-muted/30 px-3 py-2 text-muted-foreground">
            View-only: super admin can assign or change beauticians on bookings.
          </p>
        )}

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Appointment details</h2>
            <p className="text-sm text-muted-foreground font-mono mt-1">{detail.id}</p>
          </div>
          <div className="p-6 grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Status</p>
              <p className="text-sm font-medium">{statusLabel}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Scheduled</p>
              <p className="text-sm flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {detail.scheduledAt ? new Date(detail.scheduledAt).toLocaleString() : "—"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Amount</p>
              <p className="text-sm flex items-center gap-1.5 font-semibold">
                <IndianRupee className="h-4 w-4 text-muted-foreground" />
                ₹{detail.price?.toLocaleString() ?? "0"}
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <p className="text-xs font-medium text-muted-foreground">Address</p>
              <p className="text-sm flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                {detail.address || "—"}
              </p>
            </div>
            {detail.notes && (
              <div className="space-y-1 sm:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">Notes</p>
                <p className="text-sm">{detail.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Customer
            </h2>
          </div>
          <div className="p-6 space-y-2">
            <p className="text-sm font-medium">{detail.customer.name || "—"}</p>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              {detail.customer.phone || "—"}
            </p>
            {"email" in detail.customer && detail.customer.email && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                {detail.customer.email}
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-muted-foreground" />
              Service
            </h2>
          </div>
          <div className="p-6">
            <p className="text-sm font-medium">{detail.service?.name || "—"}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Scissors className="h-5 w-5 text-muted-foreground" />
              Assign beautician
            </h2>
            {!readOnly && (
              <Button onClick={handleSaveAssign} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
            )}
          </div>
          <div className="p-6 space-y-4">
            {message && (
              <p
                className={`text-sm ${message.type === "success" ? "text-green-600" : "text-destructive"}`}
              >
                {message.text}
              </p>
            )}
            <div className="grid gap-2 max-w-md">
              <Label>Beautician</Label>
              <Select value={assignBeauticianId || UNASSIGN_VALUE} onValueChange={setAssignBeauticianId} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue placeholder="Select beautician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGN_VALUE}>Unassign</SelectItem>
                  {beauticians.map((b) => (
                    <SelectItem key={b._id} value={b.id ?? b._id}>
                      {beauticianLabel(b)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {detail.beautician && (
              <div className="pt-2 border-t border-border space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Current beautician</p>
                <p className="text-sm font-medium">{detail.beautician.name || "—"}</p>
                <p className="text-sm text-muted-foreground">{detail.beautician.phone || "—"}</p>
                {detail.distanceInKm != null && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {detail.distanceInKm} km from service location
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AppointmentDetail;
