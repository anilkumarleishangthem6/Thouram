import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const initialRole = searchParams.get('role') === 'organizer' ? 'organizer' : 'volunteer';

  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [communityName, setCommunityName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register, quickSwitch } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          navigate('/volunteer-dashboard');
        }
      } else {
        const res = await register({
          email,
          password,
          name,
          phone,
          role,
          communityName: role === 'organizer' ? communityName : undefined
        });
        if (res.success) {
          navigate(role === 'organizer' ? '/organizer-hub' : '/volunteer-dashboard');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoSelect = async (demoRole) => {
    setSubmitting(true);
    try {
      const res = await quickSwitch(demoRole);
      if (res.success) {
        if (demoRole === 'organizer' || demoRole === 'submanager') {
          navigate('/organizer-hub');
        } else {
          navigate('/volunteer-dashboard');
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="flex justify-center">
          <BrandLogo size="default" />
        </div>
        <h2 className="font-headline font-extrabold text-2xl text-[#141c25]">
          {mode === 'login' ? 'Sign in to THOURAM' : 'Create your account'}
        </h2>
        <p className="text-xs text-[#40484b]">
          Rooted in community collaboration and positive social impact across India.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-[#c0c8cb]/60 space-y-6">
          {/* Quick 1-Click Demo Login Bar */}
          <div className="p-4 bg-[#e7eefb]/70 rounded-2xl border border-[#9ed5e4] space-y-2 text-center">
            <span className="text-[11px] font-bold text-[#004653] uppercase tracking-wider block">
              🚀 Fast Hackathon Demo Credentials
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('volunteer')}
                className="py-1.5 px-2 bg-white hover:bg-[#004653] hover:text-white text-[#004653] rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Volunteer
              </button>
              <button
                type="button"
                onClick={() => handleDemoSelect('organizer')}
                className="py-1.5 px-2 bg-white hover:bg-[#004653] hover:text-white text-[#004653] rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Organizer
              </button>
              <button
                type="button"
                onClick={() => handleDemoSelect('submanager')}
                className="py-1.5 px-2 bg-white hover:bg-[#004653] hover:text-white text-[#004653] rounded-lg text-xs font-bold transition-colors shadow-sm"
              >
                Sub-Manager
              </button>
            </div>
          </div>

          {/* Toggle Login / Register */}
          <div className="flex bg-[#f2f4fc] p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                mode === 'login' ? 'bg-white text-[#004653] shadow-sm font-bold' : 'text-[#40484b]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                mode === 'register' ? 'bg-white text-[#004653] shadow-sm font-bold' : 'text-[#40484b]'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'register' && (
              <>
                {/* Account Type Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-[#40484b] uppercase mb-1">
                    I want to:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('volunteer')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        role === 'volunteer'
                          ? 'border-[#004653] bg-[#f8f9ff] text-[#004653]'
                          : 'border-[#e1e9f6] text-[#40484b]'
                      }`}
                    >
                      Volunteer for Events
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('organizer')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        role === 'organizer'
                          ? 'border-[#004653] bg-[#f8f9ff] text-[#004653]'
                          : 'border-[#e1e9f6] text-[#40484b]'
                      }`}
                    >
                      Host & Organize
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#40484b] uppercase mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Patel"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#c0c8cb] rounded-xl focus:outline-none focus:border-[#004653]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#40484b] uppercase mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#c0c8cb] rounded-xl focus:outline-none focus:border-[#004653]"
                  />
                </div>

                {role === 'organizer' && (
                  <div>
                    <label className="block text-[11px] font-bold text-[#40484b] uppercase mb-1">
                      Organization / Community Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. India Community Action Network"
                      value={communityName}
                      onChange={(e) => setCommunityName(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#c0c8cb] rounded-xl focus:outline-none focus:border-[#004653]"
                    />
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#40484b] uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@thouram.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#c0c8cb] rounded-xl focus:outline-none focus:border-[#004653]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#40484b] uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#c0c8cb] rounded-xl focus:outline-none focus:border-[#004653]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#004653] hover:bg-[#245e6b] disabled:opacity-50 text-white font-headline font-bold text-xs rounded-xl shadow-md transition-colors"
            >
              {submitting ? 'Authenticating...' : mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
