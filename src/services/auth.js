import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    const { token, nome, email: userEmail, role, id } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({
      id,
      nome,
      email: userEmail,
      role
    }));
    
    return { user: { id, nome, email: userEmail, role }, token };
  } catch (error) {
    const message = error.response?.data?.message || 'Erro ao fazer login';
    throw new Error(message);
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
};