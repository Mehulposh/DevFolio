import  { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('devfolio_token'));

 
  useEffect(() => {
    const fetchMe = async () => {
        if (!token) { 
        setLoading(false); 
        return; 
        }

        try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        } catch {
        localStorage.removeItem('devfolio_token');
        setToken(null);
        } finally {
        setLoading(false);
        }
    };

    fetchMe();
    }, [token]);
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('devfolio_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('devfolio_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (data) => setUser(prev => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};