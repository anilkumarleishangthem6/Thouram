import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import QRCodeModal from '../components/QRCodeModal';
import EventCard from '../components/EventCard';

export default function VolunteerDashboard() {
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/v1/volunteers/dashboard');
      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load volunteer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPass = async (eventId) => {
    try {
      const res = await axios.get(`/api/v1/attendance/events/${eventId}/pass`);
      if (res.data.success) {
        setSelectedPass(res.data);
        setIsQRModalOpen(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load event pass');
    }
  };

  const handleWithdraw = async (eventId) => {
    if (!window.confirm('Are you sure you want to withdraw from this event? Your spot will be automatically offered to the top waitlisted backup.')) {
      return;
    }

    setWithdrawingId(eventId);
    try {
      const res = await axios.post(`/api/v1/events/${eventId}/withdraw`, {
        reason: 'Personal schedule change'
      });
      if (res.data.success) {
        toast.success('Successfully withdrawn. Top backup has been promoted!');
        await fetchDashboard();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw');
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleAcceptPromotion = async (assignmentId) => {
    try {
      const res = await axios.post(`/api/v1/roster/accept-promotion/${assignmentId}`);
      if (res.data.success) {
        toast.success('Congratulations! You are now confirmed for the event.');
        await fetchDashboard();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept promotion');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-[#004653] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#40484b]">Loading Volunteer Portal...</p>
      </div>
    );
  }

  const { metrics, upcomingAssignments = [], waitlisted = [], completedAssignments = [], recommendedEvents = [] } = dashboardData || {};
  const activeAssignment = upcomingAssignments[0];

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header & Metrics Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-[#c0c8cb]/60 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#004653] uppercase tracking-wider bg-[#e7eefb] px-2.5 py-0.5 rounded-full">
                Volunteer Portal
              </span>
              <span className="text-xs text-[#40484b]">• National Community Hub</span>
            </div>
            <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#141c25]">
              Welcome back, {user?.name || 'Volunteer'}
            </h1>
            <p className="text-xs sm:text-sm text-[#40484b] mt-1">
              Your service record, active passes, and recommended causes are synchronized.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Link
              to="/profile"
              className="px-4 py-2.5 bg-white hover:bg-[#e7eefb] text-[#004653] text-xs font-bold rounded-xl border border-[#004653] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              Skills & Preferences
            </Link>
            <Link
              to="/events"
              className="px-4 py-2.5 bg-[#004653] hover:bg-[#245e6b] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">travel_explore</span>
              Find Events
            </Link>
            <Link
              to="/my-events"
              className="px-4 py-2.5 bg-[#f2f4fc] hover:bg-[#e7eefb] text-[#004653] text-xs font-bold rounded-xl border border-[#c0c8cb]/60 transition-colors"
            >
              My Full History
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#c0c8cb]/60 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#d0e8d7] text-[#316e52] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">schedule</span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold text-[#141c25]">
                {metrics?.verifiedHoursTotal || 64}h
              </p>
              <p className="text-[11px] font-semibold text-[#40484b] uppercase tracking-wider">
                Verified Service Hours
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#c0c8cb]/60 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#e7eefb] text-[#004653] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">task_alt</span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold text-[#141c25]">
                {metrics?.eventsCompleted || 14}
              </p>
              <p className="text-[11px] font-semibold text-[#40484b] uppercase tracking-wider">
                Completed Events
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#c0c8cb]/60 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#ffdcc2] text-[#8c5000] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">verified</span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold text-[#141c25]">
                {metrics?.reliabilityScore || 98}%
              </p>
              <p className="text-[11px] font-semibold text-[#40484b] uppercase tracking-wider">
                Reliability Score
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#c0c8cb]/60 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">grade</span>
            </div>
            <div>
              <p className="text-2xl font-headline font-extrabold text-[#141c25]">
                {metrics?.ratingAverage || 4.9} ★
              </p>
              <p className="text-[11px] font-semibold text-[#40484b] uppercase tracking-wider">
                Work Quality Rating
              </p>
            </div>
          </div>
        </div>

        {/* Waitlist Promotion Banner if present */}
        {waitlisted.some(w => w.status === 'assigned') && (
          <div className="bg-[#ffdcc2] border border-[#8c5000]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#8c5000] text-3xl">celebration</span>
              <div>
                <p className="text-sm font-bold text-[#2e1500]">
                  Backup Promotion Notice!
                </p>
                <p className="text-xs text-[#2e1500]/80">
                  A spot opened up for "{waitlisted.find(w => w.status === 'assigned')?.event?.title}". Please confirm your spot.
                </p>
              </div>
            </div>
            <button
              onClick={() => handleAcceptPromotion(waitlisted.find(w => w.status === 'assigned')._id)}
              className="px-4 py-2 bg-[#8c5000] hover:bg-[#6e3f00] text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
            >
              Accept & Confirm Spot
            </button>
          </div>
        )}

        {/* Active Event Pass Section */}
        {activeAssignment ? (
          <div className="bg-white rounded-3xl border border-[#c0c8cb]/60 overflow-hidden shadow-md">
            <div className="bg-gradient-to-r from-[#004653] to-[#245e6b] text-white p-6 sm:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9ed5e4] text-[#004653] text-xs font-bold uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-[#004653] animate-pulse" />
                  Upcoming Confirmed Event
                </div>
                <h2 className="font-headline font-bold text-2xl sm:text-3xl leading-tight">
                  {activeAssignment.event?.title}
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/90 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                    {new Date(activeAssignment.event?.dateTime?.start).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                    {activeAssignment.event?.location?.venue || 'Marina Beach Promenade, Chennai'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <button
                  onClick={() => handleOpenPass(activeAssignment.event?._id)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#f8f9ff] text-[#004653] font-headline font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                  Open Event Pass (QR)
                </button>
                <button
                  onClick={() => handleWithdraw(activeAssignment.event?._id)}
                  disabled={withdrawingId === activeAssignment.event?._id}
                  className="w-full sm:w-auto px-4 py-3.5 bg-red-500/20 hover:bg-red-500/30 text-white font-medium text-xs rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  Withdraw
                </button>
              </div>
            </div>

            {/* Event Details Grid inside Pass */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#f8f9ff]">
              <div className="bg-white p-4 rounded-2xl border border-[#e1e9f6]">
                <p className="text-[11px] font-bold text-[#40484b] uppercase tracking-wider mb-1">
                  Your Assigned Duty
                </p>
                <p className="text-base font-bold text-[#004653]">
                  {activeAssignment.dutyTitle || 'Shoreline Plastic Segregation'}
                </p>
                <p className="text-xs text-[#40484b] mt-1">
                  Team: <span className="font-semibold text-[#141c25]">{activeAssignment.team || 'Coastal Squad Alpha'}</span>
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e1e9f6]">
                <p className="text-[11px] font-bold text-[#40484b] uppercase tracking-wider mb-1">
                  Check-In Window
                </p>
                <p className="text-base font-bold text-[#141c25]">
                  Opens 45m before start
                </p>
                <p className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  Ready for Scanner
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e1e9f6]">
                <p className="text-[11px] font-bold text-[#40484b] uppercase tracking-wider mb-1">
                  Meeting Point
                </p>
                <p className="text-base font-bold text-[#141c25]">
                  Lighthouse Plaza Desk
                </p>
                <p className="text-xs text-[#40484b] mt-1">
                  Coordinator: Priya Sharma
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#c0c8cb]/60 p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#e7eefb] text-[#004653] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">event_available</span>
            </div>
            <h3 className="font-headline font-bold text-xl text-[#141c25]">
              No Confirmed Upcoming Events
            </h3>
            <p className="text-xs text-[#40484b] max-w-md mx-auto">
              Explore open community initiatives matching your skills and join local volunteers in making an impact!
            </p>
            <Link
              to="/events"
              className="inline-block px-6 py-2.5 bg-[#004653] text-white text-xs font-bold rounded-xl"
            >
              Browse Open Events
            </Link>
          </div>
        )}

        {/* Recommended Events Section with Match Score Breakdown */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-headline font-bold text-xl text-[#141c25]">
                Recommended for You
              </h3>
              <p className="text-xs text-[#40484b]">
                Matched against your registered skills, travel radius ({profile?.travelRadiusKm || 35} km), and interests.
              </p>
            </div>
            <Link to="/events" className="text-xs font-bold text-[#004653] hover:underline">
              See All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                matchScore={event.matchScore}
              />
            ))}
          </div>
        </div>
      </div>

      {/* QR Code Pass Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        passData={selectedPass}
      />
    </div>
  );
}
