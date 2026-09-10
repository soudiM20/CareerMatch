import React from 'react';
import { Target, Clock, MapPin, Briefcase } from 'lucide-react';

const PreferencesStep = ({
  sectorOfInterest,
  preferences,
  onUpdate,
  onBadgeEarned
}) => {
const sectors = [
  { name: 'Aviation & Defence', icon: '✈️', color: 'blue' },
  { name: 'Metals & Mining', icon: '⛏️', color: 'gray' },
  { name: 'Retail & Consumer Durables', icon: '🛍️', color: 'cyan' },
  { name: 'Pharmaceutical', icon: '💊', color: 'red' },
  { name: 'Telecom', icon: '📡', color: 'purple' },
  { name: 'Chemical', icon: '⚗️', color: 'pink' },
  { name: 'FMCG', icon: '🥫', color: 'orange' },
  { name: 'Travel & Hospitality', icon: '🏨', color: 'teal' },
  { name: 'Media, Entertainment & Education', icon: '🎬', color: 'yellow' },
  { name: 'Oil, Gas & Energy', icon: '🛢️', color: 'indigo' },
  { name: 'Agriculture & Allied', icon: '🌾', color: 'green' },
  { name: 'Infrastructure & Construction', icon: '🏗️', color: 'gray' },
  { name: 'Automotive', icon: '🚗', color: 'blue' },
  { name: 'Healthcare', icon: '🏥', color: 'red' },
  { name: 'Consulting Services', icon: '🤝', color: 'yellow' },
  { name: 'IT & Software Development', icon: '💻', color: 'purple' },
  { name: 'Banking & Financial Services', icon: '💰', color: 'green' }
];



  const modes = [
    { value: 'remote', label: 'Remote', icon: '🏠', description: 'Work from anywhere' },
    { value: 'onsite', label: 'On-site', icon: '🏢', description: 'In-person at office' },
    { value: 'hybrid', label: 'Hybrid', icon: '🔄', description: 'Mix of remote and office' }
  ];

  const durations = ['3 months', '6 months', '9 months', '12 months', 'Flexible'];

  const toggleSector = (sector) => {
    const updated = sectorOfInterest.includes(sector)
      ? sectorOfInterest.filter((s) => s !== sector)
      : [...sectorOfInterest, sector];

    onUpdate({ sectorOfInterest: updated });

    if (updated.length === 1) onBadgeEarned('first-sector-selected');
    if (updated.length >= 3) onBadgeEarned('diverse-interests');
  };

  const updatePreferences = (field, value) => {
    const updated = { ...preferences, [field]: value };
    onUpdate({ preferences: updated });

    if (field === 'mode' && value) onBadgeEarned('mode-selected');
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <Target className="mx-auto text-blue-500 mb-2" size={48} />
        <p className="text-gray-600">Tell us about your career interests and preferences</p>
      </div>

      {/* Sector of Interest */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Target size={24} />
          Sectors of Interest <span className="text-blue-500">*</span>
        </h3>
        <p className="text-blue-700 text-sm mb-4">Select all sectors that interest you</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
  {sectors.map((sector) => (
    <button
      key={sector.name}
      onClick={() => toggleSector(sector.name)}
      className={`
        text-lg p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 active:scale-95
        ${sectorOfInterest.includes(sector.name)
          ? 'border-blue-700 bg-blue-200 shadow-lg'
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
    >
      <div className="text-2xl mb-2">{sector.icon}</div>
      <div
        className={`
          font-medium text-sm text-center
          ${sectorOfInterest.includes(sector.name) 
            ? 'text-blue-800' 
            : 'text-gray-600'
          }
        `}
      >
        {sector.name}
      </div>
    </button>
  ))}
</div>


        {sectorOfInterest.length > 0 && (
          <div className="mt-4 text-2xl text-blue-700">
            Selected: {sectorOfInterest.join(', ')}
          </div>
        )}
      </div>

      {/* Preferences */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
          <Clock size={24} />
          Internship Preferences
        </h3>

        <div className="space-y-6">
          {/* Duration */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-3">
              Preferred Duration
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {durations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => updatePreferences('duration', duration)}
                  className={`
                    text-lg p-3 rounded-xl border-2 transition-all text-center
                    ${preferences.duration === duration
                      ? 'border-blue-500 bg-blue-100 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-600'
                    }
                  `}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>

          {/* Work Mode */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-3">
              Work Mode <span className="text-red-500">*</span>
            </label>
            <div className="grid md:grid-cols-3 gap-4">
              {modes.map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => updatePreferences('mode', mode.value)}
                  className={`
                    text-lg p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105
                    ${preferences.mode === mode.value
                      ? 'border-blue-500 bg-blue-100 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">{mode.icon}</div>
                  <div
                    className={`
                    font-medium mb-1
                    ${preferences.mode === mode.value ? 'text-blue-700' : 'text-gray-700'}
                  `}
                  >
                    {mode.label}
                  </div>
                  <div className="text-sm text-gray-600">{mode.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-2">
              Preferred Location (if on-site or hybrid)
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                value={preferences.location}
                onChange={(e) => updatePreferences('location', e.target.value)}
                placeholder="City, State or 'Any location'"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-black"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Message */}
      {sectorOfInterest.length > 0 && preferences.mode && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">🎯</div>
          <p className="text-yellow-800 font-medium">
            Great choices! You're interested in {sectorOfInterest.length} sector
            {sectorOfInterest.length > 1 ? 's' : ''} and prefer {preferences.mode} work.
            You're almost done!
          </p>
        </div>
      )}
    </div>
  );
};

export default PreferencesStep;
