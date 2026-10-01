import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/auth.service';

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('sweet-medical-token');
      const storedUser = localStorage.getItem('sweet-medical-user');

      if (storedToken) {
        const decoded = decodeToken(storedToken);

        if (decoded && decoded.exp && decoded.exp * 1000 < Date.now()) {
          localStorage.removeItem('sweet-medical-token');
          localStorage.removeItem('sweet-medical-user');
        } else {
          setToken(storedToken);
          setUser(storedUser ? JSON.parse(storedUser) : decoded);
        }
      }
    } catch {
      localStorage.removeItem('sweet-medical-token');
      localStorage.removeItem('sweet-medical-user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (credentials) => {
    const data = await loginUser(credentials);
    const { token: newToken, user: newUser } = data;

    localStorage.setItem('sweet-medical-token', newToken);
    localStorage.setItem('sweet-medical-user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
    navigate('/inicio');
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem('sweet-medical-token');
    localStorage.removeItem('sweet-medical-user');
    setToken(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

  const isAuthenticated = !!token && !!user;

  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
