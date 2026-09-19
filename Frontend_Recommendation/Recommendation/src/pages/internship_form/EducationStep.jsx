import React from 'react';
import { GraduationCap, Plus, Trash2, Award } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
const EducationStep = ({ data, onUpdate, onBadgeEarned }) => {
  const currentYear = new Date().getFullYear();

  const degreeTypes = [
    'High School Diploma',
    'Associate Degree',
    "Bachelor's Degree",
    "Master's Degree",
    'PhD',
    'Professional Certification',
    'Other'
  ];

  const gradeOptions = [
    'A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F',
    '4.0 GPA', '3.5 GPA', 'First Class', 'Distinction', 'Pass'
  ];

  const degreeColors = {
  "High School Diploma": "bg-blue-500 hover:bg-blue-600 text-blue-800 text-white",
  "Associate Degree": "bg-blue-500 hover:bg-blue-600 text-blue-800 text-white",
  "Bachelor's Degree": "bg-blue-500 hover:bg-blue-600 text-blue-900 text-white",
  "Master's Degree": "bg-blue-500 hover:bg-blue-600 text-white",
  "PhD": "bg-blue-500 hover:bg-blue-600 text-white",
  "Professional Certification": "bg-blue-500 hover:bg-blue-600 text-white",
  "Other": "bg-blue-500 hover:bg-blue-600 text-white"
};

  const addEducation = () => {
    const newEducation = {
      degree: '',
      institution: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      grade: ''
    };
    onUpdate([...data, newEducation]);
    onBadgeEarned(`education-${data.length + 1}-added`);
  };

  const removeEducation = (index) => {
    if (data.length > 1) {
      onUpdate(data.filter((_, i) => i !== index));
    }
  };

  const updateEducation = (index, field, value) => {
    const updatedData = data.map((edu, i) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    onUpdate(updatedData);

    if (index === 0 && field === 'degree' && value) {
      onBadgeEarned('first-degree-entered');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <GraduationCap className="mx-auto text-blue-500 mb-2" size={48} />
        <p className="text-gray-600">Tell us about your educational background</p>
      </div>

      {data.map((education, index) => (
        <div
          key={index}
          className="relative bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 space-y-6"
        >
          {/* Achievement Badge */}
          {education.degree && education.institution && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-2 animate-bounce shadow-lg">
              <Award size={16} />
            </div>
          )}

          {/* Remove Button */}
          {data.length > 1 && (
            <button
              onClick={() => removeEducation(index)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full p-1 transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}

          <h3 className="text-2xl font-semibold text-blue-800">
            Education #{index + 1}
          </h3>

          {/* Degree Type */}
          <div className="space-y-2">
            <label className="block text-xl font-medium text-gray-700">
              Degree Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {degreeTypes.map((degree) => (
                <button
      key={degree}
      onClick={() => updateEducation(index, 'degree', degree)}
      className={`px-4 py-2 rounded-xl border-2 flex items-center justify-center gap-1 transition-all
        ${education.degree === degree
          ? `${degreeColors[degree] || 'bg-white'} border-black shadow-lg scale-105` 
          : `${degreeColors[degree] || 'bg-white'} border-gray-300 text-gray-700`}
        hover:scale-105 text-lg font-medium`}
    >
      <span>{degree}</span>
      {education.degree === degree && <CheckCircle size={16} className="text-black-500" />}
    </button>
              ))}
            </div>
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <label className="block text-xl font-medium text-gray-700">
              Institution <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={education.institution}
              onChange={(e) => updateEducation(index, 'institution', e.target.value)}
              placeholder="University/College name"
              className="w-full px-4 py-3 border border-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black text-lg"
            />
          </div>

          {/* Field of Study */}
          <div className="space-y-2">
            <label className="block text-xl font-medium text-gray-700">
              Field of Study
            </label>
            <input
              type="text"
              value={education.fieldOfStudy}
              onChange={(e) => updateEducation(index, 'fieldOfStudy', e.target.value)}
              placeholder="e.g., Computer Science"
              className="w-full px-4 py-3 border border-black rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black text-lg"
            />
          </div>

          {/* Grade Selection */}
          <div className="space-y-2">
            <label className="block text-xl font-medium text-gray-700">
              Grade/GPA
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {gradeOptions.map((grade) => (
                <button
                  key={grade}
                  onClick={() => updateEducation(index, 'grade', grade)}
                  className={`px-4 py-2 rounded-lg border transition-all text-lg font-medium 
                    ${education.grade === grade
                      ? 'bg-black text-white scale-105 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300'}
                    hover:scale-105`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Start & End Year (side by side only) */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Start Year Slider */}
            <div className="space-y-2">
              <label className="block text-xl font-medium text-gray-700">Start Year</label>
              <input
                type="range"
                min="2010"
                max={currentYear}
                value={education.startDate ? new Date(education.startDate).getFullYear() : 2020}
                onChange={(e) => updateEducation(index, 'startDate', `${e.target.value}-01-01`)}
                className="w-full"
              />
              <span className="text-xl text-gray-600">
                {education.startDate
                  ? new Date(education.startDate).getFullYear()
                  : 'Select Year'}
              </span>
            </div>

            {/* End Year Slider */}
            <div className="space-y-2">
              <label className="block text-xl font-medium text-gray-700">End Year</label>
              <input
                type="range"
                min="2010"
                max={currentYear + 5}
                value={education.endDate ? new Date(education.endDate).getFullYear() : currentYear}
                onChange={(e) => updateEducation(index, 'endDate', `${e.target.value}-01-01`)}
                className="w-full"
              />
              <span className="text-xl text-gray-600">
                {education.endDate
                  ? new Date(education.endDate).getFullYear()
                  : 'Select Year'}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Add Education Button */}
      <button
        onClick={addEducation}
        className="w-full py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group"
      >
        <Plus className="group-hover:scale-110 transition-transform" size={20} />
        Add Another Education
      </button>

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-800 mb-2">📚 Educational Tips</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Click a card instead of dropdowns for faster entry 🎮</li>
          <li>• Use sliders to quickly set your timeline ⏳</li>
          <li>• Complete your first degree to unlock a badge 🏅</li>
        </ul>
      </div>
    </div>
  );
};

export default EducationStep;
