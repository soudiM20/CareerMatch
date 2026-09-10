
import React from 'react';

import HeroSection from './HeroSection.jsx';
import FeaturesSection from './FeaturesSection.jsx';
import TestimonialsSection from './TestimonialsSection.jsx';


const LandingPage = () => {
  return (
    <div style={{ 
      width: '100%', 
      backgroundColor: 'white',
      overflowX: 'hidden'
    }}>
      {/*<Navbar onNavigate={onNavigate} />*/}
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
    </div>
  );
};

export default LandingPage;