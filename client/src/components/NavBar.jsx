import { MapPin, Plus, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navbar = ({ onReportClick }) => {
  return (
    <nav className="relative z-30 grid h-16 grid-cols-3 items-center border-t border-border-light bg-surface px-4 transition-colors">
      
      {/* Maps */}
      <NavLink
        to="/map"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs transition-colors ${
            isActive
              ? "text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          }`
        }
      >
        <MapPin size={22} />
        Maps
      </NavLink>

      {/* Floating Action Button */}
      <div className="relative flex justify-center">
        <button
          type="button"
          onClick={onReportClick}
          className="absolute -top-14 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-text-primary text-bg-primary shadow-lg transition active:scale-95 hover:bg-text-secondary"
        >
          <Plus size={26} />
        </button>
      </div>

      {/* Account */}
      <NavLink
        to="/account"
        className={({ isActive }) =>
          `flex flex-col items-center text-xs transition-colors ${
            isActive
              ? "text-text-primary"
              : "text-text-muted hover:text-text-secondary"
          }`
        }
      >
        <User size={22} />
        Account
      </NavLink>
    </nav>
  );
};

export default Navbar;