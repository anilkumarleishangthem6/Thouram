import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white w-full mt-auto border-t border-[#c0c8cb]/40">
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <span className="font-headline font-bold text-lg text-[#004653] tracking-tight">
            THOURAM
          </span>
          <span className="text-xs text-[#40484b]">
            © 2025 THOURAM. Empowering community collaboration and volunteer impact across India.
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
          <Link
            to="/events"
            className="text-[#40484b] hover:text-[#004653] transition-colors"
          >
            Verified Communities
          </Link>
          <a
            href="#safety"
            className="text-[#40484b] hover:text-[#004653] transition-colors"
          >
            Safety Standards
          </a>
          <a
            href="#accessibility"
            className="text-[#40484b] hover:text-[#004653] transition-colors"
          >
            Accessibility Initiatives
          </a>
          <a
            href="#community-network"
            className="text-[#40484b] hover:text-[#004653] transition-colors"
          >
            Pan-India Network
          </a>
          <a
            href="#privacy"
            className="text-[#40484b] hover:text-[#004653] transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#terms"
            className="text-[#40484b] hover:text-[#004653] transition-colors"
          >
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
