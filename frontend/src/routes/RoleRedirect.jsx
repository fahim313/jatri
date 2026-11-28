import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RoleRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={
        user?.role === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard"
      }
      replace
    />
  );
}

export default RoleRedirect;