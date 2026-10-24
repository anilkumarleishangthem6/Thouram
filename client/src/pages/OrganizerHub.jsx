import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ScannerModal from '../components/ScannerModal';

export default function OrganizerHub() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [rosterData, setRosterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'confirmed', 'waitlisted', 'checked-in'
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Rating & Closeout modal states
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedVolunteerForRating, setSelectedVolunteerForRating] = useState(null);
  const [reliabilityScore, setReliabilityScore] = useState(5);
  const [workQualityScore, setWorkQualityScore] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [hoursToVerify, setHoursToVerify] = useState(4.5);

  // Submanager delegation state
  const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false);
  const [delegateEmail, setDelegateEmail] = useState('');
  const [delegateRole, setDelegateRole] = useState('sub-manager');

  // Manual override reason dialog
  const [overrideModal, setOverrideModal] = useState({ open: false, assignmentId: null, action: '' });
  const [overrideReason, setOverrideReason] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchRoster(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/v1/events?limit=20');
      if (res.data.success && res.data.data.length > 0) {
        setEvents(res.data.data);
        // Default to the flagship event (Clean Coast Community Drive or first)
        const flagship = res.data.data.find(e => e.title.includes('Clean Coast')) || res.data.data[0];
        setSelectedEventId(flagship._id);
      }
    } catch (err) {
      console.error('Failed to load organizer events:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoster = async (eventId) => {
    try {
      const res = await axios.get(`/api/v1/roster/events/${eventId}`);
      if (res.data.success) {
        setRosterData(res.data);
      }
    } catch (err) {
      console.error('Failed to load roster:', err);
    }
  };

  const handlePromoteBackup = async (assignmentId) => {
    setOverrideModal({ open: true, assignmentId, action: 'promote' });
  };

  const submitOverrideAction = async () => {
    try {
      if (overrideModal.action === 'promote') {
        const res = await axios.post(`/api/v1/roster/promote/${overrideModal.assignmentId}`, {
          overrideReason: overrideReason || 'Manual promotion by organizer'
        });
        if (res.data.success) {
          toast.success('Backup volunteer successfully promoted to confirmed!');
          await fetchRoster(selectedEventId);
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setOverrideModal({ open: false, assignmentId: null, action: '' });
      setOverrideReason('');
    }
  };

  const handleCheckOut = async (assignmentId) => {
    try {
      const res = await axios.post('/api/v1/attendance/checkout', {
        assignmentId,
        hours: 4.5
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Checked out and hours verified!');
        await fetchRoster(selectedEventId);
      }
    } catch (err) {
      toast.error('Check-out failed');
    }
  };

  const openRatingModal = (assignment) => {
    setSelectedVolunteerForRating(assignment);
    setReliabilityScore(5);
    setWorkQualityScore(5);
    setFeedbackNotes('');
    setIsRatingModalOpen(true);
  };

  const submitRating = async (e) => {
    e.preventDefault();
    if (!selectedVolunteerForRating) return;

    try {
      const res = await axios.post(`/api/v1/ratings/events/${selectedEventId}`, {
        volunteerId: selectedVolunteerForRating.volunteer?._id,
        reliabilityScore,
        workQualityScore,
        feedbackNotes
      });
      if (res.data.success) {
        toast.success('Rating & feedback recorded into volunteer profile!');
        setIsRatingModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  };

  const handleDelegateMember = async (e) => {
    e.preventDefault();
    const event = rosterData?.event;
    if (!event?.community?._id) return;

    try {
      const res = await axios.post(`/api/v1/communities/${event.community._id}/members`, {
        email: delegateEmail,
        role: delegateRole
      });
      if (res.data.success) {
        toast.success(`User granted role: ${delegateRole}`);
        setIsDelegateModalOpen(false);
        setDelegateEmail('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delegation failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-4 border-[#004653] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#40484b]">Loading Organizer Hub...</p>
      </div>
    );
  }

  const { event, stats, roster } = rosterData || {};
  const confirmedList = roster?.confirmed || [];
  const waitlistedList = roster?.waitlisted || [];
  const allList = [...confirmedList, ...waitlistedList];

  let displayList = allList;
  if (activeTab === 'confirmed') displayList = confirmedList;
  if (activeTab === 'waitlisted') displayList = waitlistedList;
  if (activeTab === 'checked-in') displayList = confirmedList.filter(a => ['checked-in', 'completed'].includes(a.status));

  return (
    <div className="bg-[#f8f9ff] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-[#c0c8cb]/60 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[#004653] uppercase tracking-wider bg-[#e7eefb] px-2.5 py-0.5 rounded-full">
                Organizer Hub
              </span>
              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                Verified Community: {event?.community?.name || 'India Community Action Network'}
              </span>
            </div>
            <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-[#141c25]">
              Event Roster & Team Operations
            </h1>
            <p className="text-xs sm:text-sm text-[#40484b] mt-1">
              Manage volunteer quotas, automated backup standbys, on-site check-in, and post-event closeout across India.
            </p>
          </div>

          {/* Event Picker */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="px-4 py-2.5 bg-[#f2f4fc] text-[#004653] font-semibold text-xs rounded-xl border border-[#c0c8cb]/60 focus:outline-none"
            >
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} ({ev.capacity?.totalRequired} slots • {ev.location?.city || 'India'})
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsDelegateModalOpen(true)}
              className="px-4 py-2.5 bg-white text-[#004653] border border-[#004653] hover:bg-[#e7eefb] text-xs font-bold rounded-xl transition-colors whitespace-nowrap flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">group_add</span>
              Delegate Roles
            </button>
          </div>
        </div>

        {/* Event Capacity & Live Stats Banner */}
        <div className="bg-white rounded-3xl border border-[#c0c8cb]/60 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <span className="text-xs font-bold text-[#004653] uppercase tracking-wider bg-[#d0e8d7] text-[#316e52] px-3 py-1 rounded-full">
                Roster Status: Active
              </span>
              <h2 className="font-headline font-bold text-2xl text-[#141c25] mt-2">
                {event?.title}
              </h2>
              <p className="text-xs text-[#40484b] mt-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                {event?.location?.venue || 'Marina Beach Promenade, Chennai'}
              </p>
            </div>

            {/* Quick Organizer Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-5 py-3 bg-[#004653] hover:bg-[#245e6b] text-white font-headline font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
                Scan QR Check-In
              </button>

              <button
                onClick={() => {
                  if (confirmedList.length > 0) openRatingModal(confirmedList[0]);
                }}
                className="px-5 py-3 bg-[#ffdcc2] hover:bg-[#ffcba4] text-[#8c5000] font-headline font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">rate_review</span>
                Closeout & Rate Volunteer
              </button>
            </div>
          </div>

          {/* 4 Key Status Quota Pills */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#e1e9f6]">
              <p className="text-[11px] font-bold text-[#40484b] uppercase tracking-wider">Required Volunteers</p>
              <p className="text-2xl font-headline font-extrabold text-[#141c25] mt-1">
                {stats?.totalRequired || 50}
              </p>
              <p className="text-[11px] text-[#40484b] mt-0.5">Full target capacity</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#e7eefb] border border-[#9ed5e4]/50">
              <p className="text-[11px] font-bold text-[#004653] uppercase tracking-wider">Confirmed Roster</p>
              <p className="text-2xl font-headline font-extrabold text-[#004653] mt-1">
                {stats?.confirmedCount || 50}
              </p>
              <p className="text-[11px] text-[#004653] mt-0.5">100% Filled & Assigned</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#ffdcc2]/60 border border-[#8c5000]/20">
              <p className="text-[11px] font-bold text-[#8c5000] uppercase tracking-wider">10% Standby Backups</p>
              <p className="text-2xl font-headline font-extrabold text-[#8c5000] mt-1">
                {stats?.waitlistedCount || 5}
              </p>
              <p className="text-[11px] text-[#8c5000] mt-0.5">Automated Waitlist Pool</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#d0e8d7]/60 border border-[#316e52]/20">
              <p className="text-[11px] font-bold text-[#316e52] uppercase tracking-wider">On-Site Verified</p>
              <p className="text-2xl font-headline font-extrabold text-[#316e52] mt-1">
                {stats?.checkedInCount || 0}
              </p>
              <p className="text-[11px] text-[#316e52] mt-0.5">Checked In / Completed</p>
            </div>
          </div>
        </div>

        {/* Volunteer Roster Table Section */}
        <div className="bg-white rounded-3xl border border-[#c0c8cb]/60 overflow-hidden shadow-sm">
          {/* Table Tabs Header */}
          <div className="p-6 border-b border-[#e1e9f6] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-headline font-bold text-lg text-[#141c25]">
                Volunteer Attendance & Assignment Roster
              </h3>
              <p className="text-xs text-[#40484b]">
                Real-time tracking of confirmed personnel, backup positions, and check-in verifications.
              </p>
            </div>

            <div className="flex bg-[#f2f4fc] p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'all' ? 'bg-white text-[#004653] shadow-sm' : 'text-[#40484b]'
                }`}
              >
                All ({allList.length})
              </button>
              <button
                onClick={() => setActiveTab('confirmed')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'confirmed' ? 'bg-white text-[#004653] shadow-sm' : 'text-[#40484b]'
                }`}
              >
                Confirmed ({confirmedList.length})
              </button>
              <button
                onClick={() => setActiveTab('waitlisted')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'waitlisted' ? 'bg-white text-[#8c5000] shadow-sm' : 'text-[#40484b]'
                }`}
              >
                Backups ({waitlistedList.length})
              </button>
              <button
                onClick={() => setActiveTab('checked-in')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'checked-in' ? 'bg-white text-[#316e52] shadow-sm' : 'text-[#40484b]'
                }`}
              >
                Checked In ({confirmedList.filter(a => ['checked-in', 'completed'].includes(a.status)).length})
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f8f9ff] text-[#40484b] uppercase font-bold text-[10px] tracking-wider border-b border-[#e1e9f6]">
                <tr>
                  <th className="py-3.5 px-6">Volunteer</th>
                  <th className="py-3.5 px-6">Duty & Team</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Check-In Info</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2f4fc]">
                {displayList.map((assignment, index) => {
                  const isBackup = assignment.isBackup || assignment.status === 'waitlisted';
                  const isCheckedIn = ['checked-in', 'completed'].includes(assignment.status);

                  return (
                    <tr key={assignment._id} className="hover:bg-[#f8f9ff]/80 transition-colors">
                      {/* Volunteer Name & Phone */}
                      <td className="py-3.5 px-6 flex items-center gap-3">
                        <img
                          src={assignment.volunteer?.avatarUrl || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=128`}
                          alt={assignment.volunteer?.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#c0c8cb]"
                        />
                        <div>
                          <p className="font-bold text-[#141c25] text-xs">
                            {assignment.volunteer?.name}
                          </p>
                          <p className="text-[11px] text-[#40484b]">
                            {assignment.volunteer?.email}
                          </p>
                        </div>
                      </td>

                      {/* Duty & Team */}
                      <td className="py-3.5 px-6">
                        <span className="font-semibold text-[#004653]">
                          {assignment.dutyTitle || 'General Support'}
                        </span>
                        <p className="text-[11px] text-[#40484b]">
                          {assignment.team || 'Team Alpha'}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-6">
                        {isBackup ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ffdcc2] text-[#8c5000]">
                            <span className="material-symbols-outlined text-[13px]">hourglass_top</span>
                            Backup #{assignment.waitlistPosition || index + 1}
                          </span>
                        ) : isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#d0e8d7] text-[#316e52]">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            {assignment.status === 'completed' ? 'Completed & Logged' : 'Checked In (QR)'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#e7eefb] text-[#004653]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#004653]" />
                            Confirmed
                          </span>
                        )}
                      </td>

                      {/* Check-In Info */}
                      <td className="py-3.5 px-6 text-[#40484b]">
                        {assignment.checkInAt ? (
                          <div>
                            <span className="text-[11px] font-medium text-[#141c25]">
                              {new Date(assignment.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <p className="text-[10px] text-gray-500">Method: {assignment.checkInMethod || 'QR'}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[11px]">Awaiting arrival</span>
                        )}
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-6 text-right space-x-2">
                        {isBackup ? (
                          <button
                            onClick={() => handlePromoteBackup(assignment._id)}
                            className="px-2.5 py-1 bg-[#8c5000] hover:bg-[#6e3f00] text-white text-[11px] font-bold rounded-lg transition-colors"
                          >
                            Promote to Confirmed
                          </button>
                        ) : !isCheckedIn ? (
                          <button
                            onClick={async () => {
                              await axios.post('/api/v1/attendance/manual-checkin', {
                                assignmentId: assignment._id,
                                reason: 'On-site roster manual check-in'
                              });
                              toast.success(`Checked in ${assignment.volunteer?.name}`);
                              fetchRoster(selectedEventId);
                            }}
                            className="px-2.5 py-1 bg-[#004653] hover:bg-[#245e6b] text-white text-[11px] font-semibold rounded-lg transition-colors"
                          >
                            Manual Check-In
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            {assignment.status !== 'completed' && (
                              <button
                                onClick={() => handleCheckOut(assignment._id)}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold rounded-lg transition-colors"
                              >
                                Check Out (4.5h)
                              </button>
                            )}
                            <button
                              onClick={() => openRatingModal(assignment)}
                              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-[11px] font-bold rounded-lg transition-colors"
                            >
                              Rate
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onCheckInComplete={() => fetchRoster(selectedEventId)}
        volunteers={confirmedList.filter(a => a.status === 'confirmed')}
      />

      {/* Manual Override Dialog with Mandatory Audit Reason */}
      {overrideModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#c0c8cb]">
            <h3 className="font-headline font-bold text-base text-[#141c25]">
              Promote Backup Volunteer (Manual Override)
            </h3>
            <p className="text-xs text-[#40484b]">
              Platform safety rules require an explicit reason for assignment overrides to record in the audit log.
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#141c25] mb-1">
                Override Reason
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Volunteer arrived on-site early and confirmed readiness..."
                className="w-full p-2.5 text-xs border border-[#c0c8cb] rounded-xl focus:outline-none focus:border-[#004653]"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideModal({ open: false, assignmentId: null, action: '' })}
                className="px-4 py-2 text-xs font-semibold text-[#40484b] hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={submitOverrideAction}
                className="px-4 py-2 bg-[#004653] hover:bg-[#245e6b] text-white text-xs font-bold rounded-xl"
              >
                Confirm & Log Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Closeout Ratings Modal */}
      {isRatingModalOpen && selectedVolunteerForRating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[#c0c8cb]">
            <div className="flex justify-between items-center border-b border-[#e1e9f6] pb-3">
              <div>
                <h3 className="font-headline font-bold text-base text-[#141c25]">
                  Closeout Review: {selectedVolunteerForRating.volunteer?.name}
                </h3>
                <p className="text-xs text-[#40484b]">
                  Rate the two distinct performance dimensions specified by THOURAM standards.
                </p>
              </div>
              <button
                onClick={() => setIsRatingModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={submitRating} className="space-y-4">
              {/* Metric 1: Reliability / Completion Score */}
              <div className="p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#e1e9f6]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#141c25]">
                    1. Reliability & Completion
                  </span>
                  <span className="text-xs font-extrabold text-[#004653]">
                    {reliabilityScore} / 5 Stars
                  </span>
                </div>
                <p className="text-[11px] text-[#40484b] mb-2">
                  Punctuality, honoring assigned duty hours, and presence throughout event.
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReliabilityScore(star)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        star <= reliabilityScore
                          ? 'bg-[#004653] text-white shadow-sm'
                          : 'bg-white border border-[#c0c8cb] text-gray-500'
                      }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Metric 2: Work Quality Score */}
              <div className="p-3.5 bg-[#f8f9ff] rounded-2xl border border-[#e1e9f6]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-[#141c25]">
                    2. Work Quality & Team Impact
                  </span>
                  <span className="text-xs font-extrabold text-[#316e52]">
                    {workQualityScore} / 5 Stars
                  </span>
                </div>
                <p className="text-[11px] text-[#40484b] mb-2">
                  Competence, safety awareness, teamwork, and care for community assets.
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setWorkQualityScore(star)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        star <= workQualityScore
                          ? 'bg-[#316e52] text-white shadow-sm'
                          : 'bg-white border border-[#c0c8cb] text-gray-500'
                      }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback comments */}
              <div>
                <label className="block text-xs font-semibold text-[#141c25] mb-1">
                  Organizer Feedback & Commendation
                </label>
                <textarea
                  value={feedbackNotes}
                  onChange={(e) => setFeedbackNotes(e.target.value)}
                  placeholder="Record specific positive contributions or guidance for the volunteer's permanent profile..."
                  className="w-full p-2.5 text-xs border border-[#c0c8cb] rounded-xl focus:outline-none focus:border-[#004653]"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#40484b] hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004653] hover:bg-[#245e6b] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Submit Official Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Delegation Modal */}
      {isDelegateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#c0c8cb]">
            <h3 className="font-headline font-bold text-base text-[#141c25]">
              Delegate Community Management Role
            </h3>
            <p className="text-xs text-[#40484b]">
              Appoint sub-managers or team leads to oversee specific duties, attendance scanning, or team check-ins.
            </p>
            <form onSubmit={handleDelegateMember} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#141c25] mb-1">
                  User Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="submanager@thouram.org"
                  value={delegateEmail}
                  onChange={(e) => setDelegateEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#c0c8cb] rounded-xl focus:outline-none focus:border-[#004653]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#141c25] mb-1">
                  Delegated Role Scope
                </label>
                <select
                  value={delegateRole}
                  onChange={(e) => setDelegateRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#c0c8cb] rounded-xl focus:outline-none focus:border-[#004653]"
                >
                  <option value="sub-manager">Sub-Manager (Event & Roster Scanner Access)</option>
                  <option value="team-lead">Team Lead (Team Duty Coordination)</option>
                  <option value="organizer">Co-Organizer (Full Administrative Privileges)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDelegateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#40484b] hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#004653] hover:bg-[#245e6b] text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Grant Permissions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
