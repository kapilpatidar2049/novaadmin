import { useState } from "react";
import { Search, Bell, AlertTriangle, Clock, XCircle, CheckCircle, Filter } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  city: string;
  time: string;
  read: boolean;
}

const alertsData: Alert[] = [
  { id: "1", type: "critical", title: "Service Delay - Exceeded 45 mins", description: "Beautician Priya Sharma is delayed by 48 minutes for appointment #4521", city: "Mumbai", time: "2 min ago", read: false },
  { id: "2", type: "warning", title: "Low Beautician Availability", description: "Only 2 beauticians available in South Delhi zone during peak hours", city: "Delhi", time: "15 min ago", read: false },
  { id: "3", type: "critical", title: "Customer Complaint Filed", description: "Customer reported service quality issue for appointment #4518", city: "Bangalore", time: "32 min ago", read: false },
  { id: "4", type: "info", title: "New Vendor Registration", description: "Beauty Plus Salon has completed registration in Chennai", city: "Chennai", time: "1 hour ago", read: true },
  { id: "5", type: "warning", title: "Payment Settlement Overdue", description: "3 vendor settlements pending for more than 48 hours", city: "Mumbai", time: "2 hours ago", read: true },
  { id: "6", type: "info", title: "High Demand Alert", description: "Booking requests increased by 40% in Hyderabad zone", city: "Hyderabad", time: "3 hours ago", read: true },
  { id: "7", type: "critical", title: "Service Cancellation Spike", description: "12 cancellations in last hour - investigate beautician availability", city: "Pune", time: "4 hours ago", read: true },
  { id: "8", type: "warning", title: "Rating Drop Alert", description: "Vendor Style Manor's rating dropped below 4.0 this week", city: "Bangalore", time: "5 hours ago", read: true },
  { id: "9", type: "info", title: "System Maintenance", description: "Scheduled maintenance completed successfully", city: "All", time: "6 hours ago", read: true },
  { id: "10", type: "warning", title: "GPS Tracking Issue", description: "3 beauticians showing offline despite active sessions", city: "Delhi", time: "8 hours ago", read: true },
];

const Alerts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [alerts, setAlerts] = useState<Alert[]>(alertsData);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || alert.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const criticalCount = alerts.filter((a) => a.type === "critical" && !a.read).length;
  const warningCount = alerts.filter((a) => a.type === "warning" && !a.read).length;
  const unreadCount = alerts.filter((a) => !a.read).length;

  const markAllRead = () => {
    setAlerts(alerts.map((a) => ({ ...a, read: true })));
  };

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
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Alerts & Monitoring</h1>
            <p className="page-description">Real-time alerts and system notifications</p>
          </div>
          <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>

        {/* Alert Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="stat-card-label">Total Alerts</p>
                <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-destructive/10">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="stat-card-label">Critical</p>
                <p className="text-2xl font-bold text-foreground">{criticalCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-warning/10">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="stat-card-label">Warnings</p>
                <p className="text-2xl font-bold text-foreground">{warningCount}</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-info/10">
                <Clock className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="stat-card-label">Unread</p>
                <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Alerts List */}
        <div className="bg-card rounded-xl border border-border divide-y divide-border">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                "p-4 hover:bg-muted/20 transition-colors",
                !alert.read && "bg-muted/10"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "p-2 rounded-lg flex-shrink-0",
                    alert.type === "critical" && "bg-destructive/10",
                    alert.type === "warning" && "bg-warning/10",
                    alert.type === "info" && "bg-info/10"
                  )}
                >
                  {getIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={cn("font-medium text-foreground", !alert.read && "font-semibold")}>
                          {alert.title}
                        </h4>
                        {!alert.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-2 py-0.5 bg-secondary rounded text-xs text-secondary-foreground">
                          {alert.city}
                        </span>
                        <span className="text-xs text-muted-foreground">{alert.time}</span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0",
                        alert.type === "critical" && "bg-destructive/10 text-destructive",
                        alert.type === "warning" && "bg-warning/10 text-warning",
                        alert.type === "info" && "bg-info/10 text-info"
                      )}
                    >
                      {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredAlerts.length === 0 && (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">No alerts found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                No alerts match your current filters
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Alerts;
