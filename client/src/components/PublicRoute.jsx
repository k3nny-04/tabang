import { useAuthContext } from "../providers/useAuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { FaHouse } from "react-icons/fa6";

const PublicRoute = () => {
  const { user, loading } = useAuthContext();

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

  if (user) {
    return <Navigate to="/map" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
