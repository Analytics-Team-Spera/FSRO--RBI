import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const { data } = await authAPI.getMe();
        setUser(data);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const register = async (userData) => {
    try {
      const { data } = await authAPI.register(userData);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await authAPI.login(credentials);
      
      // Check if 2FA is required
      if (data.requires_2fa) {
        return { success: true, requires2FA: true };
      }
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const enable2FA = async (password) => {
    try {
      const { data } = await authAPI.enable2FA(password);
      return { success: true, data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to enable 2FA';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const verify2FA = async (otp_code) => {
    try {
      await authAPI.verify2FA(otp_code);
      toast.success('2FA enabled successfully!');
      // Refresh user data
      await checkAuth();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Invalid OTP code';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const disable2FA = async (password) => {
    try {
      await authAPI.disable2FA(password);
      toast.success('2FA disabled successfully');
      await checkAuth();
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to disable 2FA';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    enable2FA,
    verify2FA,
    disable2FA,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
