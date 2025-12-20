import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
}

interface AuthReturnType {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoggingIn: boolean;
  getCurrentUser: () => User | null;
  getToken: () => string | null;
  isAuthenticated: () => boolean;
}

export const useAuth = (): AuthReturnType => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const router = useRouter();

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoggingIn(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === 'ADMIN') {
          router.push('/dashboard');
        } else {
          router.push('/rfps');
        }
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your connection.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getCurrentUser = (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const getToken = (): string | null => {
    return localStorage.getItem('token');
  };

  const isAuthenticated = (): boolean => {
    return !!getToken();
  };

  return { 
    login, 
    logout, 
    isLoggingIn, 
    getCurrentUser,
    getToken,
    isAuthenticated
  };
};