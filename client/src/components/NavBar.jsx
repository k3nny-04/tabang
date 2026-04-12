import { Map, FileText, User } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navbar = ({ onReportClick }) => {
  return (
    <div className="fixed bottom-[calc(0.5rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-[92%] max-w-85 -translate-x-1/2">
      
      <nav className="relative h-16 w-full">
        <div className="absolute inset-0 flex items-stretch drop-shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
          {/* Left solid side */}
          <div className="flex-1 rounded-l-4xl bg-surface"></div>
          
          {/* Center SVG Cutout */}
          <div className="relative w-22">
            <svg 
              viewBox="0 0 88 64" 
              className="absolute inset-0 h-full w-full text-surface"
              preserveAspectRatio="none"
            >
              <path 
                d="M0 0 C 22 0, 22 28, 44 28 C 66 28, 66 0, 88 0 L 88 64 L 0 64 Z" 
                fill="currentColor" 
              />
            </svg>
          </div>
          
          {/* Right solid side */}
          <div className="flex-1 rounded-r-4xl bg-surface"></div>
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex h-full w-full items-center justify-center gap-40">
          
          {/* Maps */}
          <NavLink
            to="/map"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition-colors ${
                isActive
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Map size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="mt-1 text-[10px] font-medium tracking-wide">Maps</span>
              </>
            )}
          </NavLink>

          {/* Center Floating Action Button (Report) */}
          <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 justify-center">
            <button
              type="button"
              onClick={onReportClick}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-text-primary text-bg-primary shadow-xl transition-all active:scale-95 hover:brightness-110"
              aria-label="File a Report"
            >
              <FileText size={26} strokeWidth={2.5} />
            </button>
          </div>

          {/* Account */}
          <NavLink
            to="/account"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center transition-colors ${
                isActive
                  ? "text-text-primary"
                  : "text-text-muted hover:text-text-secondary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <User size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="mt-1 text-[10px] font-medium tracking-wide">Account</span>
              </>
            )}
          </NavLink>

        </div>
      </nav>
    </div>
  );
};

export default Navbar;