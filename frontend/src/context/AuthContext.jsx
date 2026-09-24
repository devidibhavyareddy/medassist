import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token/user from localStorage on mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('medassist_token');
      const storedUser = localStorage.getItem('medassist_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse stored auth session', err);
      localStorage.removeItem('medassist_token');
      localStorage.removeItem('medassist_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    const { token: receivedToken, user: receivedUser } = response.data;
    localStorage.setItem('medassist_token', receivedToken);
    localStorage.setItem('medassist_user', JSON.stringify(receivedUser));
    setToken(receivedToken);
    setUser(receivedUser);
    return response.data;
  };

  const register = async (userData) => {
    const response = await authApi.register(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('medassist_token');
    localStorage.removeItem('medassist_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
