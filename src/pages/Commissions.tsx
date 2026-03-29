import { useEffect, useState } from "react";
import { Percent, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { adminApi, type ApiPlatformCommissionSettings } from "@/lib/api";
import { toast } from "sonner";

const Commissions = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ApiPlatformCommissionSettings>({
    beauticianCommissionPercent: 10,
    vendorCommissionPercent: 10,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await adminApi.getPlatformCommissionSettings();
        if (cancelled) return;
        if (res.success && res.data) setSettings(res.data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load commission settings");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await adminApi.updatePlatformCommissionSettings({
        beauticianCommissionPercent: settings.beauticianCommissionPercent,
        vendorCommissionPercent: settings.vendorCommissionPercent,
      });
      if (res.success && res.data) {
        setSettings(res.data);
        toast.success("Commission settings saved");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div className="page-header">
          <div>
            <h1 className="page-title">Platform commission</h1>
            <p className="page-description">
              Set the percentage the platform keeps from beautician earnings and from vendor revenue separately (0–100%).
              Beautician rate is used for service earnings; vendor rate applies to vendor-side flows such as product orders.
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Percent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Admin commission rates</h2>
              <p className="text-sm text-muted-foreground">Stored in the database and exposed to apps via the public API</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading settings…
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="beauticianPct">Beautician commission (%)</Label>
                <p className="text-sm text-muted-foreground">
                  Share of completed service revenue retained by the platform (before payout to beauticians).
                </p>
                <Input
                  id="beauticianPct"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={settings.beauticianCommissionPercent}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      beauticianCommissionPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                    }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="vendorPct">Vendor commission (%)</Label>
                <p className="text-sm text-muted-foreground">
                  Share of vendor-related revenue retained by the platform (e.g. shop / product orders).
                </p>
                <Input
                  id="vendorPct"
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={settings.vendorCommissionPercent}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      vendorCommissionPercent: Math.min(100, Math.max(0, Number(e.target.value) || 0)),
                    }))
                  }
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Commissions;
