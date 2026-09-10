import React, { useState, useRef } from "react";
import { Upload, CheckCircle, X, Info } from "lucide-react";

const CVUploadStep = ({ cv, onUpdate, onBadgeEarned }) => {
  const [uploadStatus, setUploadStatus] = useState("idle"); // "idle" | "uploading" | "success" | "error"
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef(null);

  const allowedTypes = ["application/pdf"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Only PDF files are allowed." };
    }
    if (file.size > maxSize) {
      return { valid: false, error: "File should be 5MB or smaller." };
    }
    return { valid: true };
  };

  const handleFileSelect = async (file) => {
    const validation = validateFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }
    setUploadStatus("uploading");

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    onUpdate({ cv: file });
    setUploadStatus("success");
    onBadgeEarned("cv-uploaded");
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const removeFile = () => {
    onUpdate({ cv: null });
    setUploadStatus("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-800 mb-2">Upload your CV</p>
        <p className="text-gray-600">We accept PDF files up to 5MB.</p>
      </div>

      {/* Upload Section */}
      {!cv ? (
        <div className="border-2 border-dashed rounded-xl p-6 text-center bg-gray-50">
          {uploadStatus === "uploading" ? (
            <p className="text-blue-600 font-medium">Uploading... ⏳</p>
          ) : (
            <>
              <Upload className="mx-auto text-gray-400 mb-4" size={48} />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg text-lg font-medium hover:bg-blue-600"
              >
                Choose File
              </button>
              <p className="mt-3 text-sm text-gray-500">or drag & drop your file here</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium text-blue-800">{cv.name}</p>
              <p className="text-sm text-blue-600">Uploaded successfully ✅</p>
            </div>
            <button
              onClick={removeFile}
              className="text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="flex items-center gap-2 text-blue-600 font-medium"
        >
          <Info size={16} />
          Need help with your CV?
        </button>
        {showHelp && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700 space-y-2">
            <p>✔ Keep it short (1-2 pages).</p>
            <p>✔ Add your contact, skills, and education.</p>
            <p>✔ Use clear language and check spelling.</p>
            <p>✔ Save as PDF to keep the format safe.</p>
          </div>
        )}
      </div>

      {/* Completion Message */}
      {cv && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-yellow-800 font-medium">🎉 Great! Your CV is ready for submission.</p>
        </div>
      )}
    </div>
  );
};

export default CVUploadStep;
