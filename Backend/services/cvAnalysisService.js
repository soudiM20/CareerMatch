import fs from "fs/promises";
import axios from "axios";

const FLASK_BASE_URL = process.env.FLASK_API_URL?.replace(/\/recommend_candidate\s*$/, "") || "http://localhost:5001";

export const analyzeCvFile = async (filePath) => {
  try {
    const pdfBuffer = await fs.readFile(filePath);
    const formData = new FormData();
    const blob = new Blob([pdfBuffer], { type: "application/pdf" });
    formData.append("cv", blob, "candidate-cv.pdf");

    const response = await axios.post(`${FLASK_BASE_URL}/analyze_cv`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-ML-Service-Token": process.env.FLASK_SERVICE_TOKEN,
      },
      timeout: 20000,
    });

    return {
      status: response.data?.status || "unknown",
      skills: response.data?.skills || [],
      education: response.data?.education || [],
      experience: response.data?.experience || [],
      projects: response.data?.projects || [],
      certifications: response.data?.certifications || [],
      textLength: response.data?.textLength || 0,
      modelVersion: response.data?.modelVersion || "cv-analysis-v1",
      extractedAt: new Date().toISOString(),
    };
  } catch (error) {
    const detail = error.response?.data?.message || error.message || "CV analysis failed";
    return {
      status: "failed",
      error: detail,
      skills: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      textLength: 0,
      modelVersion: "cv-analysis-v1",
      extractedAt: new Date().toISOString(),
    };
  }
};
