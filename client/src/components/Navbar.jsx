import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from './BrandLogo';
import axios from 'axios';

export default function Navbar() {
  const { user, logout, quickSwitch } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/v1/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {}
  };

  const markAllRead = async () => {
    try {
      await axios.patch('/api/v1/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {}
  };

  const navLinks = [
    { name: 'Explore Events', path: '/events' },
    { name: 'Volunteer Portal', path: '/volunteer-dashboard' },
    { name: 'Organizer Hub', path: '/organizer-hub' },
    { name: 'My Events', path: '/my-events' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e1e9f6] transition-all">
      {/* Top Demo Simulation Banner */}
      <div className="bg-[#004653] text-white px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#245e6b]">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#9ed5e4] text-[#004653]">
            DEMO MODE
          </span>
          <span className="hidden sm:inline text-white/90">
            Switch perspective instantly:
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => quickSwitch('volunteer')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.email === 'volunteer@thouram.org'
                ? 'bg-white text-[#004653] font-bold shadow-sm'
                : 'text-white/80 hover:bg-white/20'
            }`}
          >
            Volunteer (Aarav)
          </button>
          <span className="text-white/40">|</span>
          <button
            onClick={() => quickSwitch('organizer')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.email === 'organizer@thouram.org'
                ? 'bg-white text-[#004653] font-bold shadow-sm'
                : 'text-white/80 hover:bg-white/20'
            }`}
          >
            Organizer (Priya)
          </button>
          <span className="text-white/40">|</span>
          <button
            onClick={() => quickSwitch('submanager')}
            className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              user?.email === 'submanager@thouram.org'
                ? 'bg-white text-[#004653] font-bold shadow-sm'
                : 'text-white/80 hover:bg-white/20'
            }`}
          >
            Sub-Manager (Rohan)
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <BrandLogo />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-[#004653] bg-[#e7eefb] font-semibold'
                    : 'text-[#40484b] hover:text-[#004653] hover:bg-[#f2f4fc]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons / Auth Controls */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notifications Toggle */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-[#40484b] hover:text-[#004653] hover:bg-[#f2f4fc] rounded-full relative transition-colors focus:outline-none"
                  aria-label="View notifications"
                >
                  <span className="material-symbols-outlined text-[22px]">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-[#c0c8cb]/60 py-3 z-50">
                    <div className="flex items-center justify-between px-4 pb-2 border-b border-[#e1e9f6]">
                      <span className="font-headline font-semibold text-sm text-[#141c25]">
                        Notifications ({notifications.length})
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-xs text-[#004653] hover:underline font-medium"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-[#f2f4fc]">
                      {notifications.length === 0 ? (
                        <div className="py-6 text-center text-xs text-[#40484b]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            className={`p-3 text-xs transition-colors ${
                              !n.read ? 'bg-[#f8f9ff]' : 'hover:bg-gray-50'
                            }`}
                          >
                            <p className="font-semibold text-[#141c25] mb-0.5">{n.title}</p>
                            <p className="text-[#40484b] leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Logout */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-[#e1e9f6]">
                <img
                  src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=128'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border border-[#9ed5e4]"
                />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-[#141c25] leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-[#40484b] capitalize">
                    {user.globalRole}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-1.5 text-[#40484b] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                >
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth?mode=login"
                className="px-3.5 py-1.5 text-sm font-semibold text-[#004653] hover:bg-[#e7eefb] rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/auth?mode=register"
                className="px-3.5 py-1.5 text-sm font-semibold text-white bg-[#004653] hover:bg-[#245e6b] rounded-lg shadow-sm transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#40484b] hover:text-[#004653] rounded-lg"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#e1e9f6] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#40484b] hover:bg-[#f2f4fc]"
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
