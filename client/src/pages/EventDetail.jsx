import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import QRCodeModal from '../components/QRCodeModal';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDutyId, setSelectedDutyId] = useState('');
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [passData, setPassData] = useState(null);

  useEffect(() => {
    fetchEvent();
  }, [id, user]);

  const fetchEvent = async () => {
    try {
      const res = await axios.get(`/api/v1/events/${id}`);
      if (res.data.success) {
        setEventData(res.data);
        if (res.data.event?.duties?.length > 0) {
          setSelectedDutyId(res.data.event.duties[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load event details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!user) {
      toast.error('Please log in or select demo volunteer to register!');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`/api/v1/events/${id}/apply`, {
        dutyId: selectedDutyId,
        motivation
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Registration recorded successfully!');
        await fetchEvent();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Application failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm('Are you sure you want to withdraw? Your spot will be automatically offered to the top waitlisted backup.')) {
      return;
    }

    try {
      const res = await axios.post(`/api/v1/events/${id}/withdraw`, {
        reason: 'Schedule change'
      });
      if (res.data.success) {
        toast.success('Withdrawn from event.');
        await fetchEvent();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  const handleOpenPass = async () => {
    try {
      const res = await axios.get(`/api/v1/attendance/events/${id}/pass`);
      if (res.data.success) {
        setPassData(res.data);
        setIsPassModalOpen(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not retrieve pass');
    }
  };

  if (loading || !eventData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-[#004653] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#40484b]">Loading Event Specifications...</p>
      </div>
    );
  }

  const { event, userAssignment, matchBreakdown } = eventData;
  const isConfirmed = userAssignment?.status === 'confirmed';
  const isWaitlisted = userAssignment?.status === 'waitlisted' || userAssignment?.isBackup;
  const isCheckedIn = ['checked-in', 'completed'].includes(userAssignment?.status);

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cover Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden h-72 sm:h-96 shadow-lg bg-gray-900 border border-[#c0c8cb]">
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1200'}
            alt={event.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badges in Top Left */}
          <div className="absolute top-6 left-6 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#004653] text-white text-xs font-bold shadow-md">
              {event.cause || 'Environmental Initiative'}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/90 text-[#004653] text-xs font-bold backdrop-blur-sm flex items-center gap-1 shadow-md">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              {event.community?.name}
            </span>
          </div>

          {/* Title & Core Date in Bottom Left */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <h1 className="font-headline font-extrabold text-2xl sm:text-4xl leading-tight text-white drop-shadow-sm max-w-4xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-white/90 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                {new Date(event.dateTime?.start).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                {new Date(event.dateTime?.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.dateTime?.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">location_on</span>
                {event.location?.venue || 'Marina Beach Promenade, Chennai'}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            {/* Description */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#c0c8cb]/60 shadow-sm space-y-4">
              <h2 className="font-headline font-bold text-xl text-[#141c25]">
                About This Initiative
              </h2>
              <p className="text-sm text-[#40484b] leading-relaxed whitespace-pre-line">
                {event.description}
              </p>

              {/* Tags */}
              {event.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {event.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full bg-[#f2f4fc] text-[#40484b] text-xs font-semibold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Duties Breakdown */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#c0c8cb]/60 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-headline font-bold text-xl text-[#141c25]">
                    Available Volunteer Duties & Teams
                  </h2>
                  <p className="text-xs text-[#40484b]">
                    Select your preferred task when applying.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#004653] bg-[#e7eefb] px-3 py-1 rounded-full">
                  {event.duties?.length || 1} Duties Defined
                </span>
              </div>

              <div className="space-y-4">
                {event.duties?.map((duty) => {
                  const isSelected = selectedDutyId === duty._id;
                  return (
                    <div
                      key={duty._id}
                      onClick={() => setSelectedDutyId(duty._id)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#004653] bg-[#f8f9ff] shadow-sm'
                          : 'border-[#e1e9f6] hover:border-[#c0c8cb] bg-white'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-headline font-bold text-base text-[#141c25]">
                              {duty.title}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-[#40484b]">
                              Intensity: {duty.physicalIntensity || 'Moderate'}
                            </span>
                          </div>
                          <p className="text-xs text-[#40484b] leading-relaxed">
                            {duty.description}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[#004653] whitespace-nowrap bg-[#e7eefb] px-2.5 py-1 rounded-lg">
                          {duty.volunteersConfirmed || 0} / {duty.volunteersRequired} filled
                        </span>
                      </div>

                      {/* Required Skills */}
                      {duty.requiredSkills?.length > 0 && (
                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f2f4fc]">
                          <span className="text-[11px] font-semibold text-[#40484b]">Skills:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {duty.requiredSkills.map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-[#d0e8d7] text-[#316e52] text-[11px] font-medium"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preparation & Safety Guidelines */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#c0c8cb]/60 shadow-sm space-y-6">
              <h2 className="font-headline font-bold text-xl text-[#141c25]">
                Logistics & Safety Guidelines
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e1e9f6] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#141c25]">
                    <span className="material-symbols-outlined text-[#004653]">backpack</span>
                    What to Bring
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[#40484b]">
                    {event.whatToBring?.length > 0 ? (
                      event.whatToBring.map((item, i) => <li key={i}>{item}</li>)
                    ) : (
                      <li>Reusable water bottle, comfortable walking shoes, sun protection.</li>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e1e9f6] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#141c25]">
                    <span className="material-symbols-outlined text-emerald-600">verified</span>
                    Provided on Site
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[#40484b]">
                    {event.providedOnSite?.length > 0 ? (
                      event.providedOnSite.map((item, i) => <li key={i}>{item}</li>)
                    ) : (
                      <li>Safety jackets, gloves, orientation manual, hydration refill.</li>
                    )}
                  </ul>
                </div>
              </div>

              {event.safety && (
                <div className="p-4 rounded-2xl bg-[#ffdcc2]/50 border border-[#8c5000]/20 text-xs space-y-1">
                  <p className="font-bold text-[#8c5000]">Emergency & Accessibility</p>
                  <p className="text-[#2e1500]/80">
                    Emergency Coordinator: {event.safety.emergencyContact || 'Event First Aid Team'}
                  </p>
                  <p className="text-[#2e1500]/80">
                    {event.safety.accessibilityNotes || 'Paved access points available for educational duties.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Registration & Roster Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Status & Registration Box */}
            <div className="bg-white p-6 rounded-3xl border border-[#c0c8cb]/60 shadow-lg space-y-5 sticky top-24">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#004653] uppercase tracking-wider">
                  Registration & Roster
                </span>
                <h3 className="font-headline font-bold text-xl text-[#141c25]">
                  Volunteer Slots
                </h3>
              </div>

              {/* Capacity Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#40484b]">Confirmed Volunteers:</span>
                  <span className="text-[#141c25]">
                    {event.capacity?.confirmed} / {event.capacity?.totalRequired}
                  </span>
                </div>
                <div className="w-full bg-[#e1e9f6] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#004653] h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ((event.capacity?.confirmed || 0) / (event.capacity?.totalRequired || 1)) * 100)}%`
                    }}
                  />
                </div>
                <p className="text-[11px] text-[#40484b] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-600">hourglass_top</span>
                  Standby Reserve: {event.capacity?.waitlisted || 0} / {event.capacity?.backupCount || 5} Backups
                </p>
              </div>

              {/* Transparent Match Score Widget */}
              {matchBreakdown && (
                <div className="p-4 bg-[#f8f9ff] rounded-2xl border border-[#e1e9f6] space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-[#141c25]">
                      Your Compatibility Score
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#d0e8d7] text-[#316e52]">
                      {matchBreakdown.totalScore}%
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-[#40484b] pt-1">
                    <div className="flex justify-between">
                      <span>Skills Match:</span>
                      <span className="font-semibold text-[#141c25]">{matchBreakdown.skillsScore} / 40 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Proximity ({matchBreakdown.distanceKm !== null ? `${matchBreakdown.distanceKm} km` : 'Local'}):</span>
                      <span className="font-semibold text-[#141c25]">{matchBreakdown.locationScore} / 20 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cause Interest:</span>
                      <span className="font-semibold text-[#141c25]">{matchBreakdown.interestScore} / 20 pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Reliability Track Record:</span>
                      <span className="font-semibold text-[#141c25]">{matchBreakdown.reliabilityScore} / 20 pts</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status or Action Buttons */}
              {userAssignment ? (
                <div className="space-y-3 pt-2">
                  {isConfirmed ? (
                    <div className="p-4 bg-[#d0e8d7]/70 rounded-2xl border border-[#316e52]/30 text-center space-y-3">
                      <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-[#316e52]">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        You are Confirmed for this Event!
                      </div>
                      <button
                        onClick={handleOpenPass}
                        className="w-full py-2.5 bg-[#004653] hover:bg-[#245e6b] text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                      >
                        Open QR Event Pass
                      </button>
                    </div>
                  ) : isWaitlisted ? (
                    <div className="p-4 bg-[#ffdcc2] rounded-2xl border border-[#8c5000]/30 text-center space-y-2">
                      <p className="text-xs font-bold text-[#8c5000]">
                        You are on the Standby Backup Waitlist
                      </p>
                      <p className="text-[11px] text-[#2e1500]/80">
                        Position #{userAssignment.waitlistPosition || 1}. If a confirmed volunteer withdraws, you will be promoted immediately.
                      </p>
                    </div>
                  ) : isCheckedIn ? (
                    <div className="p-4 bg-emerald-100 rounded-2xl text-center text-xs font-bold text-emerald-800">
                      Attendance Verified on Site
                    </div>
                  ) : null}

                  <button
                    onClick={handleWithdraw}
                    className="w-full py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Withdraw Registration
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-[#141c25] mb-1">
                      Optional Note / Availability
                    </label>
                    <textarea
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      placeholder="Share relevant experience or questions..."
                      className="w-full p-2.5 text-xs border border-[#c0c8cb] rounded-xl focus:outline-none focus:border-[#004653]"
                      rows={2}
                    />
                  </div>

                  <button
                    onClick={handleApply}
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#004653] hover:bg-[#245e6b] disabled:opacity-50 text-white font-headline font-bold text-sm rounded-2xl shadow-lg shadow-[#004653]/20 transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    {event.capacity?.confirmed >= event.capacity?.totalRequired
                      ? 'Join Standby Backup Waitlist'
                      : 'Register for Selected Duty'}
                  </button>

                  <p className="text-[11px] text-gray-500 text-center leading-tight">
                    By registering, you commit to upholding safety guidelines and on-site duty times.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Pass Modal */}
      <QRCodeModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        passData={passData}
      />
    </div>
  );
}
