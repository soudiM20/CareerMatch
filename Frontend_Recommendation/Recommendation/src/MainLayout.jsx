import React from "react";
import Navbar from "./assets/Navbar"; // adjust path

const MainLayout = ({ children }) => {
  return (
    <div>
      <Navbar />   {/* ✅ Always visible on "logged in" pages */}
      <main>{children}</main>
    </div>
  );
};

export default MainLayout;
