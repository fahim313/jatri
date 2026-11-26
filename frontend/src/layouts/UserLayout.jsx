import { Outlet } from "react-router-dom";

function UserLayout() {
  return (
    <div>
      <aside>User Sidebar</aside>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default UserLayout;