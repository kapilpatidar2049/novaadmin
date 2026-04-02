import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, IndianRupee, User, Scissors, Search, ListFilter, Eye, MapPin } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { adminApi, type ApiAppointmentSummary } from "@/lib/api";
import { DataTable } from "@/components/common/DataTable";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  in_transit: "On the way",
  reached: "Arrived (OTP)",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  accepted: "bg-accent/10 text-accent",
  in_transit: "bg-info/10 text-info",
  reached: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
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
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAppointments(page, pageSize, statusFilter === "all" ? "" : statusFilter);
      if (res.success && res.data?.items) {
        setAppointments(res.data.items);
        setTotal(res.data.meta?.total ?? res.data.items.length);
      } else {
        setAppointments([]);
        setTotal(0);
      }
    } catch (e) {
      setAppointments([]);
      setTotal(0);
      setError(e instanceof Error ? e.message : "Failed to load appointments. Check that the API URL is correct (e.g. VITE_API_URL in .env).");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const hasAssignedBeautician = (appt: ApiAppointmentSummary) =>
    appt.status !== "pending" && Boolean(appt.beautician);

  const filtered = appointments.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const customerMatch =
        a.customer.name.toLowerCase().includes(q) ||
        a.customer.phone.toLowerCase().includes(q);
      const beauticianMatch = hasAssignedBeautician(a)
        ? Boolean(
            a.beautician?.name.toLowerCase().includes(q) ||
              a.beautician?.phone.toLowerCase().includes(q),
          )
        : false;
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
                <SelectItem value="in_transit">On the way</SelectItem>
                <SelectItem value="reached">Arrived</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <DataTable<ApiAppointmentSummary>
          columns={[
            {
              key: "id",
              header: "Appointment",
              render: (appt) => (
                <div className="flex flex-col">
                  <span className="font-medium truncate max-w-[180px]">
                    {appt.id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(appt.createdAt).toLocaleString()}
                  </span>
                </div>
              ),
            },
            {
              key: "customer",
              header: "Customer",
              render: (appt) => (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-col">
                    <span className="font-medium">{appt.customer.name || "—"}</span>
                    <span className="text-xs text-muted-foreground">
                      {appt.customer.phone || "—"}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              key: "beautician",
              header: "Beautician",
              render: (appt) => {
                const showAssignedBeautician = hasAssignedBeautician(appt);
                return (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                    {showAssignedBeautician ? (
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {appt.beautician?.name || "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {appt.beautician?.phone || "—"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Not yet assigned
                    </span>
                  )}
                  </div>
                );
              },
            },
            {
              key: "service",
              header: "Service",
              render: (appt) => (
                <span className="text-sm text-foreground">
                  {appt.service.name || "—"}
                </span>
              ),
            },
            {
              key: "scheduled",
              header: "Scheduled",
              render: (appt) => {
                const scheduled = appt.scheduledAt
                  ? new Date(appt.scheduledAt).toLocaleString()
                  : "-";
                return (
                  <div className="flex items-center gap-2 text-sm text-foreground">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{scheduled}</span>
                  </div>
                );
              },
            },
            {
              key: "amount",
              header: "Amount",
              render: (appt) => (
                <div className="flex items-center gap-1 text-sm text-foreground">
                  <IndianRupee className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">
                    {appt.price != null ? appt.price.toLocaleString() : "0"}
                  </span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (appt) => {
                const statusKey = appt.status as keyof typeof statusLabels;
                const statusLabel = statusLabels[statusKey] || appt.status;
                const statusColor = statusColors[statusKey] || "bg-muted text-muted-foreground";
                return (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                  >
                    {statusLabel}
                  </span>
                );
              },
            },
            {
              key: "distance",
              header: "Distance",
              render: (appt) => (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  {appt.beautician && appt.distanceInKm != null
                    ? `${appt.distanceInKm} km`
                    : appt.beautician
                      ? "—"
                      : "—"}
                </div>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (appt) => (
                <Button variant="outline" size="sm" onClick={() => navigate(`/appointments/${appt.id}`)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              ),
            },
          ]}
          items={filtered}
          loading={loading}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          emptyMessage="No appointments found."
        />
      </div>
    </AdminLayout>
  );
};

export default Appointments;

