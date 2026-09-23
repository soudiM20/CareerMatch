import { useEffect, useState } from "react";
import axios from "axios";
import { BriefcaseBusiness, Filter, MapPin, SlidersHorizontal } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../config/api";

const chips = (items, className) => items?.length ? <div className="flex flex-wrap gap-2">{items.map(item => <span key={item} className={`rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>{item}</span>)}</div> : null;

export default function RecommendationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState(() => ({ role: searchParams.get("role") || "", location: "", workMode: "", skills: "", minMatchScore: "" }));

  const load = async (event) => {
    event?.preventDefault(); setLoading(true); setError("");
    try {
      const token = localStorage.getItem("token");
      const body = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      // Recommend endpoint is a POST: generating a recommendation records a
      // history entry as a side effect, which isn't idempotent GET behavior.
      const { data } = await axios.post(`${API}/internships/recommend`, body, { headers: { Authorization: `Bearer ${token}` } });
      setItems(data);
    } catch (requestError) {
      if ([401, 403].includes(requestError.response?.status)) {
        localStorage.removeItem("token");
        navigate("/signin", { replace: true });
      } else {
        setError(requestError.response?.data?.message || "Recommendations could not be loaded. Please try again.");
      }
    } finally { setLoading(false); }
  };
  // Deliberately run once on mount only: `load` reads the current `filters`
  // via closure and is also called directly by the form's onSubmit, so
  // including it here would either re-fetch on every filter keystroke or
  // require wrapping it in useCallback purely to satisfy the linter, with no
  // behavior change either way.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  return <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900"><div className="mx-auto max-w-7xl">
    <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div>
      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">CareerMatch intelligence</p>
      <h1 className="text-3xl font-bold text-slate-900">Internships matched to your profile</h1>
      <p className="mt-2 text-slate-600">Scores combine skill coverage, profile relevance, and your saved preferences.</p>
    </div><div className="rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm"><strong className="text-slate-900">{items.length}</strong> ranked opportunities</div></header>
    <form onSubmit={load} className="mb-8 grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-8"><label className="md:col-span-2"><span className="sr-only">Role</span><input value={filters.role} onChange={e => setFilters({...filters, role:e.target.value})} placeholder="Role or sector" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-500" /></label><label className="md:col-span-2"><span className="sr-only">Skills</span><input value={filters.skills} onChange={e => setFilters({...filters, skills:e.target.value})} placeholder="Skills (e.g. Python, SQL)" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-500" /></label><input value={filters.location} onChange={e => setFilters({...filters, location:e.target.value})} placeholder="Location" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-500" /><select value={filters.workMode} onChange={e => setFilters({...filters, workMode:e.target.value})} className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900"><option value="">Any work mode</option><option>Remote</option><option>Hybrid</option><option>On-site</option></select><input value={filters.minMatchScore} onChange={e => setFilters({...filters, minMatchScore:e.target.value})} type="number" min="0" max="100" placeholder="Min. score" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder:text-slate-500" /><button className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"><Filter size={16}/>Filter</button></form>
    {loading && <div className="rounded-2xl bg-white p-12 text-center text-slate-600">Calculating your explainable matches…</div>}
    {error && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">{error}</div>}
    {!loading && !error && !items.length && <div className="rounded-2xl bg-white p-12 text-center"><SlidersHorizontal className="mx-auto mb-3 text-slate-400"/><h2 className="font-semibold">No matching internships found</h2><p className="mt-1 text-sm text-slate-600">Try lowering the minimum score or clearing a filter.</p></div>}
    <section className="grid gap-5 lg:grid-cols-2">{items.map(item => { const rec = item.recommendation || {}; return <article key={item.Internship_ID} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium text-blue-600">{item.Company_Name}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{item.Internship_Title}</h2><p className="mt-2 flex items-center gap-1 text-sm text-slate-600"><MapPin size={15}/>{item.Internship_District}, {item.Internship_State} · {item.Mode}</p></div><div className="rounded-xl bg-blue-50 px-3 py-2 text-center"><strong className="block text-xl text-blue-700">{rec.match_score ?? 0}%</strong><span className="text-xs text-blue-700">match</span></div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{width:`${rec.skill_coverage ?? 0}%`}} /></div><p className="mt-1 text-xs text-slate-500">{rec.skill_coverage ?? 0}% required-skill coverage</p></div><div className="space-y-4 p-5"><p className="text-sm text-slate-700">{rec.recommendation_reason}</p>{typeof rec.cv_similarity === 'number' && rec.cv_similarity > 0 && <p className="text-sm text-slate-700">CV similarity: <strong>{rec.cv_similarity}</strong></p>}<div><p className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700">Matched skills</p>{chips(rec.matched_skills, "bg-emerald-50 text-emerald-800") || <span className="text-sm text-slate-500">No exact matches identified</span>}</div>{rec.partially_matched_skills?.length > 0 && <div><p className="mb-2 text-xs font-bold uppercase tracking-wide text-amber-700">Partially matched</p>{chips(rec.partially_matched_skills, "bg-amber-50 text-amber-800")}</div>}<div><p className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-700">Important skill gaps</p>{chips(rec.missing_skills?.slice(0, 5), "bg-rose-50 text-rose-800") || <span className="text-sm text-slate-500">No skill gaps recorded</span>}</div><button onClick={() => navigate(`/details/${item.Internship_ID}`)} className="inline-flex items-center gap-2 font-semibold text-blue-700 hover:text-blue-900"><BriefcaseBusiness size={17}/>View opportunity</button></div></article>})}</section>
  </div></main>;
}
