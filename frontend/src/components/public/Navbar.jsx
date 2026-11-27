import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Plane, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const dashboardPath =
    user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard";

  const chatPath = isAuthenticated ? "/chat" : "/login";

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition ${
      isActive ? "text-white" : "text-zinc-400 hover:text-white"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-white/10 text-white"
        : "text-zinc-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
          <Plane className="h-6 w-6 -rotate-12 text-white" />
          <span className="text-xl font-semibold text-white">Jatri</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>

          <NavLink to={chatPath} state={{ from: "/chat" }} className={linkClass}>
            Ask Jatri AI
          </NavLink>

          <NavLink to="/agencies" className={linkClass}>
            Agencies
          </NavLink>

          <NavLink to="/guides" className={linkClass}>
            Guides
          </NavLink>

          <NavLink to="/jobs" className={linkClass}>
            Jobs
          </NavLink>

          <a
            href="#contact"
            className="text-sm font-medium text-zinc-400 transition hover:text-white"
          >
            Contact
          </a>
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              <Link
                to={dashboardPath}
                className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Dashboard
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="rounded-md p-2 text-white transition hover:bg-white/10 md:hidden"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-zinc-950 px-6 pb-5 pt-3 md:hidden">
          <div className="space-y-1">
            <NavLink to="/" end onClick={closeMenu} className={mobileLinkClass}>
              Home
            </NavLink>

            <NavLink
              to={chatPath}
              state={{ from: "/chat" }}
              onClick={closeMenu}
              className={mobileLinkClass}
            >
              Ask Jatri AI
            </NavLink>

            <NavLink
              to="/agencies"
              onClick={closeMenu}
              className={mobileLinkClass}
            >
              Agencies
            </NavLink>

            <NavLink to="/guides" onClick={closeMenu} className={mobileLinkClass}>
              Guides
            </NavLink>

            <NavLink to="/jobs" onClick={closeMenu} className={mobileLinkClass}>
              Jobs
            </NavLink>

            <a
              href="#contact"
              onClick={closeMenu}
              className="block rounded-md px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
            >
              Contact
            </a>
          </div>

          <div className="mt-4 flex gap-3 border-t border-white/10 pt-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={closeMenu}
                  className="flex-1 rounded-md border border-white/20 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex-1 rounded-md border border-white/20 px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="flex-1 rounded-md bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;