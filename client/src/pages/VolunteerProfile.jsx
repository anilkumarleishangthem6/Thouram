import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const SKILL_SUGGESTIONS = [
  'First Aid',
  'Crowd Management',
  'Logistics',
  'Teaching',
  'Media & Photography',
  'Technical Mentoring',
  'Event Setup',
  'Language Translation',
  'Cooking & Food Prep',
  'Youth Mentorship',
  'Waste Sorting',
  'Emergency Care'
];

const CAUSE_OPTIONS = [
  'Environment & Lakes',
  'Education & Mentorship',
  'Technology & Digital Literacy',
  'Arts & Cultural Heritage',
  'Social Welfare & Food Relief',
  'Health & Blood Donation',
  'Animal Care',
  'Disaster Response'
];

const CITIES = ['Bengaluru', 'Chennai', 'Pune', 'Mumbai', 'New Delhi', 'Hyderabad', 'Kolkata', 'Ahmedabad'];

export default function VolunteerProfile() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ratings, setRatings] = useState([]);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [travelRadiusKm, setTravelRadiusKm] = useState(25);
  const [skills, setSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState('');
  const [interests, setInterests] = useState([]);
  const [languages, setLanguages] = useState(['English', 'Hindi']);
  const [customLang, setCustomLang] = useState('');
  const [availability, setAvailability] = useState({
    weekdays: false,
    weekends: true,
    mornings: true,
    afternoons: false,
    evenings: false
  });

  // Profile Stats
  const [stats, setStats] = useState({
    totalVerifiedHours: 0,
    reliabilityScore: 100,
    workQualityScore: 0,
    completionPercent: 0
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/v1/volunteers/profile');
      if (res.data.success) {
        const p = res.data.profile || {};
        const u = res.data.user || {};
        setName(u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim());
        setPhone(u.phone || '');
        setBio(p.bio || '');
        setCity(p.location?.city || 'Bengaluru');
        setTravelRadiusKm(p.location?.travelRadiusKm || 25);
        setSkills(p.skills || []);
        setInterests(p.interests || []);
        setLanguages(p.languages?.length ? p.languages : ['English', 'Hindi']);
        if (p.availability) {
          setAvailability({
            weekdays: !!p.availability.weekdays,
            weekends: p.availability.weekends !== false,
            mornings: p.availability.mornings !== false,
            afternoons: !!p.availability.afternoons,
            evenings: !!p.availability.evenings
          });
        }
        setRatings(res.data.ratings || []);
        setStats({
          totalVerifiedHours: p.totalVerifiedHours || 0,
          reliabilityScore: p.reliabilityScore || 100,
          workQualityScore: p.workQualityScore || 0,
          completionPercent: p.profileCompletionPercent || 60
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      toast.error('Unable to fetch volunteer profile');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSkill = (skill) => {
    if (skills.includes(skill)) {
      setSkills(skills.filter(s => s !== skill));
    } else {
      setSkills([...skills, skill]);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !skills.includes(customSkill.trim())) {
      setSkills([...skills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleToggleInterest = (cause) => {
    if (interests.includes(cause)) {
      setInterests(interests.filter(i => i !== cause));
    } else {
      setInterests([...interests, cause]);
    }
  };

  const handleAddLanguage = (e) => {
    e.preventDefault();
    if (customLang.trim() && !languages.includes(customLang.trim())) {
      setLanguages([...languages, customLang.trim()]);
      setCustomLang('');
    }
  };

  const handleRemoveLanguage = (lang) => {
    setLanguages(languages.filter(l => l !== lang));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        phone,
        bio,
        city,
        travelRadiusKm: Number(travelRadiusKm),
        skills,
        interests,
        languages,
        availability
      };

      const res = await axios.put('/api/v1/volunteers/profile', payload);
      if (res.data.success) {
        toast.success('Volunteer profile and matching preferences saved!');
        if (res.data.profile) {
          setStats(prev => ({
            ...prev,
            completionPercent: res.data.profile.profileCompletionPercent || prev.completionPercent
          }));
        }
        refreshUser?.();
      }
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#004653] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#40484b]">Loading volunteer profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c0c8cb]/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'}
              alt={name}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#9ed5e4] shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-[#004653] uppercase tracking-wider bg-[#e7eefb] px-2.5 py-0.5 rounded-full">
                  Volunteer Member
                </span>
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Verified ID
                </span>
              </div>
              <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#141c25]">
                {name || 'Volunteer Profile'}
              </h1>
              <p className="text-xs sm:text-sm text-[#40484b] mt-0.5">
                {user?.email} • {city}, India
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="bg-[#f2f4fc] border border-[#e1e9f6] rounded-2xl p-3 text-center min-w-[90px]">
              <span className="block text-xl font-black text-[#004653]">{stats.totalVerifiedHours}h</span>
              <span className="text-[10px] font-bold text-[#70787d] uppercase">Verified Hours</span>
            </div>
            <div className="bg-[#d0e8d7] border border-[#a3d4b2] rounded-2xl p-3 text-center min-w-[90px]">
              <span className="block text-xl font-black text-[#0b3823]">{stats.reliabilityScore}%</span>
              <span className="text-[10px] font-bold text-[#0b3823] uppercase">Reliability</span>
            </div>
            <div className="bg-[#ffdcc2] border border-[#ffb98a] rounded-2xl p-3 text-center min-w-[90px]">
              <span className="block text-xl font-black text-[#9e4600]">
                {stats.workQualityScore ? `${stats.workQualityScore.toFixed(1)}★` : '5.0★'}
              </span>
              <span className="text-[10px] font-bold text-[#9e4600] uppercase">Quality Rating</span>
            </div>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#c0c8cb]/60 shadow-xs">
          <div className="flex justify-between items-center text-xs font-bold mb-2">
            <span className="text-[#004653] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Profile Match Calibration: {stats.completionPercent}% Complete
            </span>
            <span className="text-[#40484b]">Higher completion unlocks priority backup promotions</span>
          </div>
          <div className="w-full bg-[#f2f4fc] rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#004653] h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.completionPercent}%` }}
            />
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Personal Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c0c8cb]/60 shadow-sm space-y-5">
            <h2 className="font-headline font-bold text-lg text-[#141c25] flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="material-symbols-outlined text-[#004653]">badge</span>
              Personal Details & Bio
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                Bio & Motivation (Why you volunteer)
              </label>
              <textarea
                rows={3}
                placeholder="Share your background, passions, and what drives you to contribute to community causes..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
              />
            </div>
          </div>

          {/* Section 2: Proximity & Location Calibration */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c0c8cb]/60 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="font-headline font-bold text-lg text-[#141c25] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004653]">near_me</span>
                Location & Travel Preferences (20% Match Weight)
              </h2>
              <span className="text-xs bg-[#e7eefb] text-[#004653] font-bold px-2.5 py-0.5 rounded-full">
                Proximity Factor
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                  Primary City Base
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#004653]"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <p className="text-[11px] text-[#70787d] mt-1">
                  Events hosted in your primary city receive full location compatibility score.
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-[#141c25] uppercase tracking-wider">
                    Max Travel Radius
                  </label>
                  <span className="text-xs font-black text-[#004653] px-2 py-0.5 bg-[#e7eefb] rounded-md">
                    {travelRadiusKm} km
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={travelRadiusKm}
                  onChange={(e) => setTravelRadiusKm(e.target.value)}
                  className="w-full accent-[#004653] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#70787d] mt-1">
                  <span>5 km (Local neighborhood)</span>
                  <span>50 km (Greater city area)</span>
                  <span>100 km (Regional)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Verified & Candidate Skills */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c0c8cb]/60 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="font-headline font-bold text-lg text-[#141c25] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004653]">psychology</span>
                Volunteer Skills Inventory (40% Match Weight)
              </h2>
              <span className="text-xs bg-[#e7eefb] text-[#004653] font-bold px-2.5 py-0.5 rounded-full">
                Highest Match Impact
              </span>
            </div>

            <p className="text-xs text-[#40484b]">
              Click skills you possess or wish to contribute. Matches are automatically calculated when organizers post duty requirements.
            </p>

            <div className="flex flex-wrap gap-2">
              {SKILL_SUGGESTIONS.map((skill) => {
                const isSelected = skills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleToggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-[#004653] text-white border-[#004653] shadow-xs'
                        : 'bg-[#f2f4fc] text-[#40484b] border-transparent hover:border-[#004653]'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{skill}
                  </button>
                );
              })}
            </div>

            {/* Custom Skill Addition */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-[#141c25] uppercase tracking-wider mb-1">
                Add Custom Skill Tag
              </label>
              <div className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="e.g. Graphic Design, Electrician, Yoga Trainer"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-[#c0c8cb] text-xs flex-grow focus:outline-none focus:ring-1 focus:ring-[#004653]"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-4 py-1.5 bg-[#004653] text-white text-xs font-bold rounded-xl hover:bg-[#245e6b] transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Section 4: Cause Interests */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c0c8cb]/60 shadow-sm space-y-5">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h2 className="font-headline font-bold text-lg text-[#141c25] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004653]">volunteer_activism</span>
                Causes of Interest (20% Match Weight)
              </h2>
              <span className="text-xs bg-[#e7eefb] text-[#004653] font-bold px-2.5 py-0.5 rounded-full">
                Interest Alignment
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CAUSE_OPTIONS.map((cause) => {
                const isSelected = interests.includes(cause);
                return (
                  <button
                    key={cause}
                    type="button"
                    onClick={() => handleToggleInterest(cause)}
                    className={`p-3 rounded-2xl text-xs font-bold border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#d0e8d7] border-[#286e4f] text-[#0b3823] shadow-xs'
                        : 'bg-[#f2f4fc] border-transparent text-[#40484b] hover:bg-gray-100'
                    }`}
                  >
                    <span>{cause}</span>
                    <span className="material-symbols-outlined text-[16px]">
                      {isSelected ? 'check_circle' : 'add'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Availability & Languages */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c0c8cb]/60 shadow-sm space-y-5">
            <h2 className="font-headline font-bold text-lg text-[#141c25] flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="material-symbols-outlined text-[#004653]">calendar_today</span>
              Availability Schedule & Languages
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-2">
                  Typical Availability Windows
                </label>
                <div className="space-y-2 text-xs">
                  {[
                    { key: 'weekends', label: 'Weekends (Saturday & Sunday)' },
                    { key: 'weekdays', label: 'Weekdays (Monday - Friday)' },
                    { key: 'mornings', label: 'Morning Shifts (07:00 - 12:00)' },
                    { key: 'afternoons', label: 'Afternoon Shifts (12:00 - 17:00)' },
                    { key: 'evenings', label: 'Evening Shifts (17:00 - 21:00)' }
                  ].map((slot) => (
                    <label key={slot.key} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={availability[slot.key]}
                        onChange={(e) => setAvailability({ ...availability, [slot.key]: e.target.checked })}
                        className="w-4 h-4 rounded text-[#004653] focus:ring-[#004653]"
                      />
                      <span className="text-gray-800 font-medium">{slot.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-2">
                  Languages Spoken
                </label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-2.5 py-1 bg-[#f2f4fc] text-[#004653] rounded-lg text-xs font-semibold flex items-center gap-1"
                    >
                      {lang}
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang)}
                        className="hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add language (e.g. Tamil, Kannada)"
                    value={customLang}
                    onChange={(e) => setCustomLang(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-[#c0c8cb] text-xs flex-grow focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="px-3 py-1.5 bg-[#004653] text-white text-xs font-bold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Verified Organizer Testimonials */}
          {ratings.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c0c8cb]/60 shadow-sm space-y-4">
              <h2 className="font-headline font-bold text-lg text-[#141c25] flex items-center gap-2 border-b border-gray-100 pb-3">
                <span className="material-symbols-outlined text-[#004653]">reviews</span>
                Verified Organizer Closeout Reviews ({ratings.length})
              </h2>

              <div className="space-y-3">
                {ratings.map((r, i) => (
                  <div key={i} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="text-xs font-bold text-[#141c25]">{r.event?.title || 'Community Event'}</p>
                      <p className="text-xs text-[#40484b] mt-0.5 italic">"{r.feedbackNotes || 'Exemplary dedication and duty fulfillment.'}"</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">Reviewed by {r.ratedBy?.name || 'Community Organizer'}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#d0e8d7] text-[#0b3823]">
                        Reliability: {r.reliabilityScore}/5★
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#ffdcc2] text-[#9e4600]">
                        Work Quality: {r.workQualityScore}/5★
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Link
              to="/volunteer-dashboard"
              className="px-6 py-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#004653] hover:bg-[#245e6b] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving Preferences...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Volunteer Preferences
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

