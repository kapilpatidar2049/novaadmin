import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Cities from "./pages/Cities";
import Vendors from "./pages/Vendors";
import Beauticians from "./pages/Beauticians";
import BeauticianDetail from "./pages/BeauticianDetail";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import Services from "./pages/Services";
import ServiceForm from "./pages/ServiceForm";
import Banners from "./pages/Banners";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import Payments from "./pages/Payments";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Referral from "./pages/Referral";
import Commissions from "./pages/Commissions";
import NotFound from "./pages/NotFound";
import Appointments from "./pages/Appointments";
import AppointmentDetail from "./pages/AppointmentDetail";
import Inventory from "./pages/Inventory";
import ProductOrders from "./pages/ProductOrders";

const queryClient = new QueryClient();

function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { isVendor } = useAuth();
  if (isVendor) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn && location.pathname !== "/login") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/cities" element={<ProtectedRoute><RequireSuperAdmin><Cities /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="/vendors" element={<ProtectedRoute><RequireSuperAdmin><Vendors /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="/beauticians" element={<ProtectedRoute><Beauticians /></ProtectedRoute>} />
              <Route path="/beauticians/:id" element={<ProtectedRoute><BeauticianDetail /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/users/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
              <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
              <Route path="/appointments/:id" element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/product-orders" element={<ProtectedRoute><ProductOrders /></ProtectedRoute>} />
              <Route path="/services" element={<ProtectedRoute><RequireSuperAdmin><Services /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="/services/new" element={<ProtectedRoute><RequireSuperAdmin><ServiceForm /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="/services/:id/edit" element={<ProtectedRoute><RequireSuperAdmin><ServiceForm /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="/banners" element={<ProtectedRoute><RequireSuperAdmin><Banners /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="/categories" element={<ProtectedRoute><RequireSuperAdmin><Categories /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><RequireSuperAdmin><Reports /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="/payments" element={<ProtectedRoute><RequireSuperAdmin><Payments /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
              <Route path="/referral" element={<ProtectedRoute><RequireSuperAdmin><Referral /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="/commissions" element={<ProtectedRoute><RequireSuperAdmin><Commissions /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><RequireSuperAdmin><Settings /></RequireSuperAdmin></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
