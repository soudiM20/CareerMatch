// // components/TestimonialsSection.jsx
// import React, { useState } from 'react';
// import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

// const TestimonialsSection = () => {
//   const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
//   const testimonials = [
//     {
//       name: "Sarah Chen",
//       university: "MIT",
//       text: "Found my dream internship at Google through this platform! The recommendations were spot-on.",
//       rating: 5
//     },
//     {
//       name: "Michael Rodriguez",
//       university: "Stanford",
//       text: "The application process was so smooth. Got 3 internship offers in just 2 weeks!",
//       rating: 5
//     },
//     {
//       name: "Emily Johnson",
//       university: "Harvard",
//       text: "Amazing platform! The personalized recommendations saved me so much time.",
//       rating: 5
//     }
//   ];

//   const nextTestimonial = () => {
//     setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
//   };

//   const prevTestimonial = () => {
//     setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
//   };

//   return (
//     <div className="py-24 bg-blue-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//             What Students Say
//           </h2>
//           <p className="text-xl text-gray-600">
//             Join thousands of students who found their dream internships
//           </p>
//         </div>
//         <div className="relative max-w-4xl mx-auto">
//           <div className="bg-white rounded-xl shadow-lg p-8 text-center">
//             <div className="flex justify-center mb-4">
//               {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
//                 <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
//               ))}
//             </div>
//             <p className="text-lg text-gray-700 mb-6 italic">
//               "{testimonials[currentTestimonial].text}"
//             </p>
//             <div className="font-semibold text-gray-900">
//               {testimonials[currentTestimonial].name}
//             </div>
//             <div className="text-blue-600">
//               {testimonials[currentTestimonial].university}
//             </div>
//           </div>
//           <button
//             onClick={prevTestimonial}
//             className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
//           >
//             <ChevronLeft className="w-6 h-6 text-gray-600" />
//           </button>
//           <button
//             onClick={nextTestimonial}
//             className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
//           >
//             <ChevronRight className="w-6 h-6 text-gray-600" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TestimonialsSection;

// src/Component/TestimonialsSection.jsx
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      name: "Sarah Chen",
      university: "MIT",
      text: "Found my dream internship at Google through this platform! The recommendations were spot-on.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      university: "Stanford", 
      text: "The application process was so smooth. Got 3 internship offers in just 2 weeks!",
      rating: 5
    },
    {
      name: "Emily Johnson",
      university: "Harvard",
      text: "Amazing platform! The personalized recommendations saved me so much time.",
      rating: 5
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div style={{ 
      padding: 'clamp(3rem, 8vw, 6rem) 1rem', 
      backgroundColor: '#dbeafe',
      width: '100%'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 6vw, 4rem)' }}>
          <h2 style={{ 
            fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '1rem' 
          }}>
            What Students Say
          </h2>
          <p style={{ 
            fontSize: 'clamp(1rem, 3vw, 1.25rem)', 
            color: '#6b7280'
          }}>
            Join thousands of students who found their dream internships
          </p>
        </div>
        
        <div style={{ 
          position: 'relative', 
          maxWidth: '4rem', 
          margin: '0 auto',
          
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
            padding: 'clamp(1.5rem, 4vw, 2rem)',
            textAlign: 'center',
            position: 'relative'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '1rem' 
            }}>
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <Star 
                  key={i} 
                  size={24} 
                  style={{ 
                    color: '#fbbf24', 
                    fill: '#fbbf24',
                    marginRight: '2px'
                  }} 
                />
              ))}
            </div>
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.125rem)',
              color: '#374151',
              marginBottom: '1.5rem',
              fontStyle: 'italic',
              lineHeight: '1.6'
            }}>
              "{testimonials[currentTestimonial].text}"
            </p>
            <div style={{
              fontWeight: '600',
              color: '#111827',
              fontSize: 'clamp(1rem, 2vw, 1.125rem)'
            }}>
              {testimonials[currentTestimonial].name}
            </div>
            <div style={{
              color: '#2563eb',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)'
            }}>
              {testimonials[currentTestimonial].university}
            </div>
          </div>
          
          <button 
            onClick={prevTestimonial}
            style={{
              position: 'absolute',
              left: 'clamp(-1rem, -4vw, -2rem)',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: '0.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: 'none',
              cursor: 'pointer',
              transition: 'box-shadow 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.boxShadow = '0 10px 15px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <ChevronLeft size={24} color="#6b7280" />
          </button>
          
          <button 
            onClick={nextTestimonial}
            style={{
              position: 'absolute',
              right: 'clamp(-1rem, -4vw, -2rem)',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'white',
              borderRadius: '50%',
              padding: '0.5rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              border: 'none',
              cursor: 'pointer',
              transition: 'box-shadow 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.boxShadow = '0 10px 15px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
          >
            <ChevronRight size={24} color="#6b7280" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;