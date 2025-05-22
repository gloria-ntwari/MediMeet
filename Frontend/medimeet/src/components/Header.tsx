import { Link, useLocation } from "react-router-dom";
import logo from "../assets/Group 4134.png";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useState, useEffect } from "react";
import { ChevronDown, User } from "lucide-react";

const navItems = [
  { name: "HOME", href: "/" },
  { name: "ALL DOCTORS", href: "/all-doctors" },
  { name: "ABOUT", href: "/About" },
  { name: "CONTACT", href: "/contact" },
];

export default function Header() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Check if user is logged in by looking for user data in localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setIsLoggedIn(true);
      // Use the name from the user data if available, otherwise use email
      setUserName(user.name || user.email || "User");
      setUserRole(user.role || "");
    } else {
      setIsLoggedIn(false);
      setUserName("");
      setUserRole("");
    }
  }, [location.pathname]); // Re-check when route changes

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPassword');
    localStorage.removeItem('jwt_token');
    setIsLoggedIn(false);
    window.location.href = '/'; // Redirect to home page
  };

  const isPatient = userRole?.toLowerCase() === 'patient';
  const isDoctor = userRole?.toLowerCase() === 'doctor';
  const isAdmin = userRole?.toLowerCase() === 'admin';

  return (
    <header className="py-4">
      <div className="container flex flex-wrap items-center w-full max-w-screen-xl px-4 mx-auto md:px-20">
        <Link to="/" className="flex flex-row flex-shrink-0">
          <img
            className="h-10 w-9"
            alt="Logo"
            src={logo}
          />
          <h1 className="mt-1 ml-1 font-sans text-2xl font-bold text-gray-600 ">MediMeet</h1>
        </Link>

        <div className="items-center justify-center flex-1 hidden md:flex">
          <nav className="flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative font-medium text-gray-800 text-base hover:text-[#5f6fff] transition-colors ${location.pathname === item.href
                  ? "after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-[#5f6fff]"
                  : ""
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Existing account/login buttons */}
        <div className="items-center hidden space-x-4 md:flex">
          {isAdmin ? (
            <Link
              to="/admin/dashboard"
              className="px-6 py-2 bg-white text-gray-800 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors border border-[#E5E5E5]"
            >
              Admin Dashboard
            </Link>
          ) : (
            <Link
              to="/admin-login"
              className="px-6 py-2 bg-white text-gray-800 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors border border-[#E5E5E5]"
            >
              Admin Panel
            </Link>
          )}

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#eaefff] text-[#5f6fff] hover:bg-[#dce4ff] transition-colors">
                  <div className="w-8 h-8 bg-[#5f6fff] text-white rounded-full flex items-center justify-center">
                    <User size={18} />
                  </div>
                  <span className="font-medium">{userName}</span>
                  <ChevronDown size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isPatient && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/patient/profile" className="flex items-center cursor-pointer">
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/patient/appointments" className="flex items-center cursor-pointer">
                        My Appointments
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}

                {isDoctor && (
                  <DropdownMenuItem asChild>
                    <Link to="/doctor/dashboard" className="flex items-center cursor-pointer">
                      Doctor Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard" className="flex items-center cursor-pointer">
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left cursor-pointer"
                  >
                    Logout
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/patient-signup"
              className="bg-[#5f6fff] hover:bg-[#4b57ff] text-white rounded-full px-6 py-2 transition-colors inline-flex items-center"
            >
              Create account
            </Link>
          )}
        </div>
      </div>
      <div className="max-w-screen-xl mx-auto mt-3 border-b border-gray-600" />
    </header>
  );
}
