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
} from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminApi, type ApiBeauticianDetail } from "@/lib/api";
import { cn } from "@/lib/utils";

const BeauticianDetail = () => {
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
          setEditActive(res.data.isActive !== false);
        }
      })
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id || !detail) return;
    setSaving(true);
    setMessage(null);
    try {
      const body: Parameters<typeof adminApi.updateBeautician>[1] = {
        name: editName.trim(),
        phone: editPhone.trim() || undefined,
        rating: editRating.trim() ? Math.min(5, Math.max(0, Number(editRating))) : undefined,
        walletBalance: editWallet.trim() ? Math.max(0, Number(editWallet)) : undefined,
        isActive: editActive,
      };
      if (newPassword.trim()) body.password = newPassword.trim();
      const res = await adminApi.updateBeautician(id, body);
      if (res.success && res.data) {
        setDetail(res.data);
        setEditWallet(String(res.data.walletBalance ?? 0));
        setNewPassword("");
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
            </ul>
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
              <Input id="editName" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editPhone">Phone</Label>
              <Input id="editPhone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
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
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch id="editActive" checked={editActive} onCheckedChange={setEditActive} />
              <Label htmlFor="editActive">Active (can log in and receive bookings)</Label>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save changes
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default BeauticianDetail;
