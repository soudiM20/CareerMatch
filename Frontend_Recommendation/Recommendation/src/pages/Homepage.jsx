import React, { useState, useEffect } from 'react';
import { Search, MapPin, BookOpen, Users, Award, ChevronLeft, ChevronRight, Star, Clock, Building } from 'lucide-react';
import { useTranslation } from "react-i18next";
const Homepage = () => {
  const { t, i18n } = useTranslation();
  const [currentSectorIndex, setCurrentSectorIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const sectors = [
    {
      name: 'Technology',
      description: 'Software, AI, Web Development',
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop'
    },
    {
      name: 'Agriculture',
      description: 'Farming, Agritech, Rural Development',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop'
    },
    {
      name: 'Pharmacy',
      description: 'Healthcare, Drug Research, Medical',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop'
    },
    {
      name: 'Finance',
      description: 'Banking, Fintech, Investment',
      image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop'
    },
    {
      name: 'Education',
      description: 'Teaching, EdTech, Training',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'
    }
  ];

  const featuredInternships = [
    {
      title: 'Software Developer Intern',
      company: 'TechCorp India',
      location: 'Bangalore',
      duration: '3 months',
      stipend: '₹15,000/month',
      skills: ['Python', 'React', 'JavaScript'],
    },
    {
      title: 'Digital Marketing Intern',
      company: 'StartupHub',
      location: 'Mumbai',
      duration: '2 months',
      stipend: '₹12,000/month',
      skills: ['Social Media', 'Content Writing', 'Analytics'],
    },
    {
      title: 'Agricultural Research Intern',
      company: 'FarmTech Solutions',
      location: 'Pune',
      duration: '4 months',
      stipend: '₹10,000/month',
      skills: ['Research', 'Data Analysis', 'Agriculture'],
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSectorIndex((prev) => (prev + 1) % sectors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sectors.length]);

  const nextSector = () => {
    setCurrentSectorIndex((prev) => (prev + 1) % sectors.length);
  };

  const prevSector = () => {
    setCurrentSectorIndex((prev) => (prev - 1 + sectors.length) % sectors.length);
  };

  const InternshipCard = ({ internship }) => (
    <div 
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        cursor: 'pointer'
      }}
    >
      <div className="p-6" style={{ padding: '24px' }}>
        <div className="flex justify-between items-start mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <h3 className="text-lg font-bold text-gray-800" style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
            {internship.title}
          </h3>
        </div>
        
        <div className="flex items-center text-gray-600 mb-2" style={{ display: 'flex', alignItems: 'center', color: '#4b5563', marginBottom: '8px' }}>
          <Building size={16} className="mr-2 text-blue-500" style={{ marginRight: '8px', color: '#3b82f6' }} />
          <span className="text-sm font-medium" style={{ fontSize: '14px', fontWeight: '500' }}>
            {internship.company}
          </span>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3" style={{ display: 'flex', alignItems: 'center', color: '#4b5563', marginBottom: '12px' }}>
          <MapPin size={16} className="mr-2 text-green-500" style={{ marginRight: '8px', color: '#10b981' }} />
          <span className="text-sm" style={{ fontSize: '14px' }}>{internship.location}</span>
          <Clock size={16} className="ml-4 mr-2 text-orange-500" style={{ marginLeft: '16px', marginRight: '8px', color: '#f97316' }} />
          <span className="text-sm" style={{ fontSize: '14px' }}>{internship.duration}</span>
        </div>
        
        <div className="text-lg font-bold text-blue-600 mb-3" style={{ fontSize: '18px', fontWeight: 'bold', color: '#2563eb', marginBottom: '12px' }}>
          {internship.stipend}
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {internship.skills.slice(0, 3).map((skill, index) => (
            <span 
              key={index} 
              className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              style={{
                padding: '4px 12px',
                backgroundColor: '#dbeafe',
                color: '#1d4ed8',
                fontSize: '12px',
                borderRadius: '9999px'
              }}
            >
              {skill}
            </span>
          ))}
        </div>
        
        <button 
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
          style={{
            width: '100%',
            background: 'linear-gradient(to right, #2563eb, #1d4ed8)',
            color: 'white',
            padding: '8px 0',
            borderRadius: '8px',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Apply Now
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>

      {/* Hero Section */}
      <section 
        className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 md:py-24"
        style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 50%, #faf5ff 100%)', padding: '96px 0' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 32px', textAlign: 'center' }}>
          <h1 
            className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight"
            style={{ fontSize: '60px', fontWeight: 'bold', color: '#1f2937', marginBottom: '24px', lineHeight: '1.1' }}
          >
            Kickstart your{' '}
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
              style={{ background: 'linear-gradient(to right, #2563eb, #9333ea)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}
            >
              career journey
            </span>
          </h1>
          
          <p 
            className="text-lg md:text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
            style={{ fontSize: '20px', color: '#4b5563', marginBottom: '48px', maxWidth: '56rem', margin: '0 auto 48px auto', lineHeight: '1.6' }}
          >
            Discover premium internship opportunities from India's top companies. Connect with industry leaders and transform your skills into success.
          </p>

          {/* Search Section */}
          <div 
            className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto"
            style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', padding: '24px', maxWidth: '32rem', margin: '0 auto' }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4" style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '16px' }}>
              🔍 Search Internships
            </h3>
            <div className="flex flex-col md:flex-row gap-4" style={{ display: 'flex', gap: '65px', flexDirection: 'row' }}>
              <div className="flex-1 relative" style={{ flex: '1', position: 'relative' }}>
                <Search 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                  size={20}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                />
                <input
                  type="text"
                  placeholder="Search by role, company, or skills..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    paddingLeft: '40px',
                    paddingRight: '16px',
                    padding: '12px 16px 12px 40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>
              <button 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 32px', borderRadius: '8px', fontWeight: '500', border: 'none', cursor: 'pointer' }}
              >
                Search
              </button>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 mt-16" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', marginTop: '64px' }}>
            <div className="text-center" style={{ textAlign: 'center' }}>
              <div 
                className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ width: '64px', height: '64px', backgroundColor: '#dbeafe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}
              >
                <BookOpen className="text-blue-600" size={32} style={{ color: '#2563eb' }} />
              </div>
              <div className="text-3xl font-bold text-gray-800" style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937' }}>25.0K+</div>
              <div className="text-gray-600 font-medium" style={{ color: '#4b5563', fontWeight: '500' }}>Premium Internships</div>
            </div>
            
            <div className="text-center" style={{ textAlign: 'center' }}>
              <div 
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ width: '64px', height: '64px', backgroundColor: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}
              >
                <Users className="text-green-600" size={32} style={{ color: '#16a34a' }} />
              </div>
              <div className="text-3xl font-bold text-gray-800" style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937' }}>500.0K+</div>
              <div className="text-gray-600 font-medium" style={{ color: '#4b5563', fontWeight: '500' }}>Success Stories</div>
            </div>
            
            <div className="text-center" style={{ textAlign: 'center' }}>
              <div 
                className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ width: '64px', height: '64px', backgroundColor: '#f3e8ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}
              >
                <Award className="text-purple-600" size={32} style={{ color: '#9333ea' }} />
              </div>
              <div className="text-3xl font-bold text-gray-800" style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937' }}>1.0K+</div>
              <div className="text-gray-600 font-medium" style={{ color: '#4b5563', fontWeight: '500' }}>Partner Companies</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sectors Carousel */}
      <section className="py-16 bg-white" style={{ padding: '64px 0', backgroundColor: 'white' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 32px' }}>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12" style={{ fontSize: '30px', fontWeight: 'bold', textAlign: 'center', color: '#1f2937', marginBottom: '48px' }}>
            Explore Internship Sectors
          </h2>
          
          <div className="relative" style={{ position: 'relative' }}>
            <div className="flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button 
                onClick={prevSector}
                className="absolute left-0 z-10 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                style={{ position: 'absolute', left: '0', zIndex: '10', padding: '12px', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: 'none', cursor: 'pointer' }}
              >
                <ChevronLeft className="text-gray-600" size={24} style={{ color: '#4b5563' }} />
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', maxWidth: '56rem', margin: '0 auto' }}>
                {[-1, 0, 1].map((offset) => {
                  const index = (currentSectorIndex + offset + sectors.length) % sectors.length;
                  const sector = sectors[index];
                  const isCenter = offset === 0;
                  
                  return (
                    <div 
                      key={index}
                      className={`rounded-2xl overflow-hidden text-white text-center transform transition-all duration-500 ${
                        isCenter ? 'scale-110 shadow-2xl' : 'scale-95 opacity-75'
                      }`}
                      style={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        color: 'white',
                        textAlign: 'center',
                        transform: isCenter ? 'scale(1.1)' : 'scale(0.95)',
                        opacity: isCenter ? 1 : 0.75,
                        boxShadow: isCenter ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 'none',
                        transition: 'all 0.5s ease',
                        position: 'relative',
                        height: '250px'
                      }}
                    >
                      {/* Background Image */}
                      <div 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: `url(${sector.image})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                      
                      {/* Gradient Overlay */}
                      <div 
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: sector.bgColor,
                          opacity: 0.85
                        }}
                      />
                      
                      {/* Content */}
                      <div 
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          padding: '32px 24px'
                        }}
                      >
                        <div className="text-6xl mb-4" style={{ fontSize: '60px', marginBottom: '16px', filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))' }}>
                          {sector.icon}
                        </div>
                        <h3 className="text-2xl font-bold mb-2" style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                          {sector.name}
                        </h3>
                        <p style={{ opacity: 0.95, textShadow: '1px 1px 2px rgba(0,0,0,0.3)', fontSize: '16px', lineHeight: '1.4' }}>
                          {sector.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button 
                onClick={nextSector}
                className="absolute right-0 z-10 p-3 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                style={{ position: 'absolute', right: '0', zIndex: '10', padding: '12px', backgroundColor: 'white', borderRadius: '50%', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', border: 'none', cursor: 'pointer' }}
              >
                <ChevronRight className="text-gray-600" size={24} style={{ color: '#4b5563' }} />
              </button>
            </div>
            
            <div className="flex justify-center mt-8 space-x-2" style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', gap: '8px' }}>
              {sectors.map((_, index) => (
                <button
                  key={index}
                  className="w-3 h-3 rounded-full transition-colors"
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: index === currentSectorIndex ? '#2563eb' : '#d1d5db',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => setCurrentSectorIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Internships */}
      <section className="py-16 bg-gray-50" style={{ padding: '64px 0', backgroundColor: '#f9fafb' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 32px' }}>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12" style={{ fontSize: '30px', fontWeight: 'bold', textAlign: 'center', color: '#1f2937', marginBottom: '48px' }}>
            Featured Internships 
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {featuredInternships.map((internship, index) => (
              <InternshipCard key={index} internship={internship} />
            ))}
          </div>
          
          <div className="text-center mt-12" style={{ textAlign: 'center', marginTop: '48px' }}>
            <button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-medium text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              style={{
                background: 'linear-gradient(to right, #2563eb, #9333ea)',
                color: 'white',
                padding: '12px 32px',
                borderRadius: '12px',
                fontWeight: '500',
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              View All Internships
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12" style={{ backgroundColor: '#1f2937', color: 'white', padding: '48px 0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 32px' }}>
          <div className="grid md:grid-cols-4 gap-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px' }}>
            <div>
              <div className="flex items-center space-x-3 mb-4" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div 
                  className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center"
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(to right, #2563eb, #9333ea)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span className="text-white font-bold" style={{ color: 'white', fontWeight: 'bold' }}>IM</span>
                </div>
                <span className="text-xl font-bold" style={{ fontSize: '20px', fontWeight: 'bold' }}>CareerMatch</span>
              </div>
              <p className="text-gray-300" style={{ color: '#d1d5db' }}>
                Empowering India's youth with premium internship opportunities and career guidance.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4" style={{ fontWeight: '600', marginBottom: '16px' }}>Quick Links</h3>
              <ul className="space-y-2 text-gray-300" style={{ listStyle: 'none', padding: '0', color: '#d1d5db' }}>
                <li style={{ marginBottom: '8px' }}><a href="#" className="hover:text-white transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>Browse Internships</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" className="hover:text-white transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>Career Guidance</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" className="hover:text-white transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>Success Stories</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4" style={{ fontWeight: '600', marginBottom: '16px' }}>Support</h3>
              <ul className="space-y-2 text-gray-300" style={{ listStyle: 'none', padding: '0', color: '#d1d5db' }}>
                <li style={{ marginBottom: '8px' }}><a href="#" className="hover:text-white transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>Help Center</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" className="hover:text-white transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>Contact Us</a></li>
                <li style={{ marginBottom: '8px' }}><a href="#" className="hover:text-white transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>Terms of Service</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4" style={{ fontWeight: '600', marginBottom: '16px' }}>Connect</h3>
              <p className="text-gray-300 mb-2" style={{ color: '#d1d5db', marginBottom: '8px' }}>📧 support@careermatch.example</p>
              <p className="text-gray-300" style={{ color: '#d1d5db' }}>📞 1800-123-4567</p>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300" style={{ borderTop: '1px solid #374151', marginTop: '32px', paddingTop: '32px', textAlign: 'center', color: '#d1d5db' }}>
            <p>&copy; 2025 PM Internship Scheme. All rights reserved. | Government of India Initiative</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
