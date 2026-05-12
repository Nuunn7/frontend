import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    console.log('LOGIN RESPONSE:', res.data);
    const { user, token } = res.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    const { user, token } = res.data.data;
    localStorage.setItem('token', token);
    setUser(user);
    return user;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};