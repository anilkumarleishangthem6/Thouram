import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import EventCard from '../components/EventCard';

export default function LandingPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      const res = await axios.get('/api/v1/events?limit=6');
      if (res.data.success) {
        setEvents(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch featured events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e7eefb]/70 via-[#f8f9ff] to-[#f8f9ff] pt-12 pb-20 md:pt-16 md:pb-28 border-b border-[#e1e9f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline and Call-to-Actions */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Pan-India Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d0e8d7] text-[#316e52] border border-[#316e52]/20 text-xs font-bold tracking-wide">
                <span className="material-symbols-outlined text-[16px]">hub</span>
                EMPOWERING COMMUNITY COLLABORATION • PAN-INDIA
              </div>

              {/* Main Headline */}
              <h1 className="font-headline font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#141c25] tracking-tight leading-[1.15]">
                Mobilize, coordinate, and measure{' '}
                <span className="text-[#004653] underline decoration-[#9ed5e4] decoration-4 underline-offset-4">
                  real community impact.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#40484b] max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                THOURAM is a purpose-built platform for volunteer mobilization, transparent duty matching, automated backup rosters, and verified hours tracking for local causes across India.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/events"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#004653] hover:bg-[#245e6b] text-white font-headline font-bold text-base shadow-lg shadow-[#004653]/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">search</span>
                  Volunteer at an Event
                </Link>

                <Link
                  to="/organizer-hub"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-[#f2f4fc] text-[#004653] border-2 border-[#004653] font-headline font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  Host an Event
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#40484b]">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                  Verified NGOs & Collectives
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[#004653] text-[18px]">qr_code_scanner</span>
                  QR Attendance Passes
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-amber-600 text-[18px]">hourglass_top</span>
                  10% Auto-Reserve Backups
                </div>
              </div>
            </div>

            {/* Right Column: Realistic Mobile Phone Preview of THOURAM App */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-[310px] sm:w-[340px] bg-gray-900 rounded-[48px] p-3 shadow-2xl border-4 border-gray-800 ring-1 ring-gray-950/50">
                {/* Phone Speaker & Camera Notch */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-4 bg-gray-900 rounded-full z-20 flex items-center justify-center">
                  <div className="w-12 h-1 bg-gray-700 rounded-full" />
                  <div className="w-2.5 h-2.5 bg-gray-800 rounded-full ml-3 ring-1 ring-gray-700" />
                </div>

                {/* Inner Screen Container */}
                <div className="bg-[#f8f9ff] rounded-[38px] overflow-hidden border border-gray-200 h-[600px] flex flex-col relative text-left">
                  {/* Mobile Top Bar */}
                  <div className="pt-7 px-4 pb-2 bg-white border-b border-[#e1e9f6] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#004653] flex items-center justify-center text-white text-[10px] font-bold">
                        T
                      </div>
                      <span className="font-headline font-extrabold text-xs text-[#004653]">THOURAM</span>
                    </div>
                    <span className="material-symbols-outlined text-[18px] text-[#40484b]">notifications</span>
                  </div>

                  {/* Mobile Search Bar & Category Pills */}
                  <div className="p-3 bg-white space-y-2 border-b border-[#f2f4fc]">
                    <div className="bg-[#f2f4fc] rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] text-gray-500">
                      <span className="material-symbols-outlined text-[14px]">search</span>
                      <span>Find events in India...</span>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto no-scrollbar text-[10px] font-bold">
                      <span className="bg-[#004653] text-white px-2.5 py-0.5 rounded-full">All</span>
                      <span className="bg-[#e7eefb] text-[#004653] px-2.5 py-0.5 rounded-full">Tech</span>
                      <span className="bg-[#d0e8d7] text-[#316e52] px-2.5 py-0.5 rounded-full">Eco</span>
                      <span className="bg-[#ffdcc2] text-[#8c5000] px-2.5 py-0.5 rounded-full">Arts</span>
                      <span className="bg-[#f2f4fc] text-[#40484b] px-2.5 py-0.5 rounded-full">Relief</span>
                    </div>
                  </div>

                  {/* Scrollable Event Feed inside Mobile Screen */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {/* Mobile Card 1 */}
                    <div className="bg-white rounded-2xl border border-[#e1e9f6] p-2.5 shadow-sm space-y-1.5">
                      <div className="relative h-20 rounded-xl overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&q=80&w=400"
                          alt="Clean Coast"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-[#004653]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Environment
                        </span>
                        <span className="absolute top-1.5 right-1.5 bg-[#d0e8d7] text-[#316e52] text-[9px] font-bold px-1.5 py-0.5 rounded">
                          98% Match
                        </span>
                      </div>
                      <p className="font-bold text-[11px] text-[#141c25] leading-tight line-clamp-1">
                        Clean Coast Community Drive
                      </p>
                      <p className="text-[10px] text-[#40484b]">Chennai • 50/50 Confirmed (+5 Backups)</p>
                      <div className="w-full bg-[#e1e9f6] rounded-full h-1.5">
                        <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>

                    {/* Mobile Card 2 */}
                    <div className="bg-white rounded-2xl border border-[#e1e9f6] p-2.5 shadow-sm space-y-1.5">
                      <div className="relative h-20 rounded-xl overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=400"
                          alt="Tech Fest"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-[#004653]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Tech & Education
                        </span>
                        <span className="absolute top-1.5 right-1.5 bg-[#d0e8d7] text-[#316e52] text-[9px] font-bold px-1.5 py-0.5 rounded">
                          92% Match
                        </span>
                      </div>
                      <p className="font-bold text-[11px] text-[#141c25] leading-tight line-clamp-1">
                        Future Skills Tech Fest 2026
                      </p>
                      <p className="text-[10px] text-[#40484b]">Bengaluru • 20/25 Filled</p>
                      <div className="w-full bg-[#e1e9f6] rounded-full h-1.5">
                        <div className="bg-[#004653] h-1.5 rounded-full" style={{ width: '80%' }} />
                      </div>
                    </div>

                    {/* Mobile Card 3 */}
                    <div className="bg-white rounded-2xl border border-[#e1e9f6] p-2.5 shadow-sm space-y-1.5">
                      <div className="relative h-20 rounded-xl overflow-hidden">
                        <img
                          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400"
                          alt="Digital Literacy"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-[#004653]/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Education
                        </span>
                      </div>
                      <p className="font-bold text-[11px] text-[#141c25] leading-tight line-clamp-1">
                        Digital Literacy Drive
                      </p>
                      <p className="text-[10px] text-[#40484b]">Pune • 15/20 Filled</p>
                    </div>
                  </div>

                  {/* Mobile Bottom Navigation Bar */}
                  <div className="bg-white border-t border-[#e1e9f6] py-2 px-4 flex justify-between items-center text-[#40484b]">
                    <div className="flex flex-col items-center text-[#004653]">
                      <span className="material-symbols-outlined text-[18px]">explore</span>
                      <span className="text-[9px] font-bold">Explore</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-[18px]">badge</span>
                      <span className="text-[9px]">Pass</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-[18px]">assignment</span>
                      <span className="text-[9px]">Roster</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="material-symbols-outlined text-[18px]">account_circle</span>
                      <span className="text-[9px]">Profile</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple "How It Works" Section (Mandated by Priority 2) */}
      <section className="py-16 bg-white border-b border-[#e1e9f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-[#004653] uppercase tracking-wider">
              Step-by-Step Experience
            </span>
            <h2 className="font-headline font-bold text-3xl text-[#141c25] tracking-tight">
              How THOURAM Works
            </h2>
            <p className="text-xs sm:text-sm text-[#40484b]">
              A modern, reliable pipeline connecting community volunteers and verified organizations with zero friction.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#f8f9ff] border border-[#e1e9f6] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#004653] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-headline font-bold text-base text-[#141c25]">
                Discover & Match
              </h3>
              <p className="text-xs text-[#40484b] leading-relaxed">
                Browse nationwide community initiatives. Algorithmic compatibility scoring ranks events by verified skills, proximity, and causes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8f9ff] border border-[#e1e9f6] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#004653] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-headline font-bold text-base text-[#141c25]">
                Confirmed or Standby
              </h3>
              <p className="text-xs text-[#40484b] leading-relaxed">
                Confirm your slot instantly or join the automated 10% standby backup pool. If a confirmed volunteer withdraws, backups are promoted automatically.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8f9ff] border border-[#e1e9f6] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#004653] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-headline font-bold text-base text-[#141c25]">
                Check In with QR Pass
              </h3>
              <p className="text-xs text-[#40484b] leading-relaxed">
                Arrive on site and flash your encrypted digital event pass. Organizers verify attendance in seconds using live mobile scanning.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#f8f9ff] border border-[#e1e9f6] space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#004653] text-white flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-headline font-bold text-base text-[#141c25]">
                Verified Hours & Rating
              </h3>
              <p className="text-xs text-[#40484b] leading-relaxed">
                Organizers close out events with separate Reliability and Work Quality feedback, building your permanent verified community service portfolio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Community Events (Multiple Pan-India Events Grid) */}
      <section className="py-16 bg-[#f8f9ff] border-b border-[#e1e9f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <span className="text-xs font-bold text-[#004653] uppercase tracking-wider">
                Active Mobilizations
              </span>
              <h2 className="font-headline font-bold text-3xl text-[#141c25] mt-1">
                Featured Community Initiatives
              </h2>
              <p className="text-xs text-[#40484b] mt-1">
                Verified causes in Bengaluru, Chennai, Pune, Mumbai, New Delhi, and Hyderabad.
              </p>
            </div>
            <Link
              to="/events"
              className="text-xs sm:text-sm font-bold text-[#004653] hover:text-[#245e6b] flex items-center gap-1 group"
            >
              Explore all active initiatives
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-80 bg-white rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* "Past Events / Community Impact" Section (Supports Hackathon Photo & Details) */}
      <section className="py-16 bg-white border-b border-[#e1e9f6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Hackathon Photo Showcase with Clean Replaceable Placeholder Frame */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-[#c0c8cb]/60 bg-gray-100 group">
                <img
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200"
                  alt="Community volunteers at Green Urban Canopy Drive"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 shadow-md">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    Completed & Closeout Verified
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                    Community Impact Showcase
                  </p>
                  <h4 className="font-headline font-bold text-lg text-white">
                    Green Urban Canopy Drive — Bengaluru
                  </h4>
                  <p className="text-xs text-white/90 mt-0.5">
                    15 Volunteers • 67.5 Verified Service Hours • 120 Native Trees Established
                  </p>
                </div>
              </div>

              {/* Verified Feedback Floating Tag */}
              <div className="absolute -bottom-5 -right-3 sm:right-6 bg-white rounded-2xl p-4 shadow-lg border border-[#c0c8cb]/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#d0e8d7] flex items-center justify-center text-[#316e52]">
                  <span className="material-symbols-outlined text-[20px]">grade</span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#141c25]">5.0 ★ Dual Performance</p>
                  <p className="text-[10px] text-[#40484b]">Reliability: 5/5 • Work Quality: 5/5</p>
                </div>
              </div>
            </div>

            {/* Impact Metrics and Testimonial Details */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#004653] uppercase tracking-wider">
                  Verified Track Record
                </span>
                <h2 className="font-headline font-bold text-3xl text-[#141c25] tracking-tight">
                  Documenting transparent community milestones
                </h2>
                <p className="text-xs sm:text-sm text-[#40484b] leading-relaxed">
                  Every closed event on THOURAM publishes auditable attendance logs and dual-criteria ratings. Volunteers build an indisputable service portfolio while communities measure genuine grassroots impact.
                </p>
              </div>

              {/* Highlights List */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#f8f9ff] border border-[#e1e9f6] flex items-start gap-3">
                  <span className="material-symbols-outlined text-[#004653] text-[20px] mt-0.5">check_circle</span>
                  <div>
                    <h5 className="font-bold text-xs text-[#141c25]">Tamper-Resistant QR Attendance</h5>
                    <p className="text-[11px] text-[#40484b]">Eliminates paper rosters with AES-encrypted volunteer pass verification.</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f8f9ff] border border-[#e1e9f6] flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px] mt-0.5">check_circle</span>
                  <div>
                    <h5 className="font-bold text-xs text-[#141c25]">Separate Reliability vs Quality Evaluation</h5>
                    <p className="text-[11px] text-[#40484b]">Distinguishes shift adherence from manual execution quality for fair assessments.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/events"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#004653] hover:bg-[#245e6b] text-white font-bold text-xs shadow-md transition-colors"
                >
                  Join a Community Drive Today
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pan-India Verified Statistics Section */}
      <section className="py-16 bg-[#004653] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="font-headline font-extrabold text-4xl text-[#9ed5e4]">1,850+</p>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">
                Volunteers Mobilized
              </p>
            </div>
            <div>
              <p className="font-headline font-extrabold text-4xl text-[#9ed5e4]">8,400+</p>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">
                Verified Impact Hours
              </p>
            </div>
            <div>
              <p className="font-headline font-extrabold text-4xl text-[#9ed5e4]">98%</p>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">
                Attendance Reliability
              </p>
            </div>
            <div>
              <p className="font-headline font-extrabold text-4xl text-[#9ed5e4]">42+</p>
              <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-semibold">
                Active City Hubs
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
