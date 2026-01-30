import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

axios.defaults.baseURL = API_URL;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('homelystay_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('homelystay_token');
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('homelystay_token');
    if (!token) {
      setLoading(false);
      return;
    }

    axios
      .get('/auth/me')
      .then((res) => {
        const userData = res.data?.user;
        if (userData) setUser(userData);
        else localStorage.removeItem('homelystay_token');
      })
      .catch(() => {
        localStorage.removeItem('homelystay_token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    if (!token || !userData) throw new Error('Invalid login response');
    localStorage.setItem('homelystay_token', token);
    setUser(userData);
    return userData;
  };

  const register = async (payload) => {
    const res = await axios.post('/auth/register', payload);
    const { token, user: userData } = res.data;
    if (!token || !userData) throw new Error('Invalid register response');
    localStorage.setItem('homelystay_token', token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('homelystay_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isHost: user?.role === 'host',
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

