import { MapPin, Navigation } from "lucide-react";
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

export function LiveMap({ beauticians }: LiveMapProps) {
  const onlineCount = beauticians.filter((b) => b.status === "online").length;
  const busyCount = beauticians.filter((b) => b.status === "busy").length;

  return (
    <div className="map-container animate-fade-in">
      {/* Map Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Simulated Map Points */}
      <div className="absolute inset-0 p-8">
        {beauticians.map((beautician, index) => {
          const top = 15 + (index * 17) % 70;
          const left = 10 + (index * 23) % 80;
          
          return (
            <div
              key={beautician.id}
              className="absolute group cursor-pointer"
              style={{ top: `${top}%`, left: `${left}%` }}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 rounded-full transition-transform hover:scale-110",
                  beautician.status === "online" && "bg-success",
                  beautician.status === "busy" && "bg-warning",
                  beautician.status === "offline" && "bg-muted"
                )}
              >
                <Navigation className="h-4 w-4 text-white" />
                {beautician.status === "online" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse-soft ring-2 ring-card" />
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-card rounded-lg shadow-elevated border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                <p className="text-sm font-medium text-foreground">{beautician.name}</p>
                <p className="text-xs text-muted-foreground">{beautician.city}</p>
                <div className={cn(
                  "status-badge mt-1",
                  beautician.status === "online" && "online",
                  beautician.status === "busy" && "busy",
                  beautician.status === "offline" && "offline"
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    beautician.status === "online" && "bg-success",
                    beautician.status === "busy" && "bg-warning",
                    beautician.status === "offline" && "bg-muted-foreground"
                  )} />
                  {beautician.status === "online" ? "Available" : beautician.status === "busy" ? "In Service" : "Offline"}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur rounded-lg border border-border p-3 shadow-card">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-success" />
            <span className="text-foreground font-medium">{onlineCount} Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-foreground font-medium">{busyCount} Busy</span>
          </div>
        </div>
      </div>

      {/* Map Controls Placeholder */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button className="w-8 h-8 bg-card rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shadow-sm">
          <MapPin className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
