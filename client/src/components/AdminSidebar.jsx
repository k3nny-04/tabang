import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../providers/useAuthContext";
import { 
  LayoutDashboard, 
  FileWarning, 
  Tent, 
  ShieldAlert, 
  Users, 
  Boxes, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { FaHouse } from "react-icons/fa6";

const AdminSidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const navItems = [
    { name: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
    { name: "Reports", path: "/admin-reports", icon: FileWarning },
    { name: "Evacuation Shelters", path: "/admin-shelters", icon: FaHouse },
    { name: "Responders", path: "/admin-responders", icon: ShieldAlert },
    { name: "Users", path: "/admin-users", icon: Users },
    { name: "Inventory", path: "/admin-inventory", icon: Boxes },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <aside 
      className={`relative flex h-screen flex-col bg-text-primary text-white transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      } shadow-2xl z-50`}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-4 top-8 flex h-8 w-8 items-center justify-center rounded-full bg-white text-text-primary shadow-lg transition-transform hover:scale-110 z-50"
      >
        {isCollapsed ? <ChevronRight size={18} strokeWidth={3} /> : <ChevronLeft size={18} strokeWidth={3} />}
      </button>

      {/* Top Section */}
      <div className="flex h-24 shrink-0 items-center border-b border-white/10 px-4">
        <div className="flex items-center justify-center min-w-12">
          <img 
            src="/edited-logo.png" 
            alt="TABANG Logo" 
            className="h-10 w-auto object-contain drop-shadow-md"
          />
        </div>
        
        {/* Only show text if not collapsed */}
        <h1 
          className={`ml-3 text-2xl font-black tracking-[0.2em] text-bg-primary overflow-hidden whitespace-nowrap transition-all duration-300 ${
            isCollapsed ? "w-0 opacity-0" : "w-full opacity-100"
          }`}
        >
          TABANG
        </h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-6 custom-scrollbar">
        <ul className="flex flex-col space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  title={isCollapsed ? item.name : ""} 
                  className={`group relative flex items-center rounded-xl px-3 py-3.5 transition-all duration-200 ${
                    isActive 
                      ? "bg-white/15 font-bold shadow-inner" 
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-md bg-white"></div>
                  )}

                  <div className="flex items-center justify-center min-w-8">
                    <Icon size={22} className={isActive ? "text-white drop-shadow-md" : ""} />
                  </div>

                  <span 
                    className={`ml-3 whitespace-nowrap tracking-wide transition-all duration-300 ${
                      isCollapsed ? "w-0 opacity-0 hidden" : "w-full opacity-100"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section - Logout */}
      <div className="border-t border-white/10 p-4 shrink-0">
        <button
          onClick={handleLogout}
          title={isCollapsed ? "Logout" : ""}
          className="group flex w-full items-center rounded-xl px-3 py-3.5 text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
        >
          <div className="flex items-center justify-center min-w-8">
            <LogOut size={22} className="transition-transform group-hover:-translate-x-1" />
          </div>
          
          <span 
            className={`ml-3 whitespace-nowrap font-semibold tracking-wide transition-all duration-300 ${
              isCollapsed ? "w-0 opacity-0 hidden" : "w-full opacity-100"
            }`}
          >
            Logout
          </span>
        </button>
      </div>

    </aside>
  );
};

export default AdminSidebar;