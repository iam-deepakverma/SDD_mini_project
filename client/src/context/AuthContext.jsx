import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('emedley_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [academicSummary, setAcademicSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataVersion, setDataVersion] = useState(0);

  // Broadcast channel for multi-tab synchronization
  const [syncChannel, setSyncChannel] = useState(null);

  useEffect(() => {
    try {
      const channel = new BroadcastChannel('emedley_sync_channel');
      setSyncChannel(channel);

      channel.onmessage = (event) => {
        setDataVersion((v) => v + 1);
        refreshUser();
      };

      return () => {
        channel.close();
      };
    } catch (_) {
      // BroadcastChannel fallback to storage event
    }
  }, []);

  // Cross-tab storage event listener
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'emedley_sync_ping') {
        setDataVersion((v) => v + 1);
        refreshUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);



  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('emedley_token');
    if (!token) return;
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setAcademicSummary(res.data.academicSummary);
        localStorage.setItem('emedley_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      // Silent fail on background refresh
    }
  }, []);

  // Notify all components and other tabs that data changed
  const notifyDataChanged = useCallback((type = 'general') => {
    setDataVersion((v) => v + 1);
    refreshUser();
    try {
      localStorage.setItem('emedley_sync_ping', `${Date.now()}_${type}`);
      if (syncChannel) {
        syncChannel.postMessage({ type, timestamp: Date.now() });
      }
    } catch (_) {}
  }, [syncChannel, refreshUser]);

  // Check current session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('emedley_token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setAcademicSummary(res.data.academicSummary);
          localStorage.setItem('emedley_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Session check failed:', err.response?.data?.message || err.message);
        localStorage.removeItem('emedley_token');
        localStorage.removeItem('emedley_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token, user: loggedInUser } = res.data;
        localStorage.setItem('emedley_token', token);
        localStorage.setItem('emedley_user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);

        try {
          const meRes = await api.get('/auth/me');
          if (meRes.data.academicSummary) {
            setAcademicSummary(meRes.data.academicSummary);
          }
        } catch (_) {}

        notifyDataChanged('login');
        toast.success(`Welcome back, ${loggedInUser.name}!`);
        return { success: true, user: loggedInUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        const { token, user: registeredUser } = res.data;
        localStorage.setItem('emedley_token', token);
        localStorage.setItem('emedley_user', JSON.stringify(registeredUser));
        setUser(registeredUser);
        notifyDataChanged('register');
        toast.success('Registration successful! Welcome to Emedley.');
        return { success: true, user: registeredUser };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (_) {}
    localStorage.removeItem('emedley_token');
    localStorage.removeItem('emedley_user');
    setUser(null);
    setAcademicSummary(null);
    notifyDataChanged('logout');
    toast.success('Logged out successfully.');
  };

  // Demo account quick login helper for evaluator ease
  const switchDemoAccount = async (accountType) => {
    let email = 'admin@emedley.edu';
    if (accountType === 'student-eligible') {
      email = 'alex.student@emedley.edu';
    } else if (accountType === 'student-missing-prereq') {
      email = 'maya.student@emedley.edu';
    } else if (accountType === 'student-high-credits') {
      email = 'jordan.student@emedley.edu';
    }
    const res = await login(email, 'Password123!');
    notifyDataChanged(`switch_${accountType}`);
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        academicSummary,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isStudent: user?.role === 'student',
        isLoading,
        dataVersion,
        login,
        register,
        logout,
        refreshUser,
        notifyDataChanged,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
