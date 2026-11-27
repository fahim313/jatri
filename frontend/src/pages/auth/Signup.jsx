import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";

const inputClass =
  "w-full rounded-md border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-white/40 focus:ring-1 focus:ring-white/20";

const labelClass = "mb-1.5 block text-sm font-medium text-zinc-300";

function isSafePath(path) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();

  
  const { message: _ignored, ...intent } = location.state || {};
  const goingToChat = isSafePath(intent.from) && intent.from === "/chat";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login", {
        state: {
          ...intent,
          message: "Account created. Please sign in to continue.",
        },
      });
    } catch (err) {
      const detail = err.response?.data?.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-zinc-950 px-6 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold text-white">Create an account</h1>

        <p className="mt-2 text-sm text-zinc-400">
          {goingToChat
            ? "A free account is needed to use Jatri AI."
            : "A free account lets you use Jatri AI."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="name" className={labelClass}>
              Full name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              autoComplete="name"
              required
              className={inputClass}
            />
          </div>

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
                placeholder="Create a password"
                autoComplete="new-password"
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

          <div>
            <label htmlFor="confirm_password" className={labelClass}>
              Confirm password
            </label>

            <div className="relative">
              <input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                className={`${inputClass} pr-16`}
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-400 transition hover:text-white"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? "Hide" : "Show"}
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
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            to="/login"
            state={intent}
            className="font-medium text-white underline underline-offset-4 hover:text-zinc-300"
          >
            Sign in
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

export default Signup;