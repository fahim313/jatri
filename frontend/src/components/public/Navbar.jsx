import { Link, NavLink } from "react-router-dom";
import { Plane } from "lucide-react";

function Navbar() {
  return (
    <nav className="w-full bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Plane className="h-8 w-8 -rotate-12 text-blue-600" />

          <span className="text-2xl font-bold text-blue-950">
            Jatri
          </span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <NavLink to="/" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Home
          </NavLink>

          <NavLink to="/jobs" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Jobs
          </NavLink>

          <NavLink to="/guides" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Guides
          </NavLink>

          <a href="#about" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            About
          </a>

          <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-blue-600">
            Contact
          </a>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full border border-gray-200 px-5 py-2 text-sm font-semibold text-blue-950 transition hover:bg-blue-50"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;