import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "../providers/useAuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login-email" replace />;
  }

  return (
    <Outlet />
  );
}

export default ProtectedRoute;