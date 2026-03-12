import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, IndianRupee, User, Scissors, Search, ListFilter } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi, type ApiAppointmentSummary } from "@/lib/api";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  accepted: "bg-accent/10 text-accent",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  rejected: "bg-muted text-muted-foreground",
};

const Appointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<ApiAppointmentSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getAppointments(1, 100, statusFilter === "all" ? "" : statusFilter);
    if (res.success && res.data?.items) {
      setAppointments(res.data.items);
    }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const filtered = appointments.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const customerMatch =
        a.customer.name.toLowerCase().includes(q) ||
        a.customer.phone.toLowerCase().includes(q);
      const beauticianMatch =
        a.beautician?.name.toLowerCase().includes(q) ||
        a.beautician?.phone.toLowerCase().includes(q);
      const serviceMatch = a.service.name.toLowerCase().includes(q);
      return customerMatch || beauticianMatch || serviceMatch || a.id.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Appointments & Orders</h1>
            <p className="page-description">
              See which customer booked which beautician and track status.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, beautician, service or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="data-table-container">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Appointment
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Customer
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Beautician
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Service
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Scheduled
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Amount
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    Loading appointments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                    No appointments found.
                  </td>
                </tr>
              ) : (
                filtered.map((appt) => {
                  const statusKey = appt.status as keyof typeof statusLabels;
                  const statusLabel = statusLabels[statusKey] || appt.status;
                  const statusColor = statusColors[statusKey] || "bg-muted text-muted-foreground";
                  const scheduled = appt.scheduledAt
                    ? new Date(appt.scheduledAt).toLocaleString()
                    : "-";

                  return (
                    <tr
                      key={appt.id}
                      className="hover:bg-muted/20 transition-colors cursor-pointer"
                      onClick={() => {
                        if (appt.customer.id) {
                          navigate(`/users/${appt.customer.id}`);
                        }
                      }}
                    >
                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="flex flex-col">
                          <span className="font-medium truncate max-w-[180px]">
                            {appt.id}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(appt.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span className="font-medium">{appt.customer.name || "—"}</span>
                            <span className="text-xs text-muted-foreground">
                              {appt.customer.phone || "—"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Scissors className="h-4 w-4 text-muted-foreground" />
                          {appt.beautician ? (
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {appt.beautician.name || "—"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {appt.beautician.phone || "—"}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Not yet assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {appt.service.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{scheduled}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {appt.price != null ? appt.price.toLocaleString() : "0"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Appointments;

