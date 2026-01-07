import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const getTitleFromPath = (path) => {
  if (path.startsWith("/trade-entry")) return "Trade Entry";
  if (path.startsWith("/content")) return "Content";
  if (path.startsWith("/user")) return "Trade Log";
  if (path.startsWith("/reflections")) return "Reflections";
  if (path.startsWith("/profile")) return "Profile";
  return "Dashboard"; // Default title
};

const MainLayout = () => {
  const location = useLocation();
  const title = getTitleFromPath(location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    // Main container: horizontal flex layout
    <div className="h-screen flex text-[#121111] overflow-hidden ">
      {/* Sidebar - Full height from top to bottom (Left side - Black area) */}
      <Sidebar
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Right side: Header + Content stacked vertically */}
      <div className="flex-1 flex flex-col overflow-hidden  pb-2">
        {/* Header - Only on right side (Green area) */}
        <Header title={title} onMenuClick={toggleSidebar} />

        {/* Main content - Scrollable area below header */}
        <main className="flex-1 px-6 py-6 md:p-6 lg:px-11 lg:py-6 overflow-y-auto ">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
