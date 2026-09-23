import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserCircle } from "lucide-react";
import { clearCurrentUserDraft } from "../config/draftStorage";

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
            {/* Fix (i18n / product-claim audit): this called t("pm_internship_scheme"),
                a key that exists in none of the 10 locale files — i18next's
                default behavior for a missing key is to render the raw key
                itself, so this literally printed the text
                "pm_internship_scheme" under the logo. The key name also
                carried over branding from an unrelated real government
                scheme ("PM Internship Scheme") that this project is not
                affiliated with (see the footer fix in Homepage.jsx for the
                same issue). Replaced with a plain, accurate, untranslated
                tagline rather than adding an unverifiable machine
                translation of a made-up phrase across 10 language files. */}
            <p className="text-xs text-gray-500 font-medium">
              Internship matching platform
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
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            aria-label="Open profile"
            title="Open profile"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            <UserCircle size={34} strokeWidth={1.7} />
          </button>

          {/* Logout */}
          <button onClick={() => { clearCurrentUserDraft(); localStorage.removeItem("token"); navigate("/signin"); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition">
            🚪 <span className="hidden sm:inline">{t("log out")}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
