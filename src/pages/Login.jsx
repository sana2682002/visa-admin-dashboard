import React, { useState, useEffect } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Theme colors
  const theme = {
    primary: "#7B1E1E",
    primaryLight: "#9D2B2B",
    primaryDark: "#5E1616",
    textLight: "#F5F5F5",
    accent: "#E8C547",
  };

  useEffect(() => {
    axios.defaults.baseURL = "http://localhost:8000";
    axios.defaults.withCredentials = true;
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await axios.post("/api/admin/login", {
        email,
        password,
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      await Swal.fire({
        title: "Welcome Back!",
        text: "You've successfully logged in to the admin panel.",
        icon: "success",
        confirmButtonColor: theme.primary,
        backdrop: `
          rgba(123, 30, 30, 0.4)
          url("/images/nyan-cat.gif")
          center top
          no-repeat
        `,
        showConfirmButton: false,
        timer: 2000
      });

      navigate("/dashboard");
    } catch (error) {
      await Swal.fire({
        title: "Access Denied",
        text: error.response?.data?.message || "Invalid credentials. Please try again.",
        icon: "error",
        confirmButtonColor: theme.primary,
        customClass: {
          popup: 'border-2 border-red-500 rounded-xl'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="flex items-center justify-center min-h-screen w-full bg-cover bg-center"
      style={{
        backgroundImage: `url("/images/visa-bg.jpg")`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Main Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 bg-white p-8 rounded-3xl shadow-xl w-full max-w-md mx-4 bg-opacity-90"
        style={{
          boxShadow: `0 20px 40px -10px ${theme.primary}40`,
          border: `1px solid ${theme.primary}20`
        }}
      >
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7B1E1E] to-[#5E1616] flex items-center justify-center shadow-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Visa<span className="text-[#7B1E1E]">Admin</span></h1>
          <p className="text-sm text-gray-500 mt-2">Secure access to the management panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                placeholder="admin@example.com"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E1E] focus:border-[#7B1E1E] transition-all duration-200"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="••••••••"
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7B1E1E] focus:border-[#7B1E1E] transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-[#7B1E1E]" />
                ) : (
                  <FaEye className="h-5 w-5 text-gray-400 hover:text-[#7B1E1E]" />
                )}
              </button>
            </div>
            <div className="flex justify-end">
              <a href="#" className="text-xs text-[#7B1E1E] hover:underline">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className={`w-full py-3 px-4 rounded-xl font-medium text-white shadow-lg transition-all duration-300 flex items-center justify-center ${
              isLoading ? 'bg-[#5E1616]' : 'bg-[#7B1E1E] hover:bg-[#5E1616]'
            }`}
            whileHover={!isLoading ? { scale: 1.02 } : {}}
            whileTap={!isLoading ? { scale: 0.98 } : {}}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-5 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} VisaAdmin. All rights reserved.
            <br />
            <span className="text-[#7B1E1E] font-medium">v2.1.0</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}