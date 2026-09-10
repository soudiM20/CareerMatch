import React, { useState } from "react";
import { Brain, Languages, Star, X } from "lucide-react";

const skillOptions = [
  "Agriculture Basics",
  "Chemistry",
  "Communication",
  "Data Analysis",
  "Editing",
  "Electrical Maintenance",
  "Excel",
  "Networking",
  "Python",
  "Research Skills",
  "Sales Skills",
  "Writing"
];


const languageOptions = ["English", "Hindi", "Marathi", "Gujarati", "Tamil", "Punjabi"];

const proficiencyLevels = [
  { value: "beginner", label: "Beginner", color: "bg-red-400" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-400" },
  { value: "fluent", label: "Fluent", color: "bg-blue-400" },
  { value: "native", label: "Native", color: "bg-green-400" }
];

const SkillsLanguagesStep = ({ skills, languages, onUpdate, onBadgeEarned }) => {
  const [selectedProficiency, setSelectedProficiency] = useState("");

  const toggleSkill = (skill) => {
    let updatedSkills;
    if (skills.includes(skill)) {
      updatedSkills = skills.filter((s) => s !== skill);
    } else {
      updatedSkills = [...skills, skill];
      if (updatedSkills.length === 1) onBadgeEarned("first-skill-added");
      if (updatedSkills.length >= 5) onBadgeEarned("skill-master");
    }
    onUpdate({ skills: updatedSkills });
  };

  const addLanguage = (lang) => {
    if (!selectedProficiency) return alert("Select proficiency first!");
    const exists = languages.some((l) => l.name === lang);
    if (!exists) {
      const updatedLanguages = [...languages, { name: lang, proficiency: selectedProficiency }];
      onUpdate({ languages: updatedLanguages });
      if (updatedLanguages.length === 1) onBadgeEarned("first-language-added");
      if (updatedLanguages.length >= 3) onBadgeEarned("polyglot");
    }
  };

  const removeLanguage = (index) => {
    onUpdate({ languages: languages.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <Brain className="mx-auto text-blue-500 mb-2" size={48} />
        <p className="text-gray-600">Select your skills and languages</p>
      </div>

      {/* Skills Section */}
      <div className="bg-blue-50 border border-blue-500 rounded-xl p-6">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Brain size={24} /> Skills
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {skillOptions.map((skill) => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`px-4 py-2 rounded-xl border transition-all flex items-center justify-center gap-1 ${
                skills.includes(skill)
                  ? "bg-indigo-500 text-white border-indigo-600"
                  : "bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              {skill}
              {skills.includes(skill) && <Star size={14} className="text-yellow-400" />}
            </button>
          ))}
        </div>

        {skills.length > 0 && (
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-700 mb-2">Added Skills:</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                >
                  <span>{skill}</span>
                  <button onClick={() => toggleSkill(skill)}>
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Languages Section */}
      <div className="bg-blue-50 border border-blue-500 rounded-xl p-6">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Languages size={24} /> Languages
        </h3>

        <div className="mb-4">
          <p className="text-lg text-gray-600 mb-2">Select language and proficiency:</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {languageOptions.map((lang) => (
              <button
                key={lang}
                onClick={() => addLanguage(lang)}
                className="px-4 py-2 rounded-xl border bg-white text-blue-700 border-blue-300 hover:bg-blue-50 transition-all"
              >
                {lang}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {proficiencyLevels.map((level) => (
              <button
                key={level.value}
                onClick={() => setSelectedProficiency(level.value)}
                className={`px-4 py-2 rounded-xl border transition-all flex-1 text-center ${
                  selectedProficiency === level.value
                    ? `${level.color} text-white border-transparent`
                    : "bg-white text-blue-700 border-blue-300 hover:bg-blue-50"
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Added Languages */}
        {languages.length > 0 && (
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-700 mb-2">Added Languages:</p>
            <div className="space-y-2">
              {languages.map((lang, i) => {
                const profLevel = proficiencyLevels.find((p) => p.value === lang.proficiency);
                return (
                  <div
                    key={i}
                    className="bg-white border border-green-200 rounded-xl p-3 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium text-green-800">{lang.name}</span>
                      <span className="text-sm text-gray-600 px-2 py-1 rounded-full border border-gray-300">
                        {profLevel?.label}
                      </span>
                    </div>
                    <button
                      onClick={() => removeLanguage(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">💡 Tips</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Click on skills to add/remove them.</li>
          <li>• Select proficiency then choose language.</li>
          <li>• Include both technical and soft skills.</li>
          <li>• Add skills relevant to your target internship.</li>
        </ul>
      </div>
    </div>
  );
};

export default SkillsLanguagesStep;
