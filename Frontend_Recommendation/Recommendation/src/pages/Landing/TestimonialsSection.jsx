import { CheckCircle2, Sparkles } from "lucide-react";

// This product has no feedback collection or verified outcomes. Show product
// capabilities directly instead of fictional reviews or ratings.
export default function TestimonialsSection() {
  return (
    <section className="bg-blue-50 px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <Sparkles className="mx-auto mb-4 text-blue-600" />
        <h2 className="text-3xl font-bold text-slate-900">What CareerMatch shows</h2>
        <p className="mt-3 text-slate-600">A transparent profile-to-listing comparison, not hiring outcomes or student reviews.</p>
        <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
          {["Required skills that match your profile", "Missing skills for each listed opportunity", "How saved preferences affect ranking"].map((item) => (
            <div key={item} className="rounded-xl bg-white p-5 shadow-sm"><CheckCircle2 className="mb-3 text-emerald-600" size={20}/><p className="font-medium text-slate-800">{item}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}
