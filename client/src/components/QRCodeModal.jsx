import React from 'react';

export default function QRCodeModal({ isOpen, onClose, passData }) {
  if (!isOpen || !passData) return null;

  const { event, assignment, volunteer, qrCode } = passData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-[#c0c8cb] relative">
        {/* Header Ribbon */}
        <div className="bg-[#004653] text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="inline-block px-3 py-1 rounded-full bg-[#9ed5e4] text-[#004653] text-xs font-bold uppercase tracking-wider mb-2">
            Verified Event Pass
          </div>
          <h3 className="font-headline font-bold text-lg leading-tight">
            {event?.title || 'Community Volunteer Event'}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            {event?.location?.venue || 'Marina Beach Promenade & Lighthouse Grounds, Chennai'}
          </p>
        </div>

        {/* QR Code Body */}
        <div className="p-6 text-center flex flex-col items-center">
          <div className="p-4 bg-[#f8f9ff] rounded-2xl border-2 border-dashed border-[#004653]/30 shadow-inner mb-4">
            {qrCode ? (
              <img
                src={qrCode}
                alt="Volunteer QR Pass"
                className="w-56 h-56 mx-auto object-contain"
              />
            ) : (
              <div className="w-56 h-56 flex items-center justify-center text-gray-400">
                Generating secure pass...
              </div>
            )}
          </div>

          <div className="w-full bg-[#f2f4fc] rounded-xl p-3 text-left text-xs space-y-1 mb-4 border border-[#e1e9f6]">
            <div className="flex justify-between">
              <span className="text-[#40484b]">Volunteer:</span>
              <span className="font-semibold text-[#141c25]">{volunteer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#40484b]">Assigned Duty:</span>
              <span className="font-semibold text-[#004653]">{assignment?.dutyTitle || 'General Support'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#40484b]">Status:</span>
              <span className="font-bold text-emerald-700 uppercase">{assignment?.status}</span>
            </div>
          </div>

          <p className="text-xs text-[#40484b] leading-relaxed">
            Present this QR pass to the event coordinator at the check-in desk to record your attendance.
          </p>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#f8f9ff] px-6 py-4 border-t border-[#e1e9f6] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#004653] hover:bg-[#245e6b] text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
