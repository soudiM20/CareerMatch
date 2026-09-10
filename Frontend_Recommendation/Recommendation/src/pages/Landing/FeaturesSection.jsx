// // components/FeaturesSection.jsx
// import React from 'react';
// import { Users, Shield, Zap } from 'lucide-react';

// const FeaturesSection = () => {
//   const features = [
//     {
//       icon: <Zap className="w-8 h-8 text-blue-600" />,
//       title: "Personalized Recommendations",
//       description: "AI-powered matching based on your skills, interests, and career goals"
//     },
//     {
//       icon: <Shield className="w-8 h-8 text-blue-600" />,
//       title: "Verified Companies",
//       description: "All internships from trusted, verified companies with real opportunities"
//     },
//     {
//       icon: <Users className="w-8 h-8 text-blue-600" />,
//       title: "Easy Apply",
//       description: "One-click applications with your saved profile and resume"
//     }
//   ];

//   return (
//     <div className="py-24 bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16">
//           <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
//             Why Choose InternMatch?
//           </h2>
//           <p className="text-xl text-gray-600 max-w-2xl mx-auto">
//             We make finding and applying to internships simple, efficient, and successful.
//           </p>
//         </div>
//         <div className="grid md:grid-cols-3 gap-8">
//           {features.map((feature, index) => (
//             <div key={index} className="text-center p-8 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
//               <div className="flex justify-center mb-4">
//                 {feature.icon}
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
//               <p className="text-gray-600">{feature.description}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FeaturesSection;











// src/Component/FeaturesSection.jsx
// import React from 'react';
// import { Users, Shield, Zap } from 'lucide-react';

// const FeaturesSection = () => {
//   const features = [
//     {
//       icon: <Zap size={32} color="#2563eb" />,
//       title: "Personalized Recommendations",
//       description: "AI-powered matching based on your skills, interests, and career goals"
//     },
//     {
//       icon: <Shield size={32} color="#2563eb" />,
//       title: "Verified Companies",
//       description: "All internships from trusted, verified companies with real opportunities"
//     },
//     {
//       icon: <Users size={32} color="#2563eb" />,
//       title: "Easy Apply",
//       description: "One-click applications with your saved profile and resume"
//     }
//   ];

//   return (
//     <div style={{ padding: '6rem 0', backgroundColor: 'white' }}>
//       <div style={{
//         maxWidth: '1280px',
//         margin: '0 auto',
//         padding: '0 1rem'
//       }}>
//         <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
//           <h2 style={{
//             fontSize: 'clamp(2rem, 4vw, 2.5rem)',
//             fontWeight: 'bold',
//             color: '#111827',
//             marginBottom: '1rem'
//           }}>
//             Why Choose InternMatch?
//           </h2>
//           <p style={{
//             fontSize: '1.25rem',
//             color: '#6b7280',
//             maxWidth: '32rem',
//             margin: '0 auto'
//           }}>
//             We make finding and applying to internships simple, efficient, and successful.
//           </p>
//         </div>
        
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//           gap: '2rem'
//         }}>
//           {features.map((feature, index) => (
//             <div
//               key={index}
//               style={{
//                 textAlign: 'center',
//                 padding: '2rem',
//                 backgroundColor: 'white',
//                 borderRadius: '12px',
//                 boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
//                 border: '1px solid #e5e7eb',
//                 transition: 'box-shadow 0.3s'
//               }}
//               onMouseOver={(e) => {
//                 e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
//               }}
//               onMouseOut={(e) => {
//                 e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
//               }}
//             >
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 marginBottom: '1rem'
//               }}>
//                 {feature.icon}
//               </div>
//               <h3 style={{
//                 fontSize: '1.25rem',
//                 fontWeight: '600',
//                 color: '#111827',
//                 marginBottom: '1rem'
//               }}>
//                 {feature.title}
//               </h3>
//               <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
//                 {feature.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FeaturesSection;

// src/Component/FeaturesSection.jsx
// import React from 'react';
// import { Users, Shield, Zap } from 'lucide-react';

// const FeaturesSection = () => {
//   const features = [
//     {
//       icon: <Zap size={32} color="#2563eb" />,
//       title: "Personalized Recommendations",
//       description: "AI-powered matching based on your skills, interests, and career goals"
//     },
//     {
//       icon: <Shield size={32} color="#2563eb" />,
//       title: "Verified Companies",
//       description: "All internships from trusted, verified companies with real opportunities"
//     },
//     {
//       icon: <Users size={32} color="#2563eb" />,
//       title: "Easy Apply",
//       description: "One-click applications with your saved profile and resume"
//     }
//   ];

//   return (
//     <div style={{ padding: '6rem 0', backgroundColor: 'white' }}>
//       <div style={{
//         maxWidth: '1280px',
//         margin: '0 auto',
//         padding: '0 1rem'
//       }}>
//         <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
//           <h2 style={{
//             fontSize: 'clamp(2rem, 4vw, 2.5rem)',
//             fontWeight: 'bold',
//             color: '#111827',
//             marginBottom: '1rem'
//           }}>
//             Why Choose InternMatch?
//           </h2>
//           <p style={{
//             fontSize: '1.25rem',
//             color: '#6b7280',
//             maxWidth: '32rem',
//             margin: '0 auto'
//           }}>
//             We make finding and applying to internships simple, efficient, and successful.
//           </p>
//         </div>
        
//         <div style={{
//           display: 'grid',
//           gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
//           gap: '2rem'
//         }}>
//           {features.map((feature, index) => (
//             <div
//               key={index}
//               style={{
//                 textAlign: 'center',
//                 padding: '2rem',
//                 backgroundColor: 'white',
//                 borderRadius: '12px',
//                 boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
//                 border: '1px solid #e5e7eb',
//                 transition: 'box-shadow 0.3s'
//               }}
//               onMouseOver={(e) => {
//                 e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
//               }}
//               onMouseOut={(e) => {
//                 e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
//               }}
//             >
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'center',
//                 marginBottom: '1rem'
//               }}>
//                 {feature.icon}
//               </div>
//               <h3 style={{
//                 fontSize: '1.25rem',
//                 fontWeight: '600',
//                 color: '#111827',
//                 marginBottom: '1rem'
//               }}>
//                 {feature.title}
//               </h3>
//               <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
//                 {feature.description}
//               </p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FeaturesSection;

// src/Component/FeaturesSection.jsx
import React from 'react';
import { Users, Shield, Zap } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: <Zap size={32} color="#2563eb" />,
      title: "Personalized Recommendations",
      description: "AI-powered matching based on your skills, interests, and career goals"
    },
    {
      icon: <Shield size={32} color="#2563eb" />,
      title: "Verified Companies",
      description: "All internships from trusted, verified companies with real opportunities"
    },
    {
      icon: <Users size={32} color="#2563eb" />,
      title: "Easy Apply",
      description: "One-click applications with your saved profile and resume"
    }
  ];

  return (
    <div style={{ 
      padding: 'clamp(3rem, 8vw, 6rem) 1rem', 
      backgroundColor: 'white',
      width: '100%',
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center'
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
            Why Choose CareerMatch?
          </h2>
          <p style={{ 
            fontSize: 'clamp(1rem, 3vw, 1.25rem)', 
            color: '#6b7280', 
            maxWidth: '36rem', 
            margin: '0 auto',
            padding: '0 1rem'
          }}>
            We make finding and applying to internships simple, efficient, and successful.
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'clamp(1.5rem, 4vw, 2rem)',
          padding: '0 1rem'
        }}>
          {features.map((feature, index) => (
            <div 
              key={index} 
              style={{
                textAlign: 'center',
                padding: 'clamp(1.5rem, 4vw, 2rem)',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
                transition: 'box-shadow 0.3s',
                height: 'auto',
                minHeight: '250px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: '1rem' 
              }}>
                {feature.icon}
              </div>
              <h3 style={{ 
                fontSize: 'clamp(1.125rem, 3vw, 1.25rem)', 
                fontWeight: '600', 
                color: '#111827', 
                marginBottom: '1rem',
                lineHeight: '1.3'
              }}>
                {feature.title}
              </h3>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.6',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
