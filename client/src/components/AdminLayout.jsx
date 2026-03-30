import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-full bg-surface overflow-hidden">
      {/* The Collapsible Sidebar */}
      <AdminSidebar />
      
      {/* The Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet /> {/* This injects the current page's content here! */}
      </main>
    </div>
  );
};

export default AdminLayout;