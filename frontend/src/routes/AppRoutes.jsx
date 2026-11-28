import { Routes, Route, Navigate } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";

import ProtectedRoute from "./ProtectedRoute";
import RoleRedirect from "./RoleRedirect";

import Home from "../pages/public/Home";
import Jobs from "../pages/public/Jobs";
import JobDetails from "../pages/public/JobDetails";
import MigrationGuides from "../pages/public/MigrationGuides";
import Agencies from "../pages/public/Agencies";
import AgencyDetails from "../pages/public/AgencyDetails";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import UserDashboard from "../pages/user/Dashboard";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminJobs from "../pages/admin/Jobs";
import CreateJob from "../pages/admin/CreateJob";
import EditJob from "../pages/admin/EditJob";
import AdminAgencies from "../pages/admin/Agencies";
import CreateAgency from "../pages/admin/CreateAgency";
import EditAgency from "../pages/admin/EditAgency";
import AdminDocuments from "../pages/admin/Documents";


// import Chat from "../pages/user/Chat";


function Placeholder({ title }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <p className="mt-2 text-sm text-zinc-400">
        This page has not been built yet.
      </p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/guides" element={<MigrationGuides />} />
        <Route path="/agencies" element={<Agencies />} />
        <Route path="/agencies/:id" element={<AgencyDetails />} />
      </Route>

      {/* Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Role-based Dashboard Redirect */}
      <Route path="/dashboard" element={<RoleRedirect />} />

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<AdminDashboard />} />

          {/* Job Management */}
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="jobs/create" element={<CreateJob />} />
          <Route path="jobs/:id/edit" element={<EditJob />} />

          {/* Agency Management */}
          <Route path="agencies" element={<AdminAgencies />} />
          <Route path="agencies/create" element={<CreateAgency />} />
          <Route path="agencies/:id/edit" element={<EditAgency />} />

          {/* Document Management */}
          <Route path="documents" element={<AdminDocuments />} />
        </Route>
      </Route>

      {/* User Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
        </Route>

        {/* Chat */}
        <Route path="/chat" element={<Placeholder title="Jatri AI" />} />
      </Route>

      {/* Not Found */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;