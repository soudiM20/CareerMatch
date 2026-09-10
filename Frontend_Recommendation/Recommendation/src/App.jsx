import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/Landing/LandingPage";
import AuthPage from "./pages/AuthPage";
import Homepage from "./pages/Homepage";
import ProfileInputForm from "./pages/ProfileInputForm";
import Dashboard from "./pages/Dashboard";
import Form from "./pages/internship_form/Form";
import RecommPage from "./pages/recomm_page";
import DetailPage from "./pages/DetailPage";
import MainLayout from "./MainLayout";
import Profile from "./pages/Profile";
import RecommCheck from "./pages/RecommCheck";

function Protected({ children }) {
  return localStorage.getItem("token") ? <MainLayout>{children}</MainLayout> : <Navigate to="/signin" replace />;
}

export default function App() {
  return <Router><Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/signin" element={<AuthPage />} />
    <Route path="/home" element={<Protected><Homepage /></Protected>} />
    <Route path="/profile" element={<Protected><Profile /></Protected>} />
    <Route path="/profileInput" element={<Protected><ProfileInputForm /></Protected>} />
    <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
    <Route path="/internship-form" element={<Protected><Form /></Protected>} />
    <Route path="/recomm-check" element={<Protected><RecommCheck /></Protected>} />
    <Route path="/recommendations" element={<Protected><RecommPage /></Protected>} />
    <Route path="/details/:id" element={<Protected><DetailPage /></Protected>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></Router>;
}
