import { useEffect, useState } from "react";
import { Shield, Lock, Eye, Globe } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: true,
    loginNotifications: true,
    criticalAlerts: true,
    dailySummary: true,
    vendorRegistrationAlerts: false,
  });

  useEffect(() => {
    const raw = localStorage.getItem("admin_settings");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setSettings((prev) => ({ ...prev, ...parsed }));
    } catch {
      // ignore invalid local storage state
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 250));
    localStorage.setItem("admin_settings", JSON.stringify(settings));
    setSaving(false);
    setSaved(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-description">Manage your admin panel preferences and security settings</p>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Security</h2>
              <p className="text-sm text-muted-foreground">Configure security and access settings</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(v) => setSettings((p) => ({ ...p, twoFactorAuth: v }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after 30 minutes of inactivity
                </p>
              </div>
              <Switch
                checked={settings.sessionTimeout}
                onCheckedChange={(v) => setSettings((p) => ({ ...p, sessionTimeout: v }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Login Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts for new login attempts
                </p>
              </div>
              <Switch
                checked={settings.loginNotifications}
                onCheckedChange={(v) => setSettings((p) => ({ ...p, loginNotifications: v }))}
              />
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent/10">
              <Lock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Access Control</h2>
              <p className="text-sm text-muted-foreground">Super admin permissions and access levels</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">All Cities Access</p>
                  <p className="text-sm text-muted-foreground">Full access to all city data and operations</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                Enabled
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Location Data Access</p>
                  <p className="text-sm text-muted-foreground">Read-only access to historical location data</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-warning/10">
              <Shield className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
              <p className="text-sm text-muted-foreground">Configure alert and notification settings</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Critical Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive immediate notifications for critical issues
                </p>
              </div>
              <Switch
                checked={settings.criticalAlerts}
                onCheckedChange={(v) => setSettings((p) => ({ ...p, criticalAlerts: v }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Daily Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Get a daily digest of all activities
                </p>
              </div>
              <Switch
                checked={settings.dailySummary}
                onCheckedChange={(v) => setSettings((p) => ({ ...p, dailySummary: v }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Vendor Registration Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when new vendors register
                </p>
              </div>
              <Switch
                checked={settings.vendorRegistrationAlerts}
                onCheckedChange={(v) => setSettings((p) => ({ ...p, vendorRegistrationAlerts: v }))}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end items-center gap-3">
          {saved && <p className="text-sm text-green-600">Settings saved.</p>}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;
