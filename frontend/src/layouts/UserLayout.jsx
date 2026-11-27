import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  FileText,
  Building2,
  MessageCircle,
  LogOut,
  Menu,
  Plane,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

const navItems = [
  {
    name: "Dashboard",
    path: "/user/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "AI Assistant",
    path: "/chat",
    icon: MessageCircle,
    state: { from: "/chat" },
  },
  {
    name: "Verify Agency",
    path: "/agencies",
    icon: Building2,
  },
  {
    name: "Migration Guides",
    path: "/guides",
    icon: FileText,
  },
  {
    name: "Find Jobs",
    path: "/jobs",
    icon: BriefcaseBusiness,
  },
];

function UserLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    logout();
    closeSidebar();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-zinc-950 transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <Link
            to="/"
            onClick={closeSidebar}
            className="flex items-center gap-2"
          >
            <Plane size={22} className="-rotate-12 text-white" />
            <span className="text-xl font-semibold">Jatri</span>
          </Link>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                state={item.state}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 border-t border-white/10 px-6 py-5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <div className="flex min-h-screen flex-col md:ml-64">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-white/10 bg-zinc-950/95 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="rounded-md p-1.5 text-white transition hover:bg-white/10 md:hidden"
            >
              <Menu size={22} />
            </button>

            <h2 className="text-base font-semibold text-white">Dashboard</h2>
          </div>

          <div className="min-w-0 text-right">
            <p className="truncate text-sm font-medium text-white">
              {user?.name || "User"}
            </p>
            <p className="truncate text-xs text-zinc-500">{user?.email}</p>
          </div>
        </header>

        <main className="flex-1 bg-zinc-950 p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default UserLayout;