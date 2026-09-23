import React from "react";
import { ArrowLeft, BookOpen, CircleHelp, FileText, Mail, Sparkles } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const pageContent = {
  guidance: {
    icon: BookOpen,
    title: "Career Guidance",
    intro: "Use your profile and recommendation explanations to make a practical internship plan.",
    sections: [
      ["Start with your profile", "Keep your education, skills, languages, experience, preferences, and CV current so every recommendation reflects your latest goals."],
      ["Read the match details", "Compare matched skills, skill gaps, CV similarity, work mode, location, and duration before choosing an opportunity."],
      ["Close the skill gaps", "Use the missing-skills list on each recommendation to decide what to practise or add to your portfolio."],
    ],
  },
  stories: {
    icon: Sparkles,
    title: "Success Stories",
    intro: "CareerMatch does not claim hiring outcomes or publish fictional testimonials. It gives you evidence you can use while making your own decision.",
    sections: [
      ["Transparent matching", "Each recommendation shows the skills that matched, the gaps that remain, and the score behind the ranking."],
      ["Profile-led discovery", "Your skills, education, sectors, preferences, and CV analysis are combined with the internship catalog to create a fresh match set."],
      ["Your progress is yours", "Update your profile as you learn, then revisit recommendations to see how the results change."],
    ],
  },
  help: {
    icon: CircleHelp,
    title: "Help Center",
    intro: "Quick answers for the main CareerMatch workflows.",
    sections: [
      ["How do I update my profile?", "Open the profile icon in the header, choose Edit Profile, update any section, and save. Recommendations refresh after a successful save."],
      ["How do filters work?", "Role, skills, location, work mode, and minimum score are hard filters. Multiple skills require an internship to contain every requested skill."],
      ["Why is my CV not selectable after refresh?", "For security and browser limitations, a local File object cannot be restored after refresh. Your stored CV filename remains visible; choose a new PDF only when replacing it."],
    ],
  },
  contact: {
    icon: Mail,
    title: "Contact Us",
    intro: "CareerMatch is a student/demo project. Use your project maintainer or repository issue tracker for support, bug reports, and feedback.",
    sections: [
      ["Report a problem", "Include the page, the steps that caused the issue, and any visible error message. Avoid sharing passwords, tokens, or private CV content."],
      ["Suggest an improvement", "Describe the user workflow you want to improve and what outcome you expected. Concrete examples make feedback easier to act on."],
      ["Privacy reminder", "Do not send personal credentials or sensitive documents in an issue or support message."],
    ],
  },
  terms: {
    icon: FileText,
    title: "Terms of Service",
    intro: "CareerMatch is provided as an educational student/demo application.",
    sections: [
      ["Use of the service", "Use the application for internship exploration and profile-based matching. Do not submit unlawful, abusive, or malicious content."],
      ["No employment guarantee", "Recommendations are informational matches, not job offers, endorsements, or guarantees of selection."],
      ["Your responsibility", "Review each internship listing and its requirements independently before applying or sharing information."],
    ],
  },
};

export default function InfoPage() {
  const navigate = useNavigate();
  const { page } = useParams();
  const content = pageContent[page] || pageContent.help;
  const Icon = content.icon;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <button type="button" onClick={() => navigate(-1)} className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900">
          <ArrowLeft size={17} /> Back
        </button>
        <section className="rounded-2xl bg-white p-6 shadow-sm md:p-10">
          <Icon className="mb-4 text-blue-600" size={30} />
          <h1 className="text-3xl font-bold text-slate-900">{content.title}</h1>
          <p className="mt-3 text-lg text-slate-600">{content.intro}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.sections.map(([heading, text]) => (
              <article key={heading} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <h2 className="font-semibold text-slate-900">{heading}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
