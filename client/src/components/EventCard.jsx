import React from 'react';
import { Link } from 'react-router-dom';

export default function EventCard({ event, matchScore }) {
  const {
    _id,
    title,
    community,
    cause,
    location,
    dateTime,
    capacity,
    imageUrl,
    duties = []
  } = event;

  const confirmed = capacity?.confirmed || 0;
  const totalRequired = capacity?.totalRequired || 1;
  const percentFilled = Math.min(100, Math.round((confirmed / totalRequired) * 100));

  const startDate = dateTime?.start ? new Date(dateTime.start) : null;
  const formattedDate = startDate ? startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }) : 'Upcoming';

  const formattedTime = startDate ? startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }) : '';

  return (
    <div className="bg-white rounded-2xl border border-[#c0c8cb]/60 overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
      {/* Cover Image & Badges */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Cause Tag */}
        {cause && (
          <span className="absolute top-3 left-3 bg-[#004653]/90 text-white backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-semibold">
            {cause}
          </span>
        )}

        {/* Transparent Match Score Badge if available */}
        {matchScore !== undefined && (
          <span className="absolute top-3 right-3 bg-[#d0e8d7] text-[#316e52] border border-[#316e52]/30 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            {matchScore}% Match
          </span>
        )}

        {/* Date overlay */}
        <div className="absolute bottom-3 left-3 text-white flex items-center gap-1.5 text-xs font-medium">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          <span>{formattedDate} • {formattedTime}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Community Info */}
        <div className="flex items-center gap-2 mb-2">
          {community?.logo && (
            <img
              src={community.logo}
              alt={community.name}
              className="w-5 h-5 rounded-full object-cover"
            />
          )}
          <span className="text-xs font-medium text-[#40484b] truncate">
            {community?.name || 'Local Initiative'}
          </span>
          {community?.isVerified && (
            <span className="material-symbols-outlined text-[15px] text-[#004653]" title="Verified Community">
              verified
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={`/events/${_id}`} className="group-hover:text-[#004653] transition-colors">
          <h3 className="font-headline font-bold text-base text-[#141c25] leading-snug line-clamp-2 mb-2">
            {title}
          </h3>
        </Link>

        {/* Location venue */}
        <div className="flex items-center gap-1.5 text-xs text-[#40484b] mb-4">
          <span className="material-symbols-outlined text-[16px] text-gray-400">
            {location?.isVirtual ? 'laptop' : 'location_on'}
          </span>
          <span className="truncate">
            {location?.isVirtual ? 'Virtual Online Event' : `${location?.venue || location?.city || 'India'}`}
          </span>
        </div>

        {/* Duties tags summary */}
        {duties.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {duties.slice(0, 2).map((duty, idx) => (
              <span
                key={idx}
                className="bg-[#f2f4fc] text-[#40484b] text-[11px] font-medium px-2 py-0.5 rounded-md"
              >
                {duty.title}
              </span>
            ))}
            {duties.length > 2 && (
              <span className="text-[11px] text-[#40484b] self-center">
                +{duties.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Progress & Slots */}
        <div className="mt-auto pt-3 border-t border-[#f2f4fc]">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-[#40484b] font-medium">Volunteers Mobilized</span>
            <span className="font-semibold text-[#141c25]">
              {confirmed} / {totalRequired}
              {capacity?.waitlisted > 0 && (
                <span className="text-amber-600 text-[11px] ml-1">
                  (+{capacity.waitlisted} backup)
                </span>
              )}
            </span>
          </div>

          <div className="w-full bg-[#e1e9f6] rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percentFilled >= 100 ? 'bg-emerald-600' : 'bg-[#004653]'
              }`}
              style={{ width: `${percentFilled}%` }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Link
              to={`/events/${_id}`}
              className="w-full text-center py-2 px-3 bg-[#e7eefb] hover:bg-[#004653] hover:text-white text-[#004653] font-semibold text-xs rounded-xl transition-all"
            >
              View Event & Roster
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
