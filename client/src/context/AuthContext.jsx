import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

// Helper: user-specific localStorage key for analysis data
const analysisKey = (userId) => `latestAnalysis_${userId}`;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    setLoading(false);
  }, []);

  // Clear any global (non-user-specific) stale analysis data
  const cleanupOldAnalysis = () => {
    localStorage.removeItem('latestAnalysis'); // remove old global key
  };

  const setAuthUser = (data) => {
    cleanupOldAnalysis();
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
  };

  const login = async (email, password) => {
    const res = await api.post('/users/login', { email, password });
    setAuthUser(res.data);
    return res.data;
  };

  const register = async (name, email, password, industry) => {
    const res = await api.post('/users/register', { name, email, password, industry });
    setAuthUser(res.data);
    return res.data;
  };

  const googleLogin = async (credential) => {
    const res = await api.post('/users/google', { credential });
    setAuthUser(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('user');
    // Clear this user's analysis data
    if (user?._id) {
      localStorage.removeItem(analysisKey(user._id));
    }
    localStorage.removeItem('latestAnalysis'); // also clean old global key
    setUser(null);
  };

  // Utility: save/load analysis for the current user only
  const saveAnalysis = (data) => {
    if (user?._id) {
      localStorage.setItem(analysisKey(user._id), JSON.stringify(data));
    }
  };

  const loadAnalysis = () => {
    if (user?._id) {
      const raw = localStorage.getItem(analysisKey(user._id));
      if (raw) {
        try { return JSON.parse(raw); } catch { return null; }
      }
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, loading, saveAnalysis, loadAnalysis }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
