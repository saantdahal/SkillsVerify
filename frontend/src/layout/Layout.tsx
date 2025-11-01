import { Outlet } from "react-router-dom";

const Layout = () => {

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <main className="flex-1 p-4 md:p-8 w-full max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
