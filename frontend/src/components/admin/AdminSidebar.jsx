import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Building2,
  FileText,
  LogOut,
  X,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const navigation = [
  {
    name: "Overview",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Job Management",
    path: "/admin/jobs",
    icon: BriefcaseBusiness,
  },
  {
    name: "Agency Management",
    path: "/admin/agencies",
    icon: Building2,
  },
  {
    name: "Document Management",
    path: "/admin/documents",
    icon: FileText,
  },
];

function AdminSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-zinc-950 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-6">
          <Link
            to="/admin/dashboard"
            onClick={onClose}
            className="text-xl font-semibold tracking-tight text-white"
          >
            Jatri
            <span className="ml-2 text-xs font-normal text-zinc-500">
              Admin
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
          <p className="mb-3 px-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                
                end={item.path === "/admin/dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition ${
                    isActive
                      ? "bg-white/10 font-medium text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 px-2">
            <p className="truncate text-sm font-medium text-white">
              {user?.name || "Admin"}
            </p>
            <p className="mt-1 truncate text-xs text-zinc-500">
              {user?.email || ""}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;