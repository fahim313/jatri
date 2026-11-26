import { Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <>
      <header>
        Public Navbar
      </header>

      <main>
        <Outlet />
      </main>

      <footer>
        Jatri Footer
      </footer>
    </>
  );
}

export default PublicLayout;