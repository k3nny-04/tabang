import { useAuthContext } from "../providers/useAuthContext";
import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/map" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
