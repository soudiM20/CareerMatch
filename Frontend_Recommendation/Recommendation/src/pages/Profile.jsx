import React, { useCallback, useEffect, useState } from "react";
import { BriefcaseBusiness, Edit3, FileText, GraduationCap, Languages, MapPin, Save, User, X } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../config/api";
import EducationStep from "./internship_form/EducationStep";
import SkillsLanguagesStep from "./internship_form/SkillsLanguagesStep";
import PreferenceStep from "./internship_form/PreferenceStep";
import CVUploadStep from "./internship_form/CVUploadStep";

const emptyEducation = [{ degree: "", institution: "", fieldOfStudy: "", startDate: "", endDate: "", grade: "" }];
const normalizeDate = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? "" : date.toISOString().slice(0, 10);
};
const editDataFrom = (profile) => ({
  firstName: profile?.firstName || "", lastName: profile?.lastName || "", dateOfBirth: normalizeDate(profile?.dateOfBirth),
  gender: profile?.gender || "", phone: profile?.phone || "", address: profile?.address || "", city: profile?.city || "",
  state: profile?.state || "", country: profile?.country || "", pincode: profile?.pincode || "",
  education: profile?.education?.length
    ? profile.education.map((education) => ({
      ...education,
      startDate: normalizeDate(education.startDate),
      endDate: normalizeDate(education.endDate),
    }))
    : emptyEducation,
  skills: profile?.skills || [], languages: profile?.languages || [],
  sectorOfInterest: profile?.sectorOfInterest || [], experience: profile?.experience || "",
  preferences: { duration: profile?.preferences?.duration || "", mode: profile?.preferences?.mode || "", location: profile?.preferences?.locationPref || "" },
  cv: null, cvName: profile?.cv?.originalName || null,
});
const displayDate = (value) => value ? new Date(value).toLocaleDateString() : "Not provided";
const Value = ({ children }) => <p className="text-gray-700 break-words">{children || "Not provided"}</p>;
const Section = ({ icon, title, children }) => <section className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6"><div className="flex items-center gap-3 mb-5"><div className="p-2 rounded-xl bg-blue-50 text-blue-600">{React.createElement(icon, { size: 22 })}</div><h2 className="text-xl font-semibold text-gray-800">{title}</h2></div>{children}</section>;
const Field = ({ label, value, onChange, type = "text" }) => <label className="block"><span className="block text-sm font-medium text-gray-600 mb-1">{label} *</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} required className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100" /></label>;

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/signin"); return; }
    const response = await axios.get(`${API}/users/profile`, { headers: { Authorization: `Bearer ${token}` } });
    setProfile(response.data);
    setEditData(editDataFrom(response.data));
  }, [navigate]);

  useEffect(() => {
    loadProfile().catch((err) => {
      if ([401, 403].includes(err.response?.status)) navigate("/signin");
      else setError(err.response?.data?.message || "Unable to load your profile. Please try again.");
    }).finally(() => setLoading(false));
  }, [loadProfile, navigate]);

  const updateEditData = (changes) => setEditData((current) => ({ ...current, ...changes }));
  const saveProfile = async () => {
    const token = localStorage.getItem("token");
    setSaving(true); setError("");
    try {
      await axios.put(`${API}/users/profile/personal`, {
        firstName: editData.firstName, lastName: editData.lastName, dateOfBirth: editData.dateOfBirth, gender: editData.gender,
        phone: editData.phone, address: editData.address, city: editData.city, state: editData.state, country: editData.country, pincode: editData.pincode,
      }, { headers: { Authorization: `Bearer ${token}` } });
      const payload = new FormData();
      payload.append("education", JSON.stringify(editData.education));
      payload.append("skills", JSON.stringify(editData.skills));
      payload.append("languages", JSON.stringify(editData.languages));
      payload.append("sectorOfInterest", JSON.stringify(editData.sectorOfInterest));
      payload.append("experience", editData.experience || "");
      payload.append("preferences", JSON.stringify({ duration: editData.preferences.duration, mode: editData.preferences.mode, locationPref: editData.preferences.location }));
      if (editData.cv) payload.append("cv", editData.cv);
      await axios.put(`${API}/users/profile/other`, payload, { headers: { Authorization: `Bearer ${token}` } });
      await loadProfile();
      setIsEditing(false);
      navigate("/recommendations", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save your profile. Please try again.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="p-12 text-center text-gray-600">Loading your profile...</div>;
  if (error && !profile) return <div className="p-8 text-center text-red-700">{error}</div>;
  if (!profile || !editData) return null;

  if (isEditing) {
    return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8"><div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8"><div><h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1><p className="text-gray-600 mt-1">Update the information used for recommendations.</p></div><button type="button" onClick={() => { setEditData(editDataFrom(profile)); setIsEditing(false); }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-gray-700 shadow-sm"><X size={18} /> Cancel</button></div>
      {error && <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3 text-red-700">{error}</div>}
      <div className="space-y-6">
        <Section icon={User} title="Personal and Contact Details"><div className="grid md:grid-cols-2 gap-4"><Field label="First Name" value={editData.firstName} onChange={(value) => updateEditData({ firstName: value })} /><Field label="Last Name" value={editData.lastName} onChange={(value) => updateEditData({ lastName: value })} /><Field label="Date of Birth" type="date" value={editData.dateOfBirth} onChange={(value) => updateEditData({ dateOfBirth: value })} /><Field label="Phone Number" value={editData.phone} onChange={(value) => updateEditData({ phone: value })} /><Field label="Address" value={editData.address} onChange={(value) => updateEditData({ address: value })} /><Field label="City" value={editData.city} onChange={(value) => updateEditData({ city: value })} /><Field label="State" value={editData.state} onChange={(value) => updateEditData({ state: value })} /><Field label="Country" value={editData.country} onChange={(value) => updateEditData({ country: value })} /><Field label="Pincode" value={editData.pincode} onChange={(value) => updateEditData({ pincode: value })} /></div><div className="mt-4"><span className="block text-sm font-medium text-gray-600 mb-2">Gender *</span><div className="flex gap-4">{["Male", "Female", "Other"].map((gender) => <label key={gender} className="flex items-center gap-2 text-gray-700"><input type="radio" name="gender" value={gender} checked={editData.gender === gender} onChange={(event) => updateEditData({ gender: event.target.value })} />{gender}</label>)}</div></div></Section>
        <Section icon={GraduationCap} title="Education"><EducationStep data={editData.education} onUpdate={(education) => updateEditData({ education })} onBadgeEarned={() => {}} /></Section>
        <Section icon={Languages} title="Skills and Languages"><SkillsLanguagesStep skills={editData.skills} languages={editData.languages} onUpdate={updateEditData} onBadgeEarned={() => {}} /></Section>
        <Section icon={BriefcaseBusiness} title="Experience and Preferences"><label className="block mb-6"><span className="block text-sm font-medium text-gray-600 mb-1">Experience</span><textarea value={editData.experience} onChange={(event) => updateEditData({ experience: event.target.value })} rows={4} className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none" /></label><PreferenceStep sectorOfInterest={editData.sectorOfInterest} experience={editData.experience} preferences={editData.preferences} onUpdate={updateEditData} onBadgeEarned={() => {}} /></Section>
        <Section icon={FileText} title="CV / Resume"><CVUploadStep cv={editData.cv} cvName={editData.cvName} onUpdate={updateEditData} onBadgeEarned={() => {}} /></Section>
      </div>
      <button type="button" onClick={saveProfile} disabled={saving} className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"><Save size={18} />{saving ? "Saving..." : "Save Profile"}</button>
    </div></div>;
  }

  const preferences = profile.preferences || {};
  const cv = profile.cv || {};
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8"><div className="max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8"><div><p className="text-blue-600 font-semibold">CareerMatch profile</p><h1 className="text-3xl font-bold text-gray-800">{profile.firstName} {profile.lastName}</h1><p className="text-gray-600 mt-1">Your complete recommendation profile</p></div><button type="button" onClick={() => { setError(""); setIsEditing(true); }} className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"><Edit3 size={18} /> Edit Profile</button></div>
      {error && <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3 text-red-700">{error}</div>}
      <div className="grid gap-6 md:grid-cols-2">
        <Section icon={User} title="Personal Details"><div className="grid gap-4 sm:grid-cols-2"><div><span className="text-sm text-gray-500">Date of Birth</span><Value>{displayDate(profile.dateOfBirth)}</Value></div><div><span className="text-sm text-gray-500">Gender</span><Value>{profile.gender}</Value></div></div></Section>
        <Section icon={MapPin} title="Contact Details"><div className="grid gap-4 sm:grid-cols-2"><div><span className="text-sm text-gray-500">Phone</span><Value>{profile.phone}</Value></div><div><span className="text-sm text-gray-500">Location</span><Value>{[profile.city, profile.state, profile.country, profile.pincode].filter(Boolean).join(", ")}</Value></div><div className="sm:col-span-2"><span className="text-sm text-gray-500">Address</span><Value>{profile.address}</Value></div></div></Section>
        <Section icon={GraduationCap} title="Education"><div className="space-y-4">{(profile.education || []).map((education, index) => <div key={`${education.institution}-${index}`} className="border-b last:border-0 pb-3 last:pb-0"><p className="font-semibold text-gray-800">{education.degree}</p><Value>{education.institution} · {education.fieldOfStudy}</Value><p className="text-sm text-gray-500">{displayDate(education.startDate)} to {displayDate(education.endDate)} · {education.grade}</p></div>)}</div></Section>
        <Section icon={Languages} title="Skills and Languages"><div className="mb-5"><span className="text-sm text-gray-500">Skills</span><div className="flex flex-wrap gap-2 mt-2">{(profile.skills || []).map((skill) => <span key={skill} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700">{skill}</span>)}</div></div><span className="text-sm text-gray-500">Languages</span><div className="space-y-2 mt-2">{(profile.languages || []).map((language) => <div key={language.name} className="flex justify-between text-gray-700"><span>{language.name}</span><span className="text-sm text-gray-500 capitalize">{language.proficiency}</span></div>)}</div></Section>
        <Section icon={BriefcaseBusiness} title="Experience and Preferences"><div className="mb-4"><span className="text-sm text-gray-500">Experience</span><Value>{profile.experience}</Value></div><div className="grid gap-3 sm:grid-cols-2"><div><span className="text-sm text-gray-500">Sectors</span><Value>{(profile.sectorOfInterest || []).join(", ")}</Value></div><div><span className="text-sm text-gray-500">Duration</span><Value>{preferences.duration}</Value></div><div><span className="text-sm text-gray-500">Work Mode</span><Value>{preferences.mode}</Value></div><div><span className="text-sm text-gray-500">Preferred Location</span><Value>{preferences.locationPref}</Value></div></div></Section>
        <Section icon={FileText} title="CV / Resume"><Value>{cv.originalName || cv.filename}</Value>{cv.uploadedAt && <p className="text-sm text-gray-500 mt-2">Uploaded {displayDate(cv.uploadedAt)}</p>}{profile.cvAnalysis && <div className="mt-4 border-t pt-4"><p className="text-sm font-medium text-gray-600 mb-2">CV analysis</p><Value>{profile.cvAnalysis.experience}</Value></div>}</Section>
      </div>
    </div></div>
  );
};

export default Profile;
