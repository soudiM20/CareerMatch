import React, { useState } from "react";
import { ChevronLeft, User, Lock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";

const AuthPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const url =
      activeTab === "signin"
        ? `${API}/auth/login`
        : `${API}/auth/register`;

    // Optional: validate passwords match on signup
    if (activeTab === "signup" && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Something went wrong");
      return;
    }

    if (activeTab === "signin") {
      // Save token to localStorage
      localStorage.setItem("token", data.token);
      alert("Login successful!");
      navigate("/home"); // Redirect after login
    } else {
      alert("Registration successful! You can now login.");
      setActiveTab("signin"); // Switch to login after signup
      setFormData({ email: "", password: "", confirmPassword: "" });
    }
  } catch (err) {
    console.error(err);
    alert("Server error. Please try again.");
  }
};

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Back to Home */}
        <button
          onClick={() => navigate("/home")}
          className="mb-8 flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
        >
          <ChevronLeft size={20} className="mr-1" />
          Back to Home
        </button>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-gray-200 w-full">
          <div className="text-center mb-8">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
              CareerMatch
            </div>
            <p className="text-gray-500 text-sm sm:text-base">
              Welcome back! Please sign in to your account.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("signin")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "signin"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === "signup"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-blue-500"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-black"
                  required
                />
                <User
                  size={20}
                  className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-black"
                  required
                />
                <Lock
                  size={20}
                  className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up only) */}
            {activeTab === "signup" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-black"
                    required
                  />
                  <Lock
                    size={20}
                    className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Forgot Password (Sign In only) */}
            {activeTab === "signin" && (
              <div className="flex justify-end">
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot Password?
                </a>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium text-sm shadow-md hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              {activeTab === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              {activeTab === "signin"
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                onClick={() =>
                  setActiveTab(activeTab === "signin" ? "signup" : "signin")
                }
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                {activeTab === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
