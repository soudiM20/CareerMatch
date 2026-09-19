import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API from "../config/api";
import ProfileInputForm from "./ProfileInputForm";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/signin"); // redirect if not logged in
          return;
        }

        const res = await axios.get(`${API}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(res.data);

        // This route is both first-time onboarding and the explicit personal
        // details editor. Never redirect a completed user away from it.
        setLoading(false);
      } catch (err) {
        if ([401, 403].includes(err.response?.status)) navigate("/signin");
        else { setError(err.response?.data?.message || "Unable to load your profile. Please try again."); setLoading(false); }
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-700">{error}</div>;

  return <ProfileInputForm initialData={profile} />;
};

export default Profile;
