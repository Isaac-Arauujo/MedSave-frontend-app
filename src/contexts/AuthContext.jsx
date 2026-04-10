import { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, logout as authLogout, getCurrentUser } from '../services/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { user: loggedUser } = await authLogin(email, password);
      setUser(loggedUser);
      setAuthenticated(true);
      return { success: true, user: loggedUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
    setAuthenticated(false);
  };

  const value = {
    user,
    loading,
    authenticated,
    isAdmin: () => user?.role === 'ADMIN',
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
