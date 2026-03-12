import { useAuthContext } from '../providers/useAuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, FileText, LogOut, Shield, ChevronRight } from 'lucide-react';

const AccountPage = () => {
  const { user, userDoc, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // Helper function to extract initials for the profile avatar
  const getInitials = () => {
    if (userDoc?.firstName && userDoc?.lastName) {
      return `${userDoc.firstName[0]}${userDoc.lastName[0]}`;
    }
    // Fallback to the first letter of their email if userDoc is still loading
    return user?.email ? user.email[0].toUpperCase() : 'U';
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-bg-primary px-6 py-8 overflow-y-auto">
      <div className="w-full max-w-md space-y-8 mt-4">
        
        {/* Profile Header section */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-text-primary text-3xl font-black text-white shadow-xl">
            {getInitials()}
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-text-primary">
              {userDoc ? `${userDoc.firstName} ${userDoc.lastName}` : 'Loading...'}
            </h1>
            <div className="mt-1 flex items-center justify-center space-x-1 text-sm font-medium text-text-muted">
              <Shield size={14} className="text-blue-500" />
              <span className="capitalize">{userDoc?.role || 'Citizen'} Account</span>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        <div className="overflow-hidden rounded-2xl bg-surface shadow-sm">
          <div className="flex items-center space-x-4 border-b border-gray-100 p-4">
            <Mail className="text-text-muted" size={20} />
            <div className="flex-1">
              <p className="text-xs font-semibold text-text-muted">Email</p>
              <p className="text-sm font-medium text-text-primary">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4">
            <Phone className="text-text-muted" size={20} />
            <div className="flex-1">
              <p className="text-xs font-semibold text-text-muted">Contact Number</p>
              <p className="text-sm font-medium text-text-primary tracking-wide">
                {userDoc?.contactNo ? `+${userDoc.contactNo}` : 'Loading...'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="space-y-4 pt-2">
          
          {/* Link to My Reports Page */}
          <Link
            to="/my-reports"
            className="flex w-full items-center justify-between rounded-2xl bg-surface p-4 shadow-sm transition-all hover:bg-gray-50 active:scale-[0.98]"
          >
            <div className="flex items-center space-x-3">
              <div className="rounded-xl bg-blue-100 p-2 text-blue-600">
                <FileText size={20} strokeWidth={2.5} />
              </div>
              <span className="font-bold text-text-primary text-sm">My Reports</span>
            </div>
            <ChevronRight size={20} className="text-text-muted" />
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center space-x-2 rounded-2xl border border-red-100 bg-red-50 py-4 font-bold text-red-600 transition-colors hover:bg-red-100 active:scale-[0.98]"
          >
            <LogOut size={18} strokeWidth={2.5} />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default AccountPage;