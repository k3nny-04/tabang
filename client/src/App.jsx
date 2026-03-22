import "./App.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
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

const AppContent = () => {
  const { user, loading } = useAuthContext();
  const [reportOpen, setReportOpen] = useState(false);
  const location = useLocation();

  const hideNavbarPaths = ['/my-reports'];
  const shouldShowNavbar = user && !hideNavbarPaths.includes(location.pathname);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
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
              {/* DEFAULT */}
              <Route path="/" element={<Navigate to="/map" replace />} />

              {/* PUBLIC ROUTES */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<EmailLoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>

              {/* PROTECTED ROUTES */}
              <Route element={<ProtectedRoute />}>
                <Route path="/map" element={<MapPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/my-reports" element={<UserReportsPage />} />
              </Route>
            </Routes>
          </main>

          {shouldShowNavbar && (
            <Navbar onReportClick={() => setReportOpen(true)} />
          )}

          {user && (
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
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
