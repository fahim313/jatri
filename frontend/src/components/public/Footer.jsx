import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Plane } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Footer() {
  const { isAuthenticated } = useAuth();
  const chatPath = isAuthenticated ? "/chat" : "/login";

  const linkClass = "text-zinc-400 transition hover:text-white";

  return (
    <footer
      id="contact"
      className="border-t border-white/10 bg-zinc-950 text-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-2">
              <Plane className="h-6 w-6 -rotate-12 text-white" />
              <span className="text-xl font-semibold">Jatri</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-6 text-zinc-400">
              Ask before you go abroad. Information about agencies, jobs and
              migration rules for Bangladeshi workers.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Quick links
            </h3>

            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className={linkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link to={chatPath} state={{ from: "/chat" }} className={linkClass}>
                  Ask Jatri AI
                </Link>
              </li>
              <li>
                <Link to="/guides" className={linkClass}>
                  Migration guidance
                </Link>
              </li>
              <li>
                <Link to="/jobs" className={linkClass}>
                  Published jobs
                </Link>
              </li>

              {!isAuthenticated && (
                <>
                  <li>
                    <Link to="/login" className={linkClass}>
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className={linkClass}>
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              What we offer
            </h3>

            <ul className="space-y-3 text-sm text-zinc-400">
              <li>AI migration assistant</li>
              <li>Agency verification</li>
              <li>Migration document guidance</li>
              <li>Published job listings</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">
              Contact us
            </h3>

            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex items-start gap-3">
                <Mail size={17} className="mt-0.5 shrink-0 text-zinc-500" />
                <span>support@jatri.com</span>
              </li>

              <li className="flex items-start gap-3">
                <Phone size={17} className="mt-0.5 shrink-0 text-zinc-500" />
                <span>Contact support</span>
              </li>

              <li className="flex items-start gap-3">
                <MapPin size={17} className="mt-0.5 shrink-0 text-zinc-500" />
                <span>Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Jatri. All rights reserved.</p>
          <p>Jatri AI gives general information, not legal advice.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;