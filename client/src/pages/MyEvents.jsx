import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import QRCodeModal from '../components/QRCodeModal';

export default function MyEvents() {
  const { user } = useAuth();
  const [tab, setTab] = useState('upcoming'); // 'upcoming', 'applications', 'waitlisted', 'completed'
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passData, setPassData] = useState(null);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  useEffect(() => {
    fetchMyEvents(tab);
  }, [tab]);

  const fetchMyEvents = async (selectedTab) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/volunteers/my-events?tab=${selectedTab}`);
      if (res.data.success) {
        setAssignments(res.data.assignments || []);
      }
    } catch (err) {
      console.error('Failed to load my events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPass = async (eventId) => {
    try {
      const res = await axios.get(`/api/v1/attendance/events/${eventId}/pass`);
      if (res.data.success) {
        setPassData(res.data);
        setIsPassModalOpen(true);
      }
    } catch (err) {}
  };

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#c0c8cb]/60 shadow-sm">
          <div>
            <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#141c25]">
              My Events & Service Record
            </h1>
            <p className="text-xs sm:text-sm text-[#40484b] mt-1">
              Track your upcoming engagements, active applications, standby waitlist status, and verified hours.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-[#f2f4fc] p-1 rounded-2xl text-xs font-semibold">
            {['upcoming', 'applications', 'waitlisted', 'completed'].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl capitalize transition-all ${
                  tab === t
                    ? 'bg-white text-[#004653] font-bold shadow-sm'
                    : 'text-[#40484b] hover:text-[#141c25]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* List of Assignments */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-32 bg-white rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#c0c8cb]/60 p-12 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-gray-400">
              event_busy
            </span>
            <h3 className="font-headline font-bold text-lg text-[#141c25]">
              No {tab} records found
            </h3>
            <p className="text-xs text-[#40484b]">
              Discover open volunteer opportunities and register to make an impact.
            </p>
            <Link
              to="/events"
              className="inline-block mt-2 px-5 py-2.5 bg-[#004653] text-white text-xs font-bold rounded-xl"
            >
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((a) => {
              const event = a.event;
              return (
                <div
                  key={a._id}
                  className="bg-white rounded-3xl p-6 border border-[#c0c8cb]/60 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={event?.imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=200'}
                      alt={event?.title}
                      className="w-20 h-20 rounded-2xl object-cover hidden sm:block border border-[#e1e9f6]"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[#004653] bg-[#e7eefb] px-2.5 py-0.5 rounded-full uppercase">
                          {event?.cause || 'Community Initiative'}
                        </span>
                        <span className="text-xs text-[#40484b]">
                          {event?.community?.name}
                        </span>
                      </div>

                      <Link
                        to={`/events/${event?._id}`}
                        className="font-headline font-bold text-lg text-[#141c25] hover:text-[#004653] transition-colors line-clamp-1"
                      >
                        {event?.title}
                      </Link>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#40484b]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                          {new Date(event?.dateTime?.start).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-[#004653]">
                          Duty: {a.dutyTitle || 'General Duty'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Status & Action */}
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-[#f2f4fc]">
                    <div className="text-right">
                      {a.status === 'confirmed' && (
                        <span className="px-3 py-1 bg-[#d0e8d7] text-[#316e52] text-xs font-bold rounded-full">
                          Confirmed Spot
                        </span>
                      )}
                      {a.status === 'waitlisted' && (
                        <span className="px-3 py-1 bg-[#ffdcc2] text-[#8c5000] text-xs font-bold rounded-full">
                          Standby Backup #{a.waitlistPosition || 1}
                        </span>
                      )}
                      {a.status === 'completed' && (
                        <div className="text-right">
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                            {a.verifiedHours || 4} Verified Hours
                          </span>
                        </div>
                      )}
                      {a.status === 'assigned' && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
                          Pending Invitation
                        </span>
                      )}
                    </div>

                    {['confirmed', 'checked-in'].includes(a.status) && (
                      <button
                        onClick={() => handleOpenPass(event?._id)}
                        className="px-4 py-2 bg-[#004653] hover:bg-[#245e6b] text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">qr_code</span>
                        QR Pass
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <QRCodeModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        passData={passData}
      />
    </div>
  );
}
