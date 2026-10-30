import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

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
import VolunteerProfile from './pages/VolunteerProfile';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[#004653] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }
  return children;
}

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
              <Route
                path="/volunteer-dashboard"
                element={
                  <ProtectedRoute>
                    <VolunteerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organizer-hub"
                element={
                  <ProtectedRoute>
                    <OrganizerHub />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <MyEvents />
                  </ProtectedRoute>
                }
              />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <VolunteerProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
          <Toaster
            position="top-center"
            containerStyle={{ top: 16 }}
            toastOptions={{
              duration: 3500,
              style: {
                borderRadius: '12px',
                background: '#141c25',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '500',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              },
              success: {
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#141c25'
                }
              }
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}
