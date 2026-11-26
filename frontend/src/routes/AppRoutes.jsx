import { Routes, Route } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/public/Home";
import Jobs from "../pages/public/Jobs";
import JobDetails from "../pages/public/JobDetails";
import MigrationGuides from "../pages/public/MigrationGuides";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import UserDashboard from "../pages/user/Dashboard";
import AdminDashboard from "../pages/admin/Dashboard";

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="/guides" element={<MigrationGuides />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={<UserLayout />}>
        <Route path="/user/dashboard" element={<UserDashboard />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;