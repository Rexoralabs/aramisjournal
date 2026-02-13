import { useState, useCallback, useRef, useLayoutEffect, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { BottomNav } from "@/components/layout/BottomNav";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import HomePage from "./pages/HomePage";
import WritePage from "./pages/WritePage";
import CalendarPage from "./pages/CalendarPage";
import FocusPage from "./pages/OrchardPage";
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
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/*" element={
        <ProtectedRoute>
          <>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/compose" element={<WritePage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/focus" element={<FocusPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/cellar" element={<CellarPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/privacy" element={<PrivacySecurityPage />} />
              <Route path="/settings" element={<AppSettingsPage />} />
              <Route path="/write" element={<Navigate to="/compose" replace />} />
              <Route path="/orchard" element={<Navigate to="/focus" replace />} />
              <Route path="/history" element={<Navigate to="/" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const handleSplashComplete = useCallback(() => setShowSplash(false), []);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => { window.removeEventListener("offline", goOffline); window.removeEventListener("online", goOnline); };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <OfflineBanner visible={isOffline} />
          {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
