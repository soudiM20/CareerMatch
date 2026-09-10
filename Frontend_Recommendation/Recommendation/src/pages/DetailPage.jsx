import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Clock, DollarSign, Star, ChevronRight, Mail, Phone } from 'lucide-react';
import API from '../config/api';

const InternshipDetailsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [internshipData, setInternshipData] = useState(null);
  const [allInternships, setAllInternships] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        const response = await axios.get(`${API}/internships/${id}`);
        setInternshipData(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchAllInternships = async () => {
      try {
        const response = await axios.get(`${API}/internships`);
        setAllInternships(response.data.filter(item => item.Internship_ID !== id));
      } catch (err) {
        console.error(err);
      }
    };

    fetchInternship();
    fetchAllInternships();
  }, [id]);

  const getModeColor = (mode) => {
    switch (mode) {
      case 'Remote': return 'bg-blue-100 text-blue-700';
      case 'On-site': return 'bg-green-100 text-green-700';
      case 'Hybrid': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const renderStars = (rating) => (
    [...Array(5)].map((_, i) => (
      <Star key={i} size={16} className={i < Math.floor(rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
    ))
  );

  if (!internshipData) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Normalize Hiring Workflow
  const hiringSteps = Array.isArray(internshipData.Hiring_Workflow)
    ? internshipData.Hiring_Workflow
    : (internshipData.Hiring_Workflow ? internshipData.Hiring_Workflow.split(',') : []);

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-16">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        <img
          src={internshipData.Company_Logo_URL || internshipData.logo}
          alt={internshipData.Company_Name}
          className="w-32 h-32 object-contain rounded-lg border border-gray-200 shadow-sm"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-slate-900">{internshipData.Internship_Title}</h1>
          <p className="text-lg text-slate-600">{internshipData.Company_Name} • {internshipData.Sector}</p>
          <div className={`mt-2 inline-block px-3 py-1 text-sm font-semibold rounded-full ${getModeColor(internshipData.Mode)}`}>
            {internshipData.Mode}
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-700">
            <div className="flex items-center gap-1">
              <MapPin size={16} /> {internshipData.Internship_District}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={16} /> {internshipData.Duration_Months} months
            </div>
            <div className="flex items-center gap-1">
              <DollarSign size={16} /> {internshipData.Stipend_Amount ? `₹${internshipData.Stipend_Amount}` : 'Unpaid'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex space-x-4 border-b border-gray-200">
        {['overview', 'workflow', 'skills', 'contact'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6 bg-white rounded-2xl shadow-md p-6 space-y-6">
        {activeTab === 'overview' && (
          <>
            <h2 className="text-xl font-bold mb-2">Overview</h2>
            <p className="text-gray-700">{internshipData.Company_Description}</p>
          </>
        )}
{activeTab === 'workflow' && (
          <>
            <h2 className="text-xl font-bold mb-2">Hiring Workflow</h2>
            {hiringSteps.length > 0 ? (
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                {hiringSteps.map((step, idx) => (
                  <li key={idx}>{step.trim()}</li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500">No workflow data available.</p>
            )}
          </>
        )}

        {activeTab === 'skills' && (
          <>
            <h2 className="text-xl font-bold mb-2">Required Skills</h2>
            {internshipData.Required_Skills && internshipData.Required_Skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {internshipData.Required_Skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No skills data available.</p>
            )}
          </>
        )}

        {activeTab === 'contact' && (
          <>
            <h2 className="text-xl font-bold mb-2">Contact</h2>
            {internshipData.Requirement_Contact ? (
              <div className="space-y-2 text-gray-700">
                <div className="flex items-center gap-2"><Mail size={16} /> {internshipData.Requirement_Contact.email}</div>
                <div className="flex items-center gap-2"><Phone size={16} /> {internshipData.Requirement_Contact.phone}</div>
              </div>
            ) : (
              <p className="text-gray-500">No contact information provided.</p>
            )}
          </>
        )}
      </div>

      {/* Recommended Internships */}
      {allInternships.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Recommended Internships</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allInternships.slice(0, 3).map((rec) => (
              <div
                key={rec.Internship_ID}
                className="p-4 bg-white rounded-2xl shadow-md hover:shadow-lg cursor-pointer"
                onClick={() => navigate(`/details/${rec.Internship_ID}`)}
              >
                <h3 className="font-semibold text-lg">{rec.Internship_Title}</h3>
                <p className="text-gray-500">{rec.Company_Name}</p>
                <div className={`mt-2 inline-block px-2 py-1 text-xs rounded-full ${getModeColor(rec.Mode)}`}>{rec.Mode}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipDetailsPage;
