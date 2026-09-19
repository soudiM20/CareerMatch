import React, { useState} from 'react';
import { User, Calendar, Phone, MapPin, Save, Check } from 'lucide-react';
import axios from 'axios';
import { useTranslation } from "react-i18next";
import API from "../config/api";

const normalizeDateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  return date.toISOString().slice(0, 10);
};

const ProfileInputForm = ({ initialData }) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    // HTML date inputs require YYYY-MM-DD; the API serializes Mongo dates as
    // ISO timestamps, which otherwise appear blank when an existing profile
    // is reopened for editing.
    dateOfBirth: normalizeDateInput(initialData?.dateOfBirth),
    gender: initialData?.gender || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    country: initialData?.country || "",
    pincode: initialData?.pincode || "",
  });



  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!profile.firstName.trim()) newErrors.firstName = true;
      if (!profile.lastName.trim()) newErrors.lastName = true;
      if (!profile.dateOfBirth) newErrors.dateOfBirth = true;
      if (!profile.gender) newErrors.gender = true;
    } else if (step === 2) {
      if (!profile.phone.trim()) newErrors.phone = true;
      if (!profile.address.trim()) newErrors.address = true;
      if (!profile.city.trim()) newErrors.city = true;
      if (!profile.state.trim()) newErrors.state = true;
      if (!profile.country.trim()) newErrors.country = true;
      if (!profile.pincode.trim()) newErrors.pincode = true;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    }
  };

  const handleSave = async () => {
    if (!validateStep(2)) return;
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User is not logged in");

    try {
      setLoading(true);
      const res = await axios.put(
        `${API}/users/profile/personal`,
        profile,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const savedProfile = res.data.profile || {};
      setProfile({
        ...savedProfile,
        dateOfBirth: normalizeDateInput(savedProfile.dateOfBirth) || profile.dateOfBirth,
      });
      alert("Profile saved successfully ✅");
      
    } catch (err) {
      console.error("Error saving profile:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to save profile ❌");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  currentStep >= 1
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > 1 ? <Check size={16} /> : '1'}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {t("Personal Details")}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                  currentStep >= 2
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                2
              </div>
              <span className="text-sm font-medium text-gray-700">
                {t("Contact Details")}
              </span>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-blue-500 h-2 rounded-full transition-all duration-500 ${
                currentStep === 1 ? 'w-1/2' : 'w-full'
              }`}
            ></div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {t("Personal Information")}
                </h2>
                <p className="text-gray-600 mt-2">Tell us about yourself</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => updateProfile('firstName', e.target.value)}
                    className={`peer w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-black ${
                      errors.firstName
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 transition-all">
                    First Name
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => updateProfile('lastName', e.target.value)}
                    className={`peer w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-black ${
                      errors.lastName
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 transition-all">
                    Last Name
                  </label>
                </div>
              </div>

              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) =>
                    updateProfile('dateOfBirth', e.target.value)
                  }
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-black ${
                    errors.dateOfBirth
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                <label className="absolute left-12 -top-2.5 bg-white px-1 text-sm font-medium text-blue-600">
                  Date of Birth
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Gender
                </label>
                <div className="flex space-x-4">
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <label key={gender} className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        value={gender}
                        checked={profile.gender === gender}
                        onChange={(e) =>
                          updateProfile('gender', e.target.value)
                        }
                        className="sr-only"
                      />
                      <div
                        className={`flex items-center justify-center p-4 rounded-xl border-2 transition-all text-black ${
                          profile.gender === gender
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        } ${
                          errors.gender && !profile.gender
                            ? 'border-red-300'
                            : ''
                        }`}
                      >
                        <span className="text-2xl mr-2">
                          {gender === 'Male'
                            ? '👨'
                            : gender === 'Female'
                            ? '👩'
                            : '👤'}
                        </span>
                        <span className="font-medium">{gender}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <span>{t("Next Step")}</span>
                <Check className="w-5 h-5" />
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {t("Contact Information")}
                </h2>
                <p className="text-gray-600 mt-2">How can we reach you?</p>
              </div>

              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateProfile('phone', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-black ${
                    errors.phone
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder=" "
                />
                <label className="absolute left-12 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600">
                  Phone Number
                </label>
              </div>

              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <textarea
                  value={profile.address}
                  onChange={(e) => updateProfile('address', e.target.value)}
                  rows={3}
                  className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none text-black ${
                    errors.address
                      ? 'border-red-300 focus:border-red-500'
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                  placeholder=" "
                />
                <label className="absolute left-12 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600">
                  Address
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    type="text"
                    value={profile.city}
                    onChange={(e) => updateProfile('city', e.target.value)}
                    className={`peer w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-black  ${
                      errors.city
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600">
                    City
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={profile.state}
                    onChange={(e) => updateProfile('state', e.target.value)}
                    className={`peer w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-black ${
                      errors.state
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600">
                    State
                  </label>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="relative">
                  <input
                    type="text"
                    value={profile.country}
                    onChange={(e) => updateProfile('country', e.target.value)}
                    className={`peer w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-black ${
                      errors.country
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600">
                    Country
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={profile.pincode}
                    onChange={(e) => updateProfile('pincode', e.target.value)}
                    className={`peer w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors text-black ${
                      errors.pincode
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder=" "
                  />
                  <label className="absolute left-4 -top-2.5 bg-white px-1 text-sm font-medium text-gray-600">
                    Pincode
                  </label>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-4 rounded-xl transition-colors"
                >
                  {t("Previous")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? "Saving..." : "Save Profile"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileInputForm;
