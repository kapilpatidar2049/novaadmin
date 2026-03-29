import { useEffect, useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { adminApi, type ApiReferralSettings } from "@/lib/api";
import { toast } from "sonner";

const Referral = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<ApiReferralSettings>({
    isEnabled: false,
    customerRewardAmount: 0,
    beauticianRewardAmount: 0,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await adminApi.getReferralSettings();
        if (cancelled) return;
        if (res.success && res.data) setSettings(res.data);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to load referral settings");
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
      const res = await adminApi.updateReferralSettings({
        isEnabled: settings.isEnabled,
        customerRewardAmount: settings.customerRewardAmount,
        beauticianRewardAmount: settings.beauticianRewardAmount,
      });
      if (res.success && res.data) {
        setSettings(res.data);
        toast.success("Referral settings saved");
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
            <h1 className="page-title">Referral program</h1>
            <p className="page-description">
              Turn the referral system on or off and set wallet rewards for customers and beauticians when referrals
              qualify (your app logic decides when to pay these amounts).
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Referral system</h2>
              <p className="text-sm text-muted-foreground">Applies platform-wide for customer and beautician apps</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground py-8">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading settings…
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable referral program</Label>
                  <p className="text-sm text-muted-foreground">
                    When off, apps should hide referral UI; public API still returns amounts for caching.
                  </p>
                </div>
                <Switch
                  checked={settings.isEnabled}
                  onCheckedChange={(v) => setSettings((p) => ({ ...p, isEnabled: v }))}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="customerReward">Customer reward (₹)</Label>
                <p className="text-sm text-muted-foreground">
                  Amount credited to the customer side of a successful referral (e.g. referrer or new user — define in
                  your product flow).
                </p>
                <Input
                  id="customerReward"
                  type="number"
                  min={0}
                  step={1}
                  value={settings.customerRewardAmount}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      customerRewardAmount: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beauticianReward">Beautician reward (₹)</Label>
                <p className="text-sm text-muted-foreground">
                  Amount for the beautician when their referral qualifies.
                </p>
                <Input
                  id="beauticianReward"
                  type="number"
                  min={0}
                  step={1}
                  value={settings.beauticianRewardAmount}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      beauticianRewardAmount: Math.max(0, Number(e.target.value) || 0),
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

export default Referral;
