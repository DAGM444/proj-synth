import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser as apiLoginUser,
  registerUser as apiRegisterUser,
  getMe as apiGetMe,
  getStoredToken,
  setStoredToken,
  clearStoredToken,
} from '@/services/api';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Fetch current user on mount if token is stored
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const currentUser = await apiGetMe();
        if (isMounted) {
          if (currentUser) {
            setUser(currentUser);
            setToken(storedToken);
          } else {
            setUser(null);
            setToken(null);
            clearStoredToken();
          }
        }
      } catch (err) {
        console.error('Initial auth check failed:', err);
        if (isMounted) {
          setUser(null);
          setToken(null);
          clearStoredToken();
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const openLoginModal = useCallback(() => {
    setAuthModalMode('login');
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const openRegisterModal = useCallback(() => {
    setAuthModalMode('register');
    setAuthError(null);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthError(null);
  }, []);

  // Login handler
  const login = async ({ identifier, email, username, password }) => {
    setAuthError(null);
    try {
      const response = await apiLoginUser({
        identifier: identifier || email || username,
        password,
      });

      if (response && response.token) {
        setStoredToken(response.token);
        setToken(response.token);
        setUser(response.user);
        setIsAuthModalOpen(false);
        toast.success(`Welcome back, ${response.user.username}!`);
        return { success: true, user: response.user };
      }
      throw new Error('Unexpected response format from server');
    } catch (err) {
      const msg = err.message || 'Failed to log in';
      setAuthError(msg);
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Register handler
  const register = async ({ email, username, password }) => {
    setAuthError(null);
    try {
      const response = await apiRegisterUser({ email, username, password });

      if (response && response.token) {
        setStoredToken(response.token);
        setToken(response.token);
        setUser(response.user);
        setIsAuthModalOpen(false);
        toast.success(`Welcome to Proj Synth, ${response.user.username}!`);
        return { success: true, user: response.user };
      }
      throw new Error('Unexpected response format from server');
    } catch (err) {
      const msg = err.message || 'Failed to register';
      setAuthError(msg);
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Logout handler
  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    toast.info('Logged out successfully');
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    loading,
    isLoadingAuth: loading, // For compatibility
    authError,
    setAuthError,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    openLoginModal,
    openRegisterModal,
    closeAuthModal,
    login,
    register,
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
