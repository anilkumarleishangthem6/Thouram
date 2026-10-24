import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set default axios base URL and credentials
  axios.defaults.withCredentials = true;

  const loadUser = async () => {
    try {
      const res = await axios.get('/api/v1/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setProfile(res.data.volunteerProfile);
        setMemberships(res.data.memberships || []);
      }
    } catch (err) {
      setUser(null);
      setProfile(null);
      setMemberships([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/v1/auth/login', { email, password });
      if (res.data.success) {
        setUser(res.data.user);
        await loadUser();
        toast.success(`Welcome back, ${res.data.user.name || 'friend'}!`);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (formData) => {
    try {
      const res = await axios.post('/api/v1/auth/register', formData);
      if (res.data.success) {
        setUser(res.data.user);
        await loadUser();
        toast.success('Registration successful! Welcome to THOURAM.');
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/v1/auth/logout');
      setUser(null);
      setProfile(null);
      setMemberships([]);
      toast.success('Logged out successfully');
    } catch (err) {
      setUser(null);
    }
  };

  // Quick switch for demo ease
  const quickSwitch = async (role) => {
    let email = 'volunteer@thouram.org';
    if (role === 'organizer') email = 'organizer@thouram.org';
    if (role === 'submanager') email = 'submanager@thouram.org';
    return await login(email, 'Password123!');
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      memberships,
      loading,
      login,
      register,
      logout,
      quickSwitch,
      refreshUser: loadUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
