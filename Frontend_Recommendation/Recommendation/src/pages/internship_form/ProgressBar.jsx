import React from 'react';
import { CheckCircle } from 'lucide-react';

const ProgressBar = ({ currentStep, completedSteps, steps }) => {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {/* Step Circle */}
              <div
                className={`
                  relative flex items-center justify-center w-16 h-16 rounded-full border-2 transition-all duration-300
                  ${index < currentStep || completedSteps[index] 
                    ? 'bg-blue-500 border-blue-500 text-white' 
                    : index === currentStep 
                    ? 'bg-blue-500 border-blue-500 text-white animate-pulse' 
                    : 'bg-gray-200 border-gray-300 text-gray-400'
                  }
                `}
              >
                {completedSteps[index] ? (
                  <CheckCircle size={24} />
                ) : (
                  <span className="text-2xl font-bold">{index + 1}</span>
                )}
              </div>

              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-1.5 mx-3 transition-all duration-300
                    ${index < currentStep || completedSteps[index] 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300'
                    }
                  `}
                />
              )}
            </div>

            {/* Step Label */}
            <div className="text-center mt-3 hidden md:block">
              <div className="text-sm font-semibold text-gray-700">{step.title}</div>
              <div className="text-2xl">{step.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Step Label */}
      <div className="text-center mt-5 md:hidden">
        <div className="text-base font-semibold text-gray-700">{steps[currentStep].title}</div>
        <div className="text-3xl mt-1">{steps[currentStep].icon}</div>
      </div>
    </div>
  );
};

export default ProgressBar;
