import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const inputClass =
  "w-full rounded-md border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-white/40 focus:ring-1 focus:ring-white/20";

const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";

function isSafePath(path) {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//")
  );
}

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const { message, ...intent } = location.state || {};
  const redirectTo = isSafePath(intent.from) ? intent.from : "/dashboard";
  const goingToChat = redirectTo === "/chat";

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      navigate(redirectTo, {
        replace: true,
        state: intent,
      });
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-zinc-950 px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-white">Sign in</h1>

        <p className="mt-2 text-sm text-zinc-400">
          {goingToChat
            ? "Sign in to continue to Jatri AI."
            : "Sign in to your Jatri account."}
        </p>

        {message && (
          <p
            role="status"
            className="mt-6 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className={labelClass}>
              Email address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Your password"
                autoComplete="current-password"
                required
                className={`${inputClass} pr-16`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 transition hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-8 text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            state={intent}
            className="font-medium text-white underline underline-offset-4 hover:text-zinc-300"
          >
            Create one
          </Link>
        </p>

        <p className="mt-4 text-sm">
          <Link to="/" className="text-zinc-500 transition hover:text-white">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
