import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signin"); // 👈 redirects to Sign In page
  };

  return (
    <div
      style={{
        background: 'linear-gradient(to right, #dbeafe, white)',
        minHeight: '90vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '0 1rem'
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(2rem, 8vw, 4.5rem)',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '1.5rem',
            lineHeight: '1.1'
          }}
        >
          Find Your Perfect <span style={{ color: '#2563eb' }}>Internship</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 3vw, 1.25rem)',
            color: '#6b7280',
            marginBottom: '2.5rem',
            maxWidth: '50rem',
            margin: '0 auto 2.5rem auto',
            lineHeight: '1.6',
            padding: '0 1rem'
          }}
        >
          Connect with top companies and discover internship opportunities tailored to your skills and career aspirations. Start your professional journey today.
        </p>

        <button
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
            borderRadius: '8px',
            fontSize: 'clamp(1rem, 2vw, 1.125rem)',
            fontWeight: '500',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
            transition: 'all 0.3s',
            width: 'auto',
            minWidth: '150px'
          }}
          onClick={handleGetStarted} // 👈 this triggers navigation
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#1d4ed8';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 20px 25px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#2563eb';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
          }}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default HeroSection;
