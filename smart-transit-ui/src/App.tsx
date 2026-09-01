import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, GlobalStyles, Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Sayfa ve Genel Bileşen Importları
import { LoginPage } from './features/auth/components/LoginPage';
import { RegisterPage } from './features/auth/components/RegisterPage';
import { PassengerDashboard } from './features/cards/components/PassengerDashboard';

// Admin Bileşenleri
import { AdminLayout } from './features/admin/components/layout/AdminLayout';
import { OverviewDashboard } from './features/admin/components/OverviewDashboard';
import { TariffManagement } from './features/admin/components/TariffManagement';
import { OperatorManagement } from './features/admin/components/OperatorManagement';
import { SmartAssistant } from './features/admin/components/SmartAssistant';
import { FleetTracking } from './features/admin/components/FleetTracking';

// Operatör Bileşenleri
import OperatorDashboard from './features/operator/components/OperatorDashboard';
import { OperatorCardsPage } from './features/operator/components/OperatorCardsPage';
import CardApplicationsTab from './features/operator/components/CardApplicationsTab';
import VehicleDashboardPage from './features/vehicle/VehicleDashboard';
import RouteDashboardPage from './features/Routhe/RouteDashboard';
import { OperatorLayout } from './features/shared/components/OperatorLayout';
import Navbar from './features/shared/components/Navbar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Ana Düzen (Yolcu Görünümü)
const MainLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

// Kullanıcı Rolüne Göre Yönlendirici
const DashboardRedirect: React.FC = () => {
  const { user, isLoading } = useAuth() as { user: { role?: string | number } | null; isLoading?: boolean };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleStr = String(user?.role ?? '').toUpperCase();

  if (roleStr === 'ADMIN' || roleStr === '2') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (roleStr === 'OPERATOR' || roleStr === '1') {
    return <Navigate to="/operator/dashboard" replace />;
  }

  return <Navigate to="/passenger/dashboard" replace />;
};

// Yolcu Paneli Koruması
const PassengerDashboardWrapper: React.FC = () => {
  const { user } = useAuth() as { user: { role?: string | number } | null };
  const roleStr = String(user?.role ?? '').toUpperCase();

  if (roleStr === 'ADMIN' || roleStr === '2') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (roleStr === 'OPERATOR' || roleStr === '1') {
    return <Navigate to="/operator/dashboard" replace />;
  }

  return <PassengerDashboard />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CssBaseline />
        <GlobalStyles
          styles={{
            'html, body, #root': {
              width: '100% !important',
              maxWidth: '100% !important',
              margin: '0 !important',
              padding: '0 !important',
              overflowX: 'hidden',
            },
          }}
        />
        <BrowserRouter>
          <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#f8fafc' }}>
            <Routes>
              {/* Genel Rotalar */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Korumalı Rotalar */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<DashboardRedirect />} />

                {/* Admin Rotaları */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<OverviewDashboard />} />

                  {/* Tarife Yönetimi */}
                  <Route path="/admin/tariffs" element={<TariffManagement />} />
                  <Route path="/admin/fare" element={<Navigate to="/admin/tariffs" replace />} />
                  <Route path="/admin/tarife" element={<Navigate to="/admin/tariffs" replace />} />

                  {/* Diğer Admin Ekranları */}
                  <Route path="/admin/operators" element={<OperatorManagement />} />
                  <Route path="/admin/assistant" element={<SmartAssistant />} />
                  <Route path="/admin/fleet" element={<FleetTracking />} />
                  <Route path="/admin/fleet-tracking" element={<FleetTracking />} />
                </Route>

                {/* Yolcu Rotaları */}
                <Route element={<MainLayout />}>
                  <Route path="/passenger/dashboard" element={<PassengerDashboardWrapper />} />
                  <Route path="/cards" element={<PassengerDashboardWrapper />} />
                </Route>

                {/* Operatör Rotaları */}
                <Route element={<OperatorLayout />}>
                  <Route path="/operator/dashboard" element={<OperatorDashboard />} />
                  <Route path="/operator/cards" element={<OperatorCardsPage />} />
                  <Route path="/operator/applications" element={<CardApplicationsTab />} />
                  <Route path="/operator/vehicles" element={<VehicleDashboardPage />} />
                  <Route path="/operator/routes" element={<RouteDashboardPage />} />
                </Route>
              </Route>

              {/* Tanımsız Adresler */}
              <Route path="/" element={<DashboardRedirect />} />
              <Route path="*" element={<DashboardRedirect />} />
            </Routes>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;