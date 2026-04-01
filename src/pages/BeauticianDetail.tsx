import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Scissors,
  DollarSign,
  Briefcase,
  Wallet,
  Star,
  Mail,
  Phone,
  MapPin,
  Store,
  Calendar,
  Loader2,
  Save,
  Shield,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminApi, type ApiBeauticianDetail } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { EmbeddedReportsSection } from "@/components/reports/EmbeddedReportsSection";

const BeauticianDetail = () => {
  const { isVendor } = useAuth();
  const readOnly = isVendor;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ApiBeauticianDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editRating, setEditRating] = useState("");
  const [editWallet, setEditWallet] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [editCityId, setEditCityId] = useState("");
  const [editVendorId, setEditVendorId] = useState("");
  const [editPlatformCommissionPercent, setEditPlatformCommissionPercent] = useState("10");
  const [cities, setCities] = useState<Array<{ _id: string; name: string }>>([]);
  const [vendors, setVendors] = useState<Array<{ _id: string; name: string }>>([]);
  const [kycStatus, setKycStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [docEdits, setDocEdits] = useState<Record<string, { status: "pending" | "approved" | "rejected"; notes: string }>>(
    {}
  );
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    adminApi
      .getBeauticianById(id)
      .then((res) => {
        if (res.success && res.data) {
          setDetail(res.data);
          setEditName(res.data.name);
          setEditPhone(res.data.phone || "");
          setEditRating(String(res.data.rating ?? 0));
          setEditWallet(String(res.data.walletBalance ?? 0));
          setEditCityId(res.data.cityId || "");
          setEditVendorId(res.data.vendorId || "");
          setEditPlatformCommissionPercent(String(res.data.platformCommissionPercent ?? 10));
          setEditActive(res.data.isActive !== false);
          setKycStatus(res.data.kycStatus || "pending");
          const initialDocs: Record<string, { status: "pending" | "approved" | "rejected"; notes: string }> = {};
          (res.data.documents || []).forEach((d) => {
            initialDocs[d.id] = { status: d.status, notes: d.notes || "" };
          });
          setDocEdits(initialDocs);
        }
      })
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    adminApi
      .getCities(1, 50)
      .then((res) => {
        if (res.success && res.data?.items) setCities(res.data.items.map((c) => ({ _id: c._id, name: c.name })));
      })
      .catch(() => setCities([]));
    adminApi
      .getVendors(1, 50)
      .then((res) => {
        if (res.success && res.data?.items) setVendors(res.data.items.map((v) => ({ _id: v._id, name: v.name })));
      })
      .catch(() => setVendors([]));
  }, []);

  /** Radix Select breaks when `value` is "" or doesn’t match any item (e.g. list still loading). */
  const citySelectValue =
    editCityId && cities.some((c) => c._id === editCityId) ? editCityId : undefined;
  const vendorSelectValue =
    editVendorId && vendors.some((v) => v._id === editVendorId) ? editVendorId : undefined;

  const handleSave = async () => {
    if (readOnly || !id || !detail) return;
    setSaving(true);
    setMessage(null);
    try {
      const body: Parameters<typeof adminApi.updateBeautician>[1] = {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        rating: editRating.trim() ? Math.min(5, Math.max(0, Number(editRating))) : undefined,
        walletBalance: editWallet.trim() ? Math.max(0, Number(editWallet)) : undefined,
        isActive: editActive,
        cityId: editCityId || undefined,
        vendorId: editVendorId || undefined,
        platformCommissionPercent: Math.min(100, Math.max(0, Number(editPlatformCommissionPercent) || 0)),
        kycStatus,
        documents: Object.entries(docEdits).map(([id, v]) => ({
          id,
          status: v.status,
          notes: v.notes,
        })),
      };
      if (newPassword.trim()) body.password = newPassword.trim();
      const res = await adminApi.updateBeautician(id, body);
      if (res.success && res.data) {
        setDetail(res.data);
        setEditWallet(String(res.data.walletBalance ?? 0));
        setEditPlatformCommissionPercent(String(res.data.platformCommissionPercent ?? 10));
        setNewPassword("");
        setKycStatus(res.data.kycStatus || "pending");
        const updatedDocs: Record<string, { status: "pending" | "approved" | "rejected"; notes: string }> = {};
        (res.data.documents || []).forEach((d) => {
          updatedDocs[d.id] = { status: d.status, notes: d.notes || "" };
        });
        setDocEdits(updatedDocs);
        setMessage({ type: "success", text: "Saved successfully." });
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
          <Button variant="ghost" onClick={() => navigate("/beauticians")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Beauticians
          </Button>
          <p className="text-muted-foreground">Beautician not found.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/beauticians")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Beauticians
          </Button>
        </div>

        {readOnly && (
          <p className="text-sm rounded-md border border-border bg-muted/30 px-3 py-2 text-muted-foreground">
            View-only: super admin can edit beautician profiles and KYC.
          </p>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center text-accent-foreground font-bold text-xl">
            {detail.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{detail.name}</h1>
            <p className="text-muted-foreground flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {detail.email}
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {detail.phone || "—"}
            </p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="stat-card-label">Total Jobs</p>
                <p className="text-2xl font-bold text-foreground">{detail.totalJobs}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-success/10">
                <DollarSign className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="stat-card-label">Total Earnings</p>
                <p className="text-2xl font-bold text-foreground">₹{detail.totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-accent/10">
                <Wallet className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="stat-card-label">Wallet Balance</p>
                <p className="text-2xl font-bold text-foreground">₹{(detail.walletBalance ?? 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/10">
                <Star className="h-6 w-6 text-warning fill-warning" />
              </div>
              <div>
                <p className="stat-card-label">Rating</p>
                <p className="text-2xl font-bold text-foreground">{detail.rating ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        {id && (
          <div className="bg-card rounded-lg border border-border p-6">
            <EmbeddedReportsSection beauticianId={id} title="Reports" />
          </div>
        )}

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg border border-border p-4">
            <h3 className="font-medium text-foreground mb-2">Details</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">City:</span>
                <span className="text-foreground">{detail.city || "—"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Store className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Vendor:</span>
                <span className="text-foreground">{detail.vendor || "—"}</span>
              </li>
              <li className="flex items-center gap-2">
                <Scissors className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">In progress:</span>
                <span className="text-foreground">{detail.inProgressCount ?? 0}</span>
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Completed today:</span>
                <span className="text-foreground">{detail.completedToday ?? 0}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">Experience (years):</span>
                <span className="text-foreground">{detail.experienceYears ?? 0}</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-muted-foreground">Platform commission:</span>
                <span className="text-foreground">{detail.platformCommissionPercent ?? 10}%</span>
              </li>
            </ul>
          </div>
          <div className="bg-card rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="font-medium text-foreground">KYC status</h3>
            </div>
            <div className="flex items-center gap-2">
              {kycStatus === "approved" ? (
                <CheckCircle2 className="h-4 w-4 text-success" />
              ) : kycStatus === "rejected" ? (
                <XCircle className="h-4 w-4 text-destructive" />
              ) : (
                <Loader2 className="h-4 w-4 text-warning" />
              )}
              <span className="text-sm text-foreground font-medium">{kycStatus.toUpperCase()}</span>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant={kycStatus === "approved" ? "default" : "outline"}
                onClick={() => setKycStatus("approved")}
                disabled={readOnly}
              >
                Approve KYC
              </Button>
              <Button
                size="sm"
                variant={kycStatus === "rejected" ? "default" : "outline"}
                onClick={() => setKycStatus("rejected")}
                disabled={readOnly}
              >
                Reject KYC
              </Button>
              <Button
                size="sm"
                variant={kycStatus === "pending" ? "default" : "outline"}
                onClick={() => setKycStatus("pending")}
                disabled={readOnly}
              >
                Mark pending
              </Button>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="bg-card rounded-lg border border-border p-6 space-y-4">
          <h3 className="font-medium text-foreground">Edit profile & settings</h3>
          {message && (
            <p className={cn("text-sm", message.type === "success" ? "text-green-600" : "text-destructive")}>
              {message.text}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="editName">Name</Label>
              <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input id="editPhone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} disabled={readOnly} />
            </div>
            <div className="grid gap-2">
              <Label>City</Label>
              <Select value={citySelectValue} onValueChange={setEditCityId} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c._id} value={c._id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Vendor</Label>
              <Select value={vendorSelectValue} onValueChange={setEditVendorId} disabled={readOnly}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => (
                    <SelectItem key={v._id} value={v._id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editRating">Rating (0–5)</Label>
              <Input
                id="editRating"
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={editRating}
                onChange={(e) => setEditRating(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editWallet">Wallet balance (₹)</Label>
              <Input
                id="editWallet"
                type="number"
                min={0}
                value={editWallet}
                onChange={(e) => setEditWallet(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPlatformPct">Platform commission (%)</Label>
              <p className="text-xs text-muted-foreground">Share of service revenue retained by the platform for this beautician (0–100).</p>
              <Input
                id="editPlatformPct"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={editPlatformCommissionPercent}
                onChange={(e) => setEditPlatformCommissionPercent(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="newPassword">New password (leave blank to keep current)</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={readOnly}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch id="editActive" checked={editActive} onCheckedChange={setEditActive} disabled={readOnly} />
              <Label htmlFor="editActive">Active (can log in and receive bookings)</Label>
            </div>
          </div>
          {!readOnly && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save changes
            </Button>
          )}
        </div>

        {/* KYC documents review */}
        {detail.documents && detail.documents.length > 0 && (
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h3 className="font-medium text-foreground">KYC documents</h3>
            <p className="text-xs text-muted-foreground">
              Review each document, then save. You must click save below (or &quot;Save changes&quot; in the form above) or your approvals will not be stored.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {detail.documents.map((doc) => {
                const current = docEdits[doc.id] || { status: doc.status, notes: doc.notes || "" };
                return (
                  <div key={doc.id} className="border border-border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground uppercase">{doc.type}</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium",
                          current.status === "approved"
                            ? "bg-emerald-50 text-emerald-700"
                            : current.status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        )}
                      >
                        {current.status.toUpperCase()}
                      </span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-xs text-primary hover:underline truncate"
                    >
                      View document
                    </a>
                    <div className="flex gap-2 mt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={readOnly}
                        onClick={() =>
                          setDocEdits((prev) => ({
                            ...prev,
                            [doc.id]: { ...(prev[doc.id] || current), status: "approved" },
                          }))
                        }
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={readOnly}
                        onClick={() =>
                          setDocEdits((prev) => ({
                            ...prev,
                            [doc.id]: { ...(prev[doc.id] || current), status: "rejected" },
                          }))
                        }
                      >
                        Reject
                      </Button>
                    </div>
                    <div className="mt-2">
                      <Label className="text-[11px] text-muted-foreground">Notes (shown to beautician)</Label>
                      <Input
                        className="mt-1 h-8 text-xs"
                        value={current.notes}
                        disabled={readOnly}
                        onChange={(e) =>
                          setDocEdits((prev) => ({
                            ...prev,
                            [doc.id]: { ...(prev[doc.id] || current), notes: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {!readOnly && (
              <Button onClick={handleSave} disabled={saving} className="mt-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save document changes
              </Button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}; 

export default BeauticianDetail;
