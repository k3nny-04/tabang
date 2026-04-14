import "./App.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { LocationProvider } from "./providers/LocationProvider";
import { useState } from "react";
import MapPage from "./pages/MapPage";
import AccountPage from "./pages/AccountPage";
import Navbar from "./components/NavBar";
import { LayersProvider } from "./providers/LayersProvider";
import BottomSheet from "./components/BottomSheet";
import ReportForm from "./components/ReportForm";
import { AuthProvider } from "./providers/AuthProvider";
import EmailLoginPage from "./pages/EmailLoginPage";
import { useAuthContext } from "./providers/useAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import SignupPage from "./pages/SignUpPage";
import UserReportsPage from "./pages/UserReportsPage";
import LocationOnboarding from "./components/LocationOnBoarding";
import { FaHouse } from "react-icons/fa6";
import AdminRoute from "./components/AdminRoute";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminLayout from "./components/AdminLayout";
import ReportsPage from "./pages/admin/ReportsPage";
import SheltersPage from "./pages/admin/SheltersPage";
import RespondersPage from "./pages/admin/RespondersPage";
import EmergencyModePage from "./pages/EmergencyModePage";
import { ToastProvider } from "./providers/ToastProvider";
import SplashScreen from "./pages/SplashScreen";

const AppContent = () => {
  const { user, userDoc, loading } = useAuthContext();
  const [reportOpen, setReportOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const showNavbarPaths = ['/map', '/account'];
  const shouldShowNavbar = user && userDoc?.role !== "ADMIN" && showNavbarPaths.includes(location.pathname);

  if (loading) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-surface gap-8">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute h-full w-full animate-ping rounded-full bg-text-primary/10 duration-1000"></div>
          
          <div className="relative z-10 flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-text-primary shadow-xl">
            <FaHouse className="text-bg-primary" size={32} />
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="animate-pulse text-sm font-bold tracking-[0.2em] text-text-primary/70 uppercase">
            Loading...
          </p>
        </div>

      </div>
    );
  }
  
  return (
    <LocationProvider>
      <LayersProvider>
        <div className="relative flex h-dvh flex-col transition-colors">
          <main className="flex-1 overflow-auto">
            {<LocationOnboarding />}

            <Routes>
              {/* PUBLIC ROUTES */}
              <Route element={<PublicRoute />}>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/login" element={<EmailLoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route 
                  path="/emergency" 
                  element={
                  <EmergencyModePage 
                    onBack={() => navigate('/')} 
                    onSuccess={() => navigate('/')}
                  />} 
                />
              </Route>

              {/* PROTECTED ROUTES */}
              <Route element={<ProtectedRoute />}>
                <Route path="/map" element={<MapPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/my-reports" element={<UserReportsPage />} />
              </Route>

              {/* ADMIN ROUTES */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout/>}>
                  <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin-reports" element={<ReportsPage/>} />
                  <Route path="/admin-shelters" element={<SheltersPage/>} />
                  <Route path="/admin-responders" element={<RespondersPage/>} />
                  <Route path="/admin-users" element={<div>Users Page Placeholder</div>} />
                  <Route path="/admin-inventory" element={<div>Inventory Page Placeholder</div>} />
                </Route>
              </Route>
              
              {/* NOT FOUND */}
              <Route path="*" element={<NotFoundPage/>}/>
            </Routes>
          </main>

          {shouldShowNavbar && (
            <Navbar onReportClick={() => setReportOpen(true)} />
          )}

          {user && userDoc?.role !== "ADMIN" && (
            <BottomSheet
              open={reportOpen}
              onClose={() => setReportOpen(false)}
              title="Create a Report"
              height={85}
            >
              <ReportForm onSuccess={() => setReportOpen(false)} />
            </BottomSheet>
          )}
        </div>
      </LayersProvider>
    </LocationProvider>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;