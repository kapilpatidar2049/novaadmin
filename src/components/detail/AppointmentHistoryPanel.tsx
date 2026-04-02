import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Eye, IndianRupee, MapPin, Scissors, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminApi, type ApiAppointmentSummary } from "@/lib/api";
import { DataTable } from "@/components/common/DataTable";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  in_transit: "On the way",
  reached: "Arrived",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

function showAssignedBeautician(appt: ApiAppointmentSummary) {
  return appt.status !== "pending" && Boolean(appt.beautician);
}

type Props = {
  beauticianId?: string;
  vendorId?: string;
};

export function AppointmentHistoryPanel({ beauticianId, vendorId }: Props) {
  const navigate = useNavigate();
  const [items, setItems] = useState<ApiAppointmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!beauticianId && !vendorId) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    adminApi
      .getAppointments(page, pageSize, "", "", beauticianId ?? "", vendorId ?? "")
      .then((res) => {
        if (res.success && res.data?.items) {
          setItems(res.data.items);
          setTotal(res.data.meta?.total ?? res.data.items.length);
        } else {
          setItems([]);
          setTotal(0);
        }
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [beauticianId, vendorId, page]);

  if (!beauticianId && !vendorId) {
    return <p className="text-sm text-muted-foreground">Nothing to load.</p>;
  }

  return (
    <DataTable<ApiAppointmentSummary>
      columns={[
        {
          key: "id",
          header: "Appointment",
          render: (appt) => (
            <div className="flex flex-col max-w-[160px]">
              <span className="font-mono text-xs truncate">{appt.id}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(appt.createdAt).toLocaleString()}
              </span>
            </div>
          ),
        },
        {
          key: "customer",
          header: "Customer",
          render: (appt) => (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-medium">{appt.customer.name || "—"}</div>
                <div className="text-xs text-muted-foreground">{appt.customer.phone || "—"}</div>
              </div>
            </div>
          ),
        },
        {
          key: "beautician",
          header: "Beautician",
          render: (appt) =>
            showAssignedBeautician(appt) ? (
              <div className="flex items-center gap-2 text-sm">
                <Scissors className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <div className="font-medium">{appt.beautician?.name || "—"}</div>
                  <div className="text-xs text-muted-foreground">{appt.beautician?.phone || "—"}</div>
                </div>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Not yet assigned</span>
            ),
        },
        {
          key: "service",
          header: "Service",
          render: (appt) => <span className="text-sm">{appt.service.name || "—"}</span>,
        },
        {
          key: "scheduled",
          header: "Scheduled",
          render: (appt) => (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0" />
              {appt.scheduledAt ? new Date(appt.scheduledAt).toLocaleString() : "—"}
            </div>
          ),
        },
        {
          key: "amount",
          header: "Amount",
          render: (appt) => (
            <div className="flex items-center gap-1 text-sm font-semibold">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              {appt.price != null ? appt.price.toLocaleString() : "0"}
            </div>
          ),
        },
        {
          key: "status",
          header: "Status",
          render: (appt) => {
            const label = statusLabels[appt.status] || appt.status;
            return <span className="text-xs font-medium">{label}</span>;
          },
        },
        {
          key: "distance",
          header: "Distance",
          render: (appt) => (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              {appt.beautician && appt.distanceInKm != null ? `${appt.distanceInKm} km` : "—"}
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
      items={items}
      loading={loading}
      page={page}
      pageSize={pageSize}
      total={total}
      onPageChange={setPage}
      emptyMessage="No appointments found."
    />
  );
}
