import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaGlobe,
  FaClipboardList,
  FaFileAlt,
  FaCheckCircle,
  FaCommentDots,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaSignOutAlt,
  FaUserCog,
  FaChartLine,
} from "react-icons/fa";
import { RiVisaLine } from "react-icons/ri";
import { HiOutlineDocumentText } from "react-icons/hi";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);


const theme = {
  primary: "#7B1E1E",
  primaryDark: "#5E1616",
  primaryLight: "#9D2B2B",
  textLight: "#F5F5F5",
  textDark: "#333333",
  background: "#F8F8F8",
  cardBg: "#FFFFFF",
  success: "#28A745",
  warning: "#FFC107",
  danger: "#DC3545",
};

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();


  React.useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/users")) setActiveMenu("users");
    else if (path.startsWith("/countries")) setActiveMenu("countries");
    else if (path.startsWith("/visa-types")) setActiveMenu("visaTypes");
    else if (path.startsWith("/requirements")) setActiveMenu("requirements");
    else if (path.startsWith("/applications")) setActiveMenu("applications");
    else if (path.startsWith("/feedbacks")) setActiveMenu("feedbacks");
    else setActiveMenu(null);
  }, [location]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleLogout = async () => {
    const confirm = await MySwal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to log out of the admin panel?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: theme.danger,
      cancelButtonColor: theme.warning,
      confirmButtonText: "Yes, Log out",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "mr-2",
        cancelButton: "ml-2",
      },
    });

    if (confirm.isConfirmed) {
      localStorage.removeItem("token");
      await MySwal.fire({
        title: "Logged out",
        text: "You have been logged out successfully",
        icon: "success",
        confirmButtonColor: theme.primary,
        customClass: { popup: "rounded-xl" },
      });
      window.location.href = "/login";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
      {/* Sidebar */}
      <aside
        className={`transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-64" : "w-20"
        } flex flex-col bg-gradient-to-b from-[#7B1E1E] to-[#5E1616] text-white shadow-lg`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-2">
              <RiVisaLine className="text-2xl text-white" />
              <h1 className="text-xl font-bold tracking-wider">VISA ADMIN</h1>
            </div>
          ) : (
            <RiVisaLine className="text-2xl mx-auto text-white" />
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <ul className="space-y-1">
            <SidebarItem
              to="/dashboard"
              icon={<FaTachometerAlt />}
              label="Dashboard"
              isActive={location.pathname === "/dashboard"}
              isSidebarOpen={isSidebarOpen}
            />

            <SidebarMenu
              icon={<FaUsers />}
              label="Users"
              isOpen={activeMenu === "users"}
              onToggle={() => toggleMenu("users")}
              isSidebarOpen={isSidebarOpen}
            >
              <SidebarSubItem
                to="/users/all"
                label="All Users"
                icon={<FaUserCog />}
                isActive={location.pathname === "/users/all"}
              />
            </SidebarMenu>

            <SidebarMenu
              icon={<FaGlobe />}
              label="Countries"
              isOpen={activeMenu === "countries"}
              onToggle={() => toggleMenu("countries")}
              isSidebarOpen={isSidebarOpen}
            >
              <SidebarSubItem
                to="/countries/all"
                label="All Countries"
                icon={<FaGlobe />}
                isActive={location.pathname === "/countries/all"}
              />
              <SidebarSubItem
                to="/countries/add"
                label="Add Country"
                icon={<FaGlobe />}
                isActive={location.pathname === "/countries/add"}
              />
            </SidebarMenu>

            <SidebarMenu
              icon={<FaClipboardList />}
              label="Visa Types"
              isOpen={activeMenu === "visaTypes"}
              onToggle={() => toggleMenu("visaTypes")}
              isSidebarOpen={isSidebarOpen}
            >
              <SidebarSubItem
                to="/visa-types/all"
                label="All Types"
                icon={<RiVisaLine />}
                isActive={location.pathname === "/visa-types/all"}
              />
              <SidebarSubItem
                to="/visa-types/add"
                label="Add Type"
                icon={<RiVisaLine />}
                isActive={location.pathname === "/visa-types/add"}
              />
            </SidebarMenu>

            <SidebarMenu
              icon={<FaFileAlt />}
              label="Requirements"
              isOpen={activeMenu === "requirements"}
              onToggle={() => toggleMenu("requirements")}
              isSidebarOpen={isSidebarOpen}
            >
              <SidebarSubItem
                to="/requirements/all"
                label="All Requirements"
                icon={<HiOutlineDocumentText />}
                isActive={location.pathname === "/requirements/all"}
              />
              <SidebarSubItem
                to="/requirements/add"
                label="Add Requirement"
                icon={<HiOutlineDocumentText />}
                isActive={location.pathname === "/requirements/add"}
              />
            </SidebarMenu>

            <SidebarMenu
              icon={<FaCheckCircle />}
              label="Applications"
              isOpen={activeMenu === "applications"}
              onToggle={() => toggleMenu("applications")}
              isSidebarOpen={isSidebarOpen}
            >
              <SidebarSubItem
                to="/applications/all"
                label="All Applications"
                icon={<FaChartLine />}
                isActive={location.pathname === "/applications/all"}
              />
            </SidebarMenu>

            <SidebarMenu
              icon={<FaCommentDots />}
              label="Feedbacks"
              isOpen={activeMenu === "feedbacks"}
              onToggle={() => toggleMenu("feedbacks")}
              isSidebarOpen={isSidebarOpen}
            >
              <SidebarSubItem
                to="/feedbacks"
                label="View Feedbacks"
                icon={<FaCommentDots />}
                isActive={location.pathname === "/feedbacks"}
              />
            </SidebarMenu>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className={`flex items-center justify-center gap-2 w-full px-4 py-2 rounded-md transition-colors bg-[#5E1616] hover:bg-[#4a1212] text-white ${
              !isSidebarOpen ? "justify-center" : ""
            }`}
          >
            <FaSignOutAlt />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            {getPageTitle(location.pathname)}
          </h2>
          <div className="flex items-center space-x-4">
            {/* You can add notifications or user avatar here */}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper components
function SidebarItem({ to, icon, label, isActive, isSidebarOpen }) {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
          isActive
            ? "bg-white/10 text-white font-medium"
            : "hover:bg-white/5 text-white/80 hover:text-white"
        } ${!isSidebarOpen ? "justify-center" : ""}`}
      >
        <span className="text-lg">{icon}</span>
        {isSidebarOpen && <span>{label}</span>}
      </Link>
    </li>
  );
}

function SidebarMenu({
  icon,
  label,
  isOpen,
  onToggle,
  isSidebarOpen,
  children,
}) {
  return (
    <li>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between w-full px-4 py-3 rounded-md transition-colors hover:bg-white/5 text-white/80 hover:text-white ${
          !isSidebarOpen ? "justify-center" : ""
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          {isSidebarOpen && <span>{label}</span>}
        </div>
        {isSidebarOpen && (
          <FaChevronDown
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>
      {isOpen && isSidebarOpen && (
        <ul className="ml-8 mt-1 space-y-1 border-l-2 border-white/10 pl-2">
          {children}
        </ul>
      )}
    </li>
  );
}

function SidebarSubItem({ to, label, icon, isActive }) {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
          isActive
            ? "text-white font-medium"
            : "text-white/70 hover:text-white"
        }`}
      >
        <span className="text-sm">{icon}</span>
        <span>{label}</span>
      </Link>
    </li>
  );
}

// Helper function to get page title
function getPageTitle(pathname) {
  const titles = {
    "/dashboard": "Dashboard",
    "/users/all": "User Management",
    "/countries/all": "Manage Countries",
    "/countries/add": "Add New Country",
    "/visa-types/all": "Visa Types",
    "/visa-types/add": "Add Visa Type",
    "/requirements/all": "Visa Requirements",
    "/requirements/add": "Add New Requirement",
    "/applications/all": "Visa Applications",
    "/feedbacks": "Customer Feedbacks",
  };

  return titles[pathname] || "Dashboard";
}
