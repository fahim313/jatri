import { Outlet } from "react-router-dom";
import { useState } from "react";

import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:pl-64">
        <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="mx-auto max-w-7xl px-5 py-8 pb-16 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;