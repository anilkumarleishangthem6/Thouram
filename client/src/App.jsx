import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import ExploreEvents from './pages/ExploreEvents';
import EventDetail from './pages/EventDetail';
import VolunteerDashboard from './pages/VolunteerDashboard';
import OrganizerHub from './pages/OrganizerHub';
import MyEvents from './pages/MyEvents';
import AuthPage from './pages/AuthPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-[#f8f9ff] text-[#141c25]">
          <Navbar />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/events" element={<ExploreEvents />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/volunteer-dashboard" element={<VolunteerDashboard />} />
              <Route path="/organizer-hub" element={<OrganizerHub />} />
              <Route path="/my-events" element={<MyEvents />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </div>
      </Router>
    </AuthProvider>
  );
}
