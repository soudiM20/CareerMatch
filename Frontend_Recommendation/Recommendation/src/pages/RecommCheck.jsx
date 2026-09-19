import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Form from "./internship_form/Form";
import RecommendationPage from "./recomm_page";
import API from "../config/api";

const RecommCheck = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [formCompleted, setFormCompleted] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
useEffect(() => {
  const checkFormStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }

      const res = await axios.get(`${API}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profile = res.data;
      if (!profile) {
        setFormCompleted(false);
        setIsLoading(false);
        return;
      }

      // ✅ Match backend validation
      const isComplete =
        profile.education?.length > 0 &&
        profile.skills?.length > 0 &&
        profile.languages?.length > 0 && profile.languages.every((language) => language?.name && language?.proficiency) &&
        profile.sectorOfInterest?.length > 0 &&
        profile.preferences?.duration &&
        profile.preferences?.mode &&
        profile.preferences?.locationPref &&
        profile.cv?.filename;

      setFormCompleted(isComplete);
    } catch (err) {
      if ([401, 403].includes(err.response?.status)) navigate("/signin");
      else setError(err.response?.data?.message || "Unable to check profile status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  checkFormStatus();
}, [navigate]);


  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-700">{error}</div>;

  return formCompleted ? <RecommendationPage /> : <Form />;
};

export default RecommCheck;
