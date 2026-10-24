import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventCard from '../components/EventCard';

export default function ExploreEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCause, setSelectedCause] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isVirtual, setIsVirtual] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  const causes = [
    'All Causes',
    'Technology and Education',
    'Education and Community Development',
    'Environment',
    'Music and Fundraising',
    'Arts and Culture',
    'Social Welfare'
  ];
  const cities = ['All Cities', 'Bengaluru', 'Chennai', 'Pune', 'Mumbai', 'New Delhi', 'Hyderabad'];
  const skills = [
    'All Skills',
    'Digital Training',
    'Beach Cleanup',
    'Crowd Guidance',
    'First Aid',
    'Mentorship',
    'Logistics Support',
    'Food Prep'
  ];

  useEffect(() => {
    fetchEvents();
  }, [search, selectedCause, selectedCity, isVirtual, selectedSkill]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCause && selectedCause !== 'All Causes') params.append('cause', selectedCause);
      if (selectedCity && selectedCity !== 'All Cities') params.append('city', selectedCity);
      if (selectedSkill && selectedSkill !== 'All Skills') params.append('skill', selectedSkill);
      if (isVirtual) params.append('isVirtual', isVirtual);

      const res = await axios.get(`/api/v1/events?${params.toString()}`);
      if (res.data.success) {
        setEvents(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e7eefb] text-[#004653] text-xs font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[15px]">explore</span>
            Community Event Discovery
          </div>
          <h1 className="font-headline font-extrabold text-3xl sm:text-4xl text-[#141c25]">
            Discover Meaningful Local Causes
          </h1>
          <p className="text-xs sm:text-sm text-[#40484b]">
            Browse grassroots initiatives across Bengaluru, Chennai, Pune, Mumbai, New Delhi, and Hyderabad with real-time quota and backup standby tracking.
          </p>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white p-6 rounded-3xl border border-[#c0c8cb]/60 shadow-sm space-y-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-3.5 text-gray-400">
              search
            </span>
            <input
              type="text"
              placeholder="Search by event title, city, or cause category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#f8f9ff] border border-[#e1e9f6] rounded-2xl text-xs sm:text-sm focus:outline-none focus:border-[#004653] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Cause Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#40484b] uppercase mb-1">
                Cause Category
              </label>
              <select
                value={selectedCause}
                onChange={(e) => setSelectedCause(e.target.value)}
                className="w-full p-2.5 bg-[#f8f9ff] border border-[#e1e9f6] rounded-xl text-xs focus:outline-none focus:border-[#004653]"
              >
                {causes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#40484b] uppercase mb-1">
                Location / City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full p-2.5 bg-[#f8f9ff] border border-[#e1e9f6] rounded-xl text-xs focus:outline-none focus:border-[#004653]"
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Skill Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#40484b] uppercase mb-1">
                Required Skill
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="w-full p-2.5 bg-[#f8f9ff] border border-[#e1e9f6] rounded-xl text-xs focus:outline-none focus:border-[#004653]"
              >
                {skills.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Event Mode */}
            <div>
              <label className="block text-[11px] font-bold text-[#40484b] uppercase mb-1">
                Event Format
              </label>
              <select
                value={isVirtual}
                onChange={(e) => setIsVirtual(e.target.value)}
                className="w-full p-2.5 bg-[#f8f9ff] border border-[#e1e9f6] rounded-xl text-xs focus:outline-none focus:border-[#004653]"
              >
                <option value="">All Formats</option>
                <option value="false">On-Site & In-Person</option>
                <option value="true">Virtual / Remote</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex justify-between items-center text-xs text-[#40484b]">
          <span>Found <strong className="text-[#141c25]">{events.length}</strong> active initiatives</span>
          {(search || selectedCause || selectedCity || selectedSkill || isVirtual) && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCause('');
                setSelectedCity('');
                setSelectedSkill('');
                setIsVirtual('');
              }}
              className="text-[#004653] font-semibold hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-white rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#c0c8cb]/60 p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-gray-400">
              search_off
            </span>
            <h3 className="font-headline font-bold text-lg text-[#141c25]">
              No events matched your search criteria
            </h3>
            <p className="text-xs text-[#40484b]">
              Try adjusting your cause category or clearing keyword search filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
