import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/layout/BottomNav";
import HomePage from "./pages/HomePage";
import WritePage from "./pages/WritePage";
import CalendarPage from "./pages/CalendarPage";
import OrchardPage from "./pages/OrchardPage";
import InsightsPage from "./pages/InsightsPage";
import CellarPage from "./pages/CellarPage";
import ProfilePage from "./pages/ProfilePage";
import PrivacySecurityPage from "./pages/PrivacySecurityPage";
import AppSettingsPage from "./pages/AppSettingsPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/write" element={<WritePage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/orchard" element={<OrchardPage />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/cellar" element={<CellarPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/privacy" element={<PrivacySecurityPage />} />
                <Route path="/settings" element={<AppSettingsPage />} />
                <Route path="/history" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNav />
            </>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
