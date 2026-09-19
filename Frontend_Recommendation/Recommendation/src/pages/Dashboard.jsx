import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart3, BriefcaseBusiness, CircleUserRound, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../config/api";

// Fix (dashboard completeness audit): the old rule counted any truthy value as
// "complete", so Mongoose's default empty sub-documents (`preferences: {}`,
// `cv: {}`) counted as done even though nothing had actually been filled in.
// Each field now has an explicit rule matching the onboarding form's own
// validation, rather than relying on generic truthiness.
const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
const hasAtLeastOne = (value) => Array.isArray(value) && value.length > 0;

const completenessChecks = {
  firstName: (profile) => isNonEmptyString(profile?.firstName),
  lastName: (profile) => isNonEmptyString(profile?.lastName),
  phone: (profile) => isNonEmptyString(profile?.phone),
  city: (profile) => isNonEmptyString(profile?.city),
  education: (profile) => hasAtLeastOne(profile?.education),
  skills: (profile) => hasAtLeastOne(profile?.skills),
  languages: (profile) => hasAtLeastOne(profile?.languages),
  sectorOfInterest: (profile) => hasAtLeastOne(profile?.sectorOfInterest),
  // preferences is a fixed sub-document ({duration, mode, locationPref}), never
  // an array, so an empty `{}` must not satisfy this — all three sub-fields
  // are required by the onboarding form's own validation.
  preferences: (profile) =>
    isNonEmptyString(profile?.preferences?.duration) &&
    isNonEmptyString(profile?.preferences?.mode) &&
    isNonEmptyString(profile?.preferences?.locationPref),
  // cv is likewise a fixed sub-document; only a real uploaded file (which
  // always has a generated filename) counts.
  cv: (profile) => isNonEmptyString(profile?.cv?.filename),
};

const fields = Object.keys(completenessChecks);

function completeness(profile) {
  return Math.round(
    (fields.filter((key) => completenessChecks[key](profile)).length / fields.length) * 100
  );
}

export default function Dashboard() {
  const navigate = useNavigate(); const [profile, setProfile] = useState(null); const [history, setHistory] = useState([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  useEffect(() => { (async () => { try { const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` }; const [profileResponse, historyResponse] = await Promise.all([axios.get(`${API}/users/profile`, {headers}), axios.get(`${API}/internships/recommend/history`, {headers})]); setProfile(profileResponse.data); setHistory(historyResponse.data); } catch (requestError) { if ([401, 403].includes(requestError.response?.status)) { localStorage.removeItem("token"); navigate("/signin", { replace: true }); } else { setError(requestError.response?.data?.message || "Unable to load your dashboard. Please try again."); } } finally { setLoading(false); } })(); }, [navigate]);
  if (loading) return <div className="p-12 text-center text-slate-600">Loading your CareerMatch dashboard…</div>;
  if (error) return <main className="min-h-screen bg-slate-50 p-12 text-center text-rose-700">{error}</main>;
  const score = completeness(profile); const gapCounts = history.flatMap(entry => entry.missingSkills || []).reduce((counts, skill) => ({ ...counts, [skill]: (counts[skill] || 0) + 1 }), {}); const gaps = Object.entries(gapCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([skill]) => skill);
  const stats = [["Recommendation records", String(history.length), Sparkles], ["Profile strength", `${score}%`, CircleUserRound], ["Recent average match", history.length ? `${Math.round(history.reduce((sum, item) => sum + (item.matchScore || 0), 0) / history.length)}%` : "—", BarChart3]];
  return <main className="min-h-screen bg-slate-50 px-4 py-10"><div className="mx-auto max-w-6xl"><header className="mb-8"><p className="text-sm font-bold uppercase tracking-wider text-blue-600">CareerMatch dashboard</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome back{profile?.firstName ? `, ${profile.firstName}` : ""}</h1><p className="mt-2 text-slate-600">Track profile readiness and understand where to focus your upskilling.</p></header><section className="grid gap-4 md:grid-cols-3">{stats.map((stat) => { const [label, value, Icon] = stat; return <div key={label} className="rounded-2xl bg-white p-5 shadow-sm"><Icon className="mb-4 text-blue-600"/><p className="text-sm text-slate-600">{label}</p><p className="mt-1 text-3xl font-bold text-slate-900">{value}</p></div>; })}</section><section className="mt-6 grid gap-6 lg:grid-cols-5"><div className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-3"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold">Top recommended internships</h2><p className="text-sm text-slate-600">Your most recent recommendation activity</p></div><button onClick={() => navigate("/recommendations")} className="font-semibold text-blue-700">View all</button></div><div className="mt-5 space-y-3">{history.slice(0, 5).map(item => <div key={`${item.internshipId}-${item.generatedAt}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><div><p className="font-semibold text-slate-900">{item.internshipTitle}</p><p className="text-sm text-slate-600">{item.companyName}</p></div><span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">{item.matchScore ?? 0}%</span></div>)}{!history.length && <div className="rounded-xl border border-dashed p-6 text-center text-slate-600">Generate recommendations to see your history here.</div>}</div></div><aside className="rounded-2xl bg-white p-6 shadow-sm lg:col-span-2"><h2 className="text-lg font-bold">Skill gap focus</h2><p className="mt-1 text-sm text-slate-600">Most common gaps across recommendation records.</p><div className="mt-5 flex flex-wrap gap-2">{gaps.length ? gaps.map(skill => <span key={skill} className="rounded-full bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-800">{skill}</span>) : <p className="text-sm text-slate-500">Generate a recommendation to identify skill gaps.</p>}</div><div className="mt-8 flex flex-wrap gap-3"><button onClick={() => navigate("/profile")} className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-700"><CircleUserRound size={17}/>Edit personal details</button><button onClick={() => navigate("/internship-form")} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"><BriefcaseBusiness size={17}/>Edit recommendation profile</button></div></aside></section></div></main>;
}
