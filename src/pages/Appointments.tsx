import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, IndianRupee, User, Scissors, Search, ListFilter, Eye, UserPlus, MapPin } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminApi, type ApiAppointmentSummary, type ApiAppointmentDetail } from "@/lib/api";
import { DataTable } from "@/components/common/DataTable";

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

const UNASSIGN_VALUE = "__unassign__";

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

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<ApiAppointmentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignAppointmentId, setAssignAppointmentId] = useState<string | null>(null);
  const [assignBeauticianId, setAssignBeauticianId] = useState<string>("");
  const [beauticians, setBeauticians] = useState<{ _id: string; id: string; name: string; phone: string }[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);

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

  useEffect(() => {
    if (!detailId || !detailOpen) return;
    setDetailLoading(true);
    adminApi
      .getAppointmentById(detailId)
      .then((res) => {
        if (res.success && res.data) setDetailData(res.data as ApiAppointmentDetail);
        else setDetailData(null);
      })
      .catch(() => setDetailData(null))
      .finally(() => setDetailLoading(false));
  }, [detailId, detailOpen]);

  useEffect(() => {
    if (!assignOpen) return;
    setAssignLoading(true);
    adminApi
      .getBeauticians(1, 50)
      .then((res) => {
        if (res.success && res.data?.items) setBeauticians(res.data.items);
        else setBeauticians([]);
      })
      .catch(() => setBeauticians([]))
      .finally(() => setAssignLoading(false));
  }, [assignOpen]);

  const openDetail = (id: string) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const openAssign = (appt: ApiAppointmentSummary) => {
    setAssignAppointmentId(appt.id);
    setAssignBeauticianId(appt.beautician?.id ?? UNASSIGN_VALUE);
    setAssignOpen(true);
  };

  const handleAssignSave = async () => {
    if (!assignAppointmentId) return;
    try {
      const res = await adminApi.updateAppointment(assignAppointmentId, {
        beautician: assignBeauticianId && assignBeauticianId !== UNASSIGN_VALUE ? assignBeauticianId : null,
      });
      if (res.success) {
        setAssignOpen(false);
        setAssignAppointmentId(null);
        setAssignBeauticianId("");
        fetchAppointments();
      }
    } catch {
      // error toast could be added
    }
  };

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
              render: (appt) => (
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
              ),
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
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDetail(appt.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openAssign(appt)}>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                </div>
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

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Appointment details</DialogTitle>
              <DialogDescription>Full appointment and customer/beautician info</DialogDescription>
            </DialogHeader>
            {detailLoading ? (
              <p className="text-sm text-muted-foreground py-4">Loading...</p>
            ) : detailData ? (
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono truncate">{detailData.id}</span>
                  <span className="text-muted-foreground">Status</span>
                  <span>{statusLabels[detailData.status] ?? detailData.status}</span>
                  <span className="text-muted-foreground">Scheduled</span>
                  <span>{detailData.scheduledAt ? new Date(detailData.scheduledAt).toLocaleString() : "—"}</span>
                  <span className="text-muted-foreground">Amount</span>
                  <span>₹{detailData.price?.toLocaleString() ?? "0"}</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Address</p>
                  <p className="text-sm">{detailData.address || "—"}</p>
                </div>
                {detailData.notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                    <p className="text-sm">{detailData.notes}</p>
                  </div>
                )}
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Customer</p>
                  <p className="text-sm font-medium">{detailData.customer.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">{detailData.customer.phone || "—"}</p>
                  {"email" in detailData.customer && detailData.customer.email && (
                    <p className="text-xs text-muted-foreground">{detailData.customer.email}</p>
                  )}
                </div>
                <div className="border-t pt-3 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Beautician</p>
                  {detailData.beautician ? (
                    <>
                      <p className="text-sm font-medium">{detailData.beautician.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{detailData.beautician.phone || "—"}</p>
                      {detailData.distanceInKm != null && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {detailData.distanceInKm} km from service location
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not assigned</p>
                  )}
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Service</p>
                  <p className="text-sm">{detailData.service?.name || "—"}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-4">Could not load details.</p>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={assignOpen} onOpenChange={(open) => { setAssignOpen(open); if (!open) setAssignAppointmentId(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign beautician</DialogTitle>
              <DialogDescription>Select a beautician for this appointment. Leave empty to unassign.</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {assignLoading ? (
                <p className="text-sm text-muted-foreground">Loading beauticians...</p>
              ) : (
                <Select value={assignBeauticianId || UNASSIGN_VALUE} onValueChange={setAssignBeauticianId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select beautician" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UNASSIGN_VALUE}>Unassign</SelectItem>
                    {beauticians.map((b) => (
                      <SelectItem key={b._id} value={b.id ?? b._id}>
                        {b.name} {b.phone ? `(${b.phone})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignOpen(false)}>Cancel</Button>
              <Button onClick={handleAssignSave} disabled={assignLoading}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Appointments;

