import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenueData = [
  { month: "Jan", revenue: 45000, services: 320 },
  { month: "Feb", revenue: 52000, services: 380 },
  { month: "Mar", revenue: 48000, services: 350 },
  { month: "Apr", revenue: 61000, services: 420 },
  { month: "May", revenue: 55000, services: 390 },
  { month: "Jun", revenue: 67000, services: 480 },
  { month: "Jul", revenue: 72000, services: 520 },
];

const cityRevenueData = [
  { city: "Mumbai", revenue: 125000 },
  { city: "Delhi", revenue: 98000 },
  { city: "Bangalore", revenue: 87000 },
  { city: "Chennai", revenue: 65000 },
  { city: "Hyderabad", revenue: 54000 },
];

const serviceDistribution = [
  { name: "Hair Styling", value: 35, color: "hsl(234, 89%, 54%)" },
  { name: "Makeup", value: 25, color: "hsl(173, 80%, 40%)" },
  { name: "Skin Care", value: 20, color: "hsl(142, 76%, 36%)" },
  { name: "Nails", value: 12, color: "hsl(38, 92%, 50%)" },
  { name: "Others", value: 8, color: "hsl(280, 68%, 55%)" },
];

export function RevenueChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Revenue Overview</h3>
          <p className="text-sm text-muted-foreground">Monthly revenue trends</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Revenue</span>
          </div>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(234, 89%, 54%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(234, 89%, 54%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis dataKey="month" stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} />
            <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 13%, 91%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(234, 89%, 54%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CityRevenueChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">City-wise Revenue</h3>
        <p className="text-sm text-muted-foreground">Top performing cities</p>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cityRevenueData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" horizontal={false} />
            <XAxis type="number" stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
            <YAxis dataKey="city" type="category" stroke="hsl(220, 9%, 46%)" fontSize={12} tickLine={false} width={80} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 13%, 91%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              formatter={(value: number) => [`₹${value.toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill="hsl(173, 80%, 40%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ServiceDistributionChart() {
  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Service Distribution</h3>
        <p className="text-sm text-muted-foreground">Bookings by service type</p>
      </div>
      <div className="h-[280px] flex items-center">
        <ResponsiveContainer width="50%" height="100%">
          <PieChart>
            <Pie
              data={serviceDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {serviceDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 13%, 91%)",
                borderRadius: "8px",
              }}
              formatter={(value: number) => [`${value}%`, "Share"]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-3">
          {serviceDistribution.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-sm text-foreground">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-foreground">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
