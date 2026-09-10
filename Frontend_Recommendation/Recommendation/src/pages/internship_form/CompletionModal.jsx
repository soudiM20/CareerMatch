import React from 'react';
import { Trophy, Star, CheckCircle, X } from 'lucide-react';

const CompletionModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          <X size={24} />
        </button>

        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-green-100 to-blue-100 opacity-50"></div>
        
        {/* Confetti Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              {['🎉', '🎊', '⭐', '🏆', '🥳', '✨'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative p-8 text-center">
          {/* Trophy Animation */}
          <div className="relative mb-6">
            <Trophy 
              className="mx-auto text-yellow-500 animate-pulse" 
              size={64} 
            />
            <div className="absolute -top-2 -right-2">
              <Star className="text-yellow-400 animate-spin" size={24} />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            🎉 Congratulations! 🎉
          </h2>
          
          <p className="text-lg text-gray-700 mb-6">
            Your internship application has been submitted successfully!
          </p>

          {/* Achievement Summary */}
          <div className="bg-white/80 rounded-xl p-4 mb-6 border">
            <h3 className="font-semibold text-gray-800 mb-3">Application Complete!</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span>All 6 steps completed</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Star size={16} className="text-yellow-500" />
                <span>Multiple badges earned</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Trophy size={16} className="text-purple-500" />
                <span>Profile 100% complete</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="text-left mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">What happens next?</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Our team will review your application within 2-3 business days</li>
              <li>• You'll receive an email confirmation shortly</li>
              <li>• If selected, we'll contact you for an interview</li>
              <li>• Keep an eye on your email for updates</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
            >
              Continue to Dashboard
            </button>
            <p className="text-xs text-gray-500">
              Your application data has been saved and submitted securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
