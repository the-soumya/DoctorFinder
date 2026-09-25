import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        doctorId: data.doctorId,
        address: data.address || '',
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please verify credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (signupData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', signupData);
      const data = response.data;

      // If no token (doctor/pharmacy awaiting approval), don't log them in
      if (!data.token) {
        return { success: false, message: data.message || 'Registration submitted. Awaiting admin approval.' };
      }

      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      const userData = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        phone: data.phone,
        doctorId: data.doctorId,
        address: data.address || '',
      };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
