import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { cn } from "@/lib/utils";

interface Beautician {
  id: string;
  name: string;
  status: "online" | "busy" | "offline";
  city: string;
  lat: number;
  lng: number;
}

interface LiveMapProps {
  beauticians: Beautician[];
}

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India center
const DEFAULT_ZOOM = 5;

const statusColors = {
  online: "#22c55e",
  busy: "#eab308",
  offline: "#71717a",
};

function createStatusIcon(status: Beautician["status"]) {
  const color = statusColors[status];
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="
      width: 28px; height: 28px; border-radius: 50%;
      background: ${color}; border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function FitBounds({ beauticians }: { beauticians: Beautician[] }) {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (beauticians.length === 0) return;
    if (hasFitted.current) return;
    hasFitted.current = true;
    const points = beauticians.map((b) => [b.lat, b.lng] as [number, number]);
    const unique = points.filter(
      (p, i) => points.findIndex((q) => q[0] === p[0] && q[1] === p[1]) === i
    );
    if (unique.length === 0) return;
    if (unique.length === 1) {
      map.setView(unique[0], 12);
      return;
    }
    try {
      const bounds = L.latLngBounds(unique);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } catch {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  }, [map, beauticians]);

  return null;
}

export function LiveMap({ beauticians }: LiveMapProps) {
  const onlineCount = beauticians.filter((b) => b.status === "online").length;
  const busyCount = beauticians.filter((b) => b.status === "busy").length;

  return (
    <div className="map-container animate-fade-in relative rounded-lg overflow-hidden border border-border bg-muted/20">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="h-[380px] w-full z-0"
        scrollWheelZoom
        style={{ minHeight: "380px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds beauticians={beauticians} />
        {beauticians.map((beautician) => (
          <Marker
            key={beautician.id}
            position={[beautician.lat, beautician.lng]}
            icon={createStatusIcon(beautician.status)}
          >
            <Popup>
              <div className="min-w-[140px]">
                <p className="font-medium text-foreground">{beautician.name}</p>
                <p className="text-xs text-muted-foreground">{beautician.city}</p>
                <div
                  className={cn(
                    "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    beautician.status === "online" && "bg-green-100 text-green-800",
                    beautician.status === "busy" && "bg-amber-100 text-amber-800",
                    beautician.status === "offline" && "bg-gray-100 text-gray-600"
                  )}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        beautician.status === "online"
                          ? "#22c55e"
                          : beautician.status === "busy"
                            ? "#eab308"
                            : "#71717a",
                    }}
                  />
                  {beautician.status === "online"
                    ? "Available"
                    : beautician.status === "busy"
                      ? "In Service"
                      : "Offline"}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur rounded-lg border border-border p-3 shadow-card z-[1000]">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
            <span className="text-foreground font-medium">{onlineCount} Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#eab308]" />
            <span className="text-foreground font-medium">{busyCount} Busy</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#71717a]" />
            <span className="text-foreground font-medium">{beauticians.length - onlineCount - busyCount} Offline</span>
          </div>
        </div>
      </div>

      {beauticians.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-[999] rounded-lg">
          <p className="text-sm text-muted-foreground">No beautician locations to show. Locations update when beauticians share their position.</p>
        </div>
      )}
    </div>
  );
}
