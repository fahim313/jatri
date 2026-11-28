import { Link } from "react-router-dom";
import { ExternalLink, Menu } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

function AdminNavbar({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-zinc-950/95 px-5 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-zinc-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>

        <span className="text-sm font-medium text-zinc-300">
          Administration
        </span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 text-sm text-zinc-400 transition hover:text-white sm:inline-flex"
        >
          View website
          <ExternalLink size={14} />
        </Link>

        <span className="hidden text-sm text-zinc-400 md:block">
          {user?.name || "Administrator"}
        </span>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-800 text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {(user?.name || "A").charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export default AdminNavbar;