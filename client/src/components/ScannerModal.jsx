import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ScannerModal({ isOpen, onClose, onCheckInComplete, volunteers = [] }) {
  const [tokenInput, setTokenInput] = useState('');
  const [selectedVolunteerId, setSelectedVolunteerId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleTokenSubmit = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post('/api/v1/attendance/qr-checkin', { token: tokenInput.trim() });
      if (res.data.success) {
        toast.success(res.data.message || 'Check-in verified via QR code!');
        setTokenInput('');
        onCheckInComplete?.();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'QR Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectCheckIn = async (assignmentId) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/attendance/manual-checkin', {
        assignmentId,
        reason: 'Organizer on-site scan & verification'
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Volunteer checked in!');
        onCheckInComplete?.();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#c0c8cb]">
        {/* Header */}
        <div className="bg-[#004653] text-white p-6 flex justify-between items-center">
          <div>
            <h3 className="font-headline font-bold text-lg">On-Site Volunteer Check-In</h3>
            <p className="text-xs text-white/80">Scan QR token or rapidly verify arriving volunteer</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Select from Arriving Volunteers */}
          <div>
            <label className="block text-xs font-semibold text-[#141c25] mb-2 uppercase tracking-wider">
              Fast Check-In (Select Registered Volunteer)
            </label>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-[#e1e9f6] rounded-xl p-2 bg-[#f8f9ff]">
              {volunteers.length === 0 ? (
                <p className="text-xs text-gray-500 py-3 text-center">No unverified volunteers in roster.</p>
              ) : (
                volunteers.map((a) => (
                  <div
                    key={a._id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#e1e9f6] hover:border-[#004653] transition-colors"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#141c25]">{a.volunteer?.name}</p>
                      <p className="text-[11px] text-[#40484b]">{a.dutyTitle || 'General Support'}</p>
                    </div>
                    <button
                      onClick={() => handleDirectCheckIn(a._id)}
                      disabled={loading}
                      className="px-3 py-1 bg-[#004653] hover:bg-[#245e6b] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Check In
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#e1e9f6]"></div>
            <span className="flex-shrink mx-4 text-xs font-medium text-gray-400">OR SCAN ENCRYPTED QR TOKEN</span>
            <div className="flex-grow border-t border-[#e1e9f6]"></div>
          </div>

          {/* Token input fallback */}
          <form onSubmit={handleTokenSubmit} className="space-y-3">
            <label className="block text-xs font-semibold text-[#141c25]">
              Paste Volunteer QR Token String
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste decrypted or camera QR token..."
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="flex-grow px-3 py-2 text-xs border border-[#c0c8cb] rounded-xl focus:outline-none focus:border-[#004653]"
              />
              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
                className="px-4 py-2 bg-[#004653] hover:bg-[#245e6b] disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Verify
              </button>
            </div>
          </form>
        </div>

        <div className="bg-[#f8f9ff] px-6 py-4 border-t border-[#e1e9f6] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
