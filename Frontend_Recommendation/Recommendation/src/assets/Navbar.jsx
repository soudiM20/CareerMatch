import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Navbar = () => {
  const { t, i18n } = useTranslation(); // hook for translations
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const navigate = useNavigate();

  const languages = [
    { code: "en", name: "English", flag: "🇮🇳" },
    { code: "hi", name: "हिंदी", flag: "🇮🇳" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" },
    { code: "bn", name: "বাংলা", flag: "🇮🇳" },
    { code: "mr", name: "मराठी", flag: "🇮🇳" },
    { code: "gu", name: "ગુજરાતી", flag: "🇮🇳" },
    { code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "ml", name: "മലയാളം", flag: "🇮🇳" },
    { code: "pa", name: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  ];

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.name);
    i18n.changeLanguage(language.code); // changes site language
    setIsLanguageOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg shadow-md border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 flex items-center justify-center shadow-md">
            <span className="text-white font-bold">IM</span>
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              CareerMatch
            </h1>
            <p className="text-xs text-gray-500 font-medium">
              {t("pm_internship_scheme")}
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex gap-8 bg-gray-100 rounded-2xl px-4 py-2">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl font-semibold transition ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-white"
              }`
            }
          >
            {t("Home")}
          </NavLink>
          <NavLink
            to="/recomm-check"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl font-semibold transition ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-white"
              }`
            }
          >
            {t("Get Recommendations")}
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl font-semibold transition ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-white"
              }`
            }
          >
            Dashboard
          </NavLink>
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-4">
          {/* Language dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              🌐 <span className="hidden sm:inline">{selectedLanguage}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  isLanguageOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isLanguageOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg z-50">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageSelect(language)}
                    className={`w-full flex items-center px-4 py-2 text-sm rounded-lg hover:bg-gray-50 ${
                      selectedLanguage === language.name
                        ? "bg-blue-50 text-blue-600 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="mr-2">{language.flag}</span>
                    {language.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout */}
          <button onClick={() => { localStorage.removeItem("token"); navigate("/signin"); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition">
            🚪 <span className="hidden sm:inline">{t("log out")}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
