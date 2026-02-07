import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, XCircle } from "lucide-react";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  time: string;
  city?: string;
}

interface RecentAlertsProps {
  alerts: Alert[];
}

export function RecentAlerts({ alerts }: RecentAlertsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <XCircle className="h-5 w-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-warning" />;
      default:
        return <Clock className="h-5 w-5 text-info" />;
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Alerts</h3>
          <p className="text-sm text-muted-foreground">System notifications</p>
        </div>
        <span className="text-xs text-muted-foreground">Last 24 hours</span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "alert-card",
              alert.type === "critical" && "critical",
              alert.type === "warning" && "warning",
              alert.type === "info" && "info"
            )}
          >
            {getIcon(alert.type)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                <span className="text-xs text-muted-foreground flex-shrink-0">{alert.time}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{alert.description}</p>
              {alert.city && (
                <span className="inline-block mt-1.5 px-2 py-0.5 bg-secondary rounded text-xs text-secondary-foreground">
                  {alert.city}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
