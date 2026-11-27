
import { Link } from "react-router-dom";
import {
  Plane,
  MapPin,
  Mail,
  Phone,
  ArrowRight,
} from "lucide-react";

function Footer() {
  return (
    <footer className="bg-blue-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="mb-5 inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                <Plane size={23} />
              </div>
              <span className="text-2xl font-bold">Jatri</span>
            </Link>

            <p className="max-w-xs leading-relaxed text-blue-100/70">
              Your trusted partner for a safer and easier overseas migration
              journey.
            </p>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-semibold">Quick Links</h3>

            <ul className="space-y-3 text-blue-100/70">
              <li>
                <Link to="/" className="transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="transition hover:text-white">
                  Overseas Jobs
                </Link>
              </li>
              <li>
                <Link to="/guides" className="transition hover:text-white">
                  Migration Guides
                </Link>
              </li>
              <li>
                <Link to="/login" className="transition hover:text-white">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="transition hover:text-white">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-semibold">Our Services</h3>

            <ul className="space-y-3 text-blue-100/70">
              <li>Overseas Job Opportunities</li>
              <li>Agency Verification</li>
              <li>Migration Document Guides</li>
              <li>AI Migration Assistant</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-lg font-semibold">Contact Us</h3>

            <ul className="space-y-4 text-blue-100/70">
              <li className="flex items-start gap-3">
                <Mail size={19} className="mt-1 shrink-0 text-blue-400" />
                <span>support@jatri.com</span>
              </li>

              <li className="flex items-start gap-3">
                <Phone size={19} className="mt-1 shrink-0 text-blue-400" />
                <span>Contact support</span>
              </li>

              <li className="flex items-start gap-3">
                <MapPin size={19} className="mt-1 shrink-0 text-blue-400" />
                <span>Bangladesh</span>
              </li>
            </ul>

            <Link
              to="/guides"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-300 transition hover:text-white"
            >
              Explore Guides
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-center text-sm text-blue-100/60">
          <p>
            © {new Date().getFullYear()} Jatri. All rights reserved.
          </p>

          <p className="mt-2">
            Making overseas migration easier and safer.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
