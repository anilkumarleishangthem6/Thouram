import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const PRESET_BANNERS = [
  { label: 'Coastal / Lake Cleanup', url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Urban Reforestation & Trees', url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Community Food Kitchen', url: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Tech & Skills Workshop', url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Elderly & Digital Literacy', url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&q=80&w=1200' },
  { label: 'Art, Culture & Music', url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&q=80&w=1200' }
];

const COMMON_SKILLS = [
  'First Aid',
  'Crowd Management',
  'Logistics',
  'Teaching',
  'Media & Photography',
  'Technical Mentoring',
  'Waste Sorting',
  'Registration Desk',
  'Language Translation',
  'Heavy Lifting'
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

export default function CreateEventModal({ isOpen, onClose, onEventCreated }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    communityId: '',
    title: '',
    description: '',
    cause: 'Environment & Lakes',
    imageUrl: PRESET_BANNERS[0].url,
    tags: 'volunteer, community, action',
    
    // Schedule & Location
    startDate: '',
    startTime: '08:00',
    endDate: '',
    endTime: '13:00',
    city: 'Bengaluru',
    venue: '',
    address: '',
    meetingPoint: '',

    // Duties
    duties: [
      {
        title: 'Primary Activity Lead',
        description: 'Guide attendees, monitor safety, and coordinate supply distribution.',
        volunteersRequired: 15,
        requiredSkills: ['Crowd Management', 'Logistics'],
        physicalIntensity: 'moderate'
      },
      {
        title: 'Registration & Welcoming Marshall',
        description: 'Verify attendee check-in passes and hand out duty kits.',
        volunteersRequired: 5,
        requiredSkills: ['Registration Desk'],
        physicalIntensity: 'low'
      }
    ],

    // Safety & Logistics
    volunteerInstructions: 'Please arrive 15 minutes prior to scheduled start for briefing.',
    whatToBring: 'Reusable water bottle, cap/hat, valid ID proof.',
    providedOnSite: 'Gloves, safety vests, hydration stations, first aid kit, light snacks.',
    firstAidAvailable: true,
    emergencyContact: '+91 98765 43210'
  });

  useEffect(() => {
    if (isOpen) {
      fetchCommunities();
      initDefaultDates();
    }
  }, [isOpen]);

  const initDefaultDates = () => {
    const nextSaturday = new Date();
    nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7 || 7));
    const dateStr = nextSaturday.toISOString().split('T')[0];
    setFormData(prev => ({
      ...prev,
      startDate: prev.startDate || dateStr,
      endDate: prev.endDate || dateStr
    }));
  };

  const fetchCommunities = async () => {
    try {
      const res = await axios.get('/api/v1/communities/managed/list');
      if (res.data.success && res.data.data.length > 0) {
        setCommunities(res.data.data);
        if (!formData.communityId) {
          setFormData(prev => ({ ...prev, communityId: res.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load managed communities:', err);
    }
  };

  if (!isOpen) return null;

  // Quota Calculations
  const totalVolunteersRequired = formData.duties.reduce(
    (sum, d) => sum + (Number(d.volunteersRequired) || 0),
    0
  );
  const backupQuota = Math.ceil(totalVolunteersRequired * 0.10);

  // Duty Management Handlers
  const handleAddDuty = () => {
    setFormData(prev => ({
      ...prev,
      duties: [
        ...prev.duties,
        {
          title: `Duty Team ${prev.duties.length + 1}`,
          description: 'Assist with operational support and volunteer coordination.',
          volunteersRequired: 5,
          requiredSkills: ['Logistics'],
          physicalIntensity: 'moderate'
        }
      ]
    }));
  };

  const handleRemoveDuty = (index) => {
    if (formData.duties.length <= 1) {
      toast.error('Event must have at least one duty track.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      duties: prev.duties.filter((_, i) => i !== index)
    }));
  };

  const handleDutyChange = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.duties];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, duties: updated };
    });
  };

  const handleDutySkillToggle = (dutyIndex, skill) => {
    setFormData(prev => {
      const updated = [...prev.duties];
      const curSkills = updated[dutyIndex].requiredSkills || [];
      if (curSkills.includes(skill)) {
        updated[dutyIndex].requiredSkills = curSkills.filter(s => s !== skill);
      } else {
        updated[dutyIndex].requiredSkills = [...curSkills, skill];
      }
      return { ...prev, duties: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter an event title.');
      setStep(1);
      return;
    }
    if (!formData.communityId) {
      toast.error('Please select an organizing community.');
      setStep(1);
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please provide event dates.');
      setStep(2);
      return;
    }
    if (totalVolunteersRequired <= 0) {
      toast.error('Total required volunteers must be greater than 0.');
      setStep(3);
      return;
    }

    setLoading(true);
    try {
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}:00`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}:00`);

      const payload = {
        communityId: formData.communityId,
        title: formData.title.trim(),
        description: formData.description.trim() || `${formData.title} community initiative organized via THOURAM.`,
        cause: formData.cause,
        imageUrl: formData.imageUrl,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        location: {
          city: formData.city,
          venue: formData.venue || `${formData.city} Community Grounds`,
          address: formData.address || `Central ${formData.city}`,
          meetingPoint: formData.meetingPoint || 'Main Entrance Gate'
        },
        dateTime: {
          start: startDateTime,
          end: endDateTime,
          timeZone: 'Asia/Kolkata'
        },
        duties: formData.duties.map(d => ({
          title: d.title,
          description: d.description,
          volunteersRequired: Number(d.volunteersRequired) || 1,
          requiredSkills: d.requiredSkills || [],
          physicalIntensity: d.physicalIntensity || 'moderate'
        })),
        volunteerInstructions: formData.volunteerInstructions,
        whatToBring: formData.whatToBring.split(',').map(s => s.trim()).filter(Boolean),
        providedOnSite: formData.providedOnSite.split(',').map(s => s.trim()).filter(Boolean),
        safety: {
          firstAidAvailable: formData.firstAidAvailable,
          emergencyContact: formData.emergencyContact
        },
        status: 'published'
      };

      const res = await axios.post('/api/v1/events', payload);
      if (res.data.success) {
        toast.success('Event published successfully with 10% auto-backup waitlist!');
        onEventCreated?.(res.data.event);
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to publish event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#c0c8cb]">
        {/* Header */}
        <div className="bg-[#004653] text-white p-5 sm:p-6 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#9ed5e4] text-[#004653]">
                Event Wizard
              </span>
              <span className="text-xs text-white/80">Step {step} of 4</span>
            </div>
            <h3 className="font-headline font-bold text-xl sm:text-2xl">Create & Publish Volunteer Event</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="grid grid-cols-4 bg-[#f2f4fc] border-b border-[#e1e9f6] text-xs font-semibold text-center shrink-0">
          {[
            { num: 1, label: 'Overview' },
            { num: 2, label: 'Venue & Time' },
            { num: 3, label: 'Duties & Quotas' },
            { num: 4, label: 'Safety & Guidelines' }
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`py-3 px-2 flex items-center justify-center gap-1.5 transition-colors border-b-2 ${
                step === s.num
                  ? 'border-[#004653] text-[#004653] bg-white'
                  : step > s.num
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-[#70787d]'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                step === s.num
                  ? 'bg-[#004653] text-white'
                  : step > s.num
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6">
          {/* STEP 1: Overview */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                  Organizing Community *
                </label>
                <select
                  value={formData.communityId}
                  onChange={(e) => setFormData({ ...formData, communityId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#004653]"
                >
                  {communities.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} {c.isVerified ? '✓ (Verified)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                  Event Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Marina Beach Sustainable Cleanup & Dune Restoration"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                    Cause Category *
                  </label>
                  <select
                    value={formData.cause}
                    onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#004653]"
                  >
                    {CAUSE_OPTIONS.map((cause) => (
                      <option key={cause} value={cause}>{cause}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                    Search Tags
                  </label>
                  <input
                    type="text"
                    placeholder="clean-up, environment, youth"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                  Event Description & Goals
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail the community mission, schedule, and expected collective impact..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                />
              </div>

              {/* Banner Presets */}
              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                  Event Cover Banner
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-2">
                  {PRESET_BANNERS.map((banner, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: banner.url })}
                      className={`relative rounded-lg overflow-hidden border-2 aspect-video group ${
                        formData.imageUrl === banner.url ? 'border-[#004653] ring-2 ring-[#004653]' : 'border-transparent'
                      }`}
                    >
                      <img src={banner.url} alt={banner.label} className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/40 text-[9px] text-white flex items-center justify-center p-1 text-center font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        {banner.label}
                      </span>
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Or enter custom image URL"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-[#c0c8cb] text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Venue & Schedule */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                    Start Date & Time *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-2/3 px-3 py-2 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                      required
                    />
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-1/3 px-3 py-2 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                    End Date & Time *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-2/3 px-3 py-2 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                      required
                    />
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-1/3 px-3 py-2 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                    Host City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#004653]"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Marina Beach Promenade / Cubbon Park"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                  Detailed Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Opposite Lighthouse, Kamarajar Salai, Triplicane"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                  Meeting Point & Check-in Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Near Gandhi Statue - Look for the cyan THOURAM banner"
                  value={formData.meetingPoint}
                  onChange={(e) => setFormData({ ...formData, meetingPoint: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Duties & Quotas Breakdown */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              {/* Capacity Banner */}
              <div className="bg-[#e7eefb] border border-[#9ed5e4] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-xs font-bold text-[#004653] uppercase tracking-wider">
                    Automated Capacity & Standby Engine
                  </p>
                  <p className="text-xs text-[#40484b] mt-0.5">
                    THOURAM automatically calculates and promotes standby reserves if confirmed volunteers withdraw.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-center px-3 py-1 bg-white rounded-xl shadow-xs border border-[#9ed5e4]">
                    <span className="block text-lg font-black text-[#004653]">{totalVolunteersRequired}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Confirmed</span>
                  </div>
                  <div className="text-center px-3 py-1 bg-[#ffdcc2] rounded-xl shadow-xs border border-[#ffb98a]">
                    <span className="block text-lg font-black text-[#9e4600]">+{backupQuota}</span>
                    <span className="text-[10px] font-bold text-[#9e4600] uppercase">10% Waitlist</span>
                  </div>
                </div>
              </div>

              {/* Duty Track Cards */}
              <div className="space-y-4">
                {formData.duties.map((duty, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 relative space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[#004653] uppercase tracking-wider">
                        Duty Track #{idx + 1}
                      </span>
                      {formData.duties.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveDuty(idx)}
                          className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                          Duty Title *
                        </label>
                        <input
                          type="text"
                          value={duty.title}
                          onChange={(e) => handleDutyChange(idx, 'title', e.target.value)}
                          placeholder="e.g. Shoreline Waste Sorters"
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#004653]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                          Slots Needed *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          value={duty.volunteersRequired}
                          onChange={(e) => handleDutyChange(idx, 'volunteersRequired', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#004653]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                        Task Responsibilities
                      </label>
                      <input
                        type="text"
                        value={duty.description}
                        onChange={(e) => handleDutyChange(idx, 'description', e.target.value)}
                        placeholder="Brief summary of duties..."
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#004653]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                          Physical Intensity
                        </label>
                        <select
                          value={duty.physicalIntensity}
                          onChange={(e) => handleDutyChange(idx, 'physicalIntensity', e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs bg-white"
                        >
                          <option value="low">Low (Seated desk, check-ins)</option>
                          <option value="moderate">Moderate (Walking, sorting, guiding)</option>
                          <option value="high">High (Heavy lifting, outdoor terrain)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                          Target Skills (for 40% match algorithm)
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {COMMON_SKILLS.map((skill) => {
                            const isSelected = (duty.requiredSkills || []).includes(skill);
                            return (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => handleDutySkillToggle(idx, skill)}
                                className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition-colors ${
                                  isSelected
                                    ? 'bg-[#004653] text-white border-[#004653]'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-[#004653]'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}{skill}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddDuty}
                className="w-full py-2.5 border-2 border-dashed border-[#004653]/40 text-[#004653] hover:bg-[#e7eefb] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Add Another Duty Track
              </button>
            </div>
          )}

          {/* STEP 4: Safety & Guidelines */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                  General Volunteer Instructions
                </label>
                <textarea
                  rows={2}
                  value={formData.volunteerInstructions}
                  onChange={(e) => setFormData({ ...formData, volunteerInstructions: e.target.value })}
                  placeholder="e.g. Please wear breathable clothing and sneakers..."
                  className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                    What Volunteers Should Bring (comma separated)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.whatToBring}
                    onChange={(e) => setFormData({ ...formData, whatToBring: e.target.value })}
                    placeholder="Reusable water bottle, cap, sunscreen..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#141c25] uppercase tracking-wider mb-1.5">
                    Provided On-Site (comma separated)
                  </label>
                  <textarea
                    rows={2}
                    value={formData.providedOnSite}
                    onChange={(e) => setFormData({ ...formData, providedOnSite: e.target.value })}
                    placeholder="Gloves, trash bags, refreshments, first aid..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#c0c8cb] text-sm focus:outline-none focus:ring-2 focus:ring-[#004653]"
                  />
                </div>
              </div>

              <div className="bg-[#f8f9ff] border border-[#c0c8cb] p-4 rounded-2xl space-y-4">
                <span className="text-xs font-bold text-[#004653] uppercase tracking-wider block">
                  Safety & Emergency Preparedness
                </span>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="firstAid"
                    checked={formData.firstAidAvailable}
                    onChange={(e) => setFormData({ ...formData, firstAidAvailable: e.target.checked })}
                    className="w-4 h-4 rounded text-[#004653] focus:ring-[#004653]"
                  />
                  <label htmlFor="firstAid" className="text-xs font-medium text-gray-800">
                    Certified First Aid kit & designated volunteer responder available on-site
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                    On-Site Emergency Phone Contact
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#004653]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f2f4fc] border-t border-[#e1e9f6] p-4 sm:p-5 flex justify-between items-center shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-xs font-bold text-[#40484b] hover:text-[#004653] bg-white border border-gray-300 rounded-xl transition-colors"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-800 rounded-xl transition-colors"
            >
              Cancel
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-[#004653] hover:bg-[#245e6b] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Publish Event & Roster
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

