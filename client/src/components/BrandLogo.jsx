import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({ size = 'default', showSubtext = true }) {
  return (
    <Link to="/" className="flex items-center gap-3 group focus:outline-none">
      {/* Exact geometric symbol from Stitch design */}
      <svg
        viewBox="0 0 40 40"
        className={size === 'small' ? 'w-8 h-8' : 'w-10 h-10'}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="20" cy="20" r="18" fill="#E8F1F3" stroke="#004653" strokeWidth="2" />
        <circle cx="20" cy="12" r="3.2" fill="#004653" />
        <circle cx="20" cy="28" r="3.2" fill="#004653" />
        <circle cx="12" cy="20" r="3.2" fill="#004653" />
        <circle cx="28" cy="20" r="3.2" fill="#004653" />
        <path d="M15 15 L25 25 M25 15 L15 25" stroke="#004653" strokeWidth="1.75" strokeLinecap="round" />
        <circle cx="20" cy="20" r="2" fill="#FFFFFF" />
      </svg>

      <div className="flex flex-col">
        <span className="font-headline font-extrabold text-xl tracking-wider text-[#004653] leading-none group-hover:text-[#245e6b] transition-colors">
          THOURAM
        </span>
        {showSubtext && (
          <span className="text-[10px] font-medium text-[#40484b] tracking-tight leading-tight mt-0.5">
            Community events, made easier
          </span>
        )}
      </div>
    </Link>
  );
}
