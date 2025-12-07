//check if the user is logged in or not 

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { authService } from '../service/AuthService';
import { AuthContextType, LoginCredentials, RegisterCredentials, User } from '../types/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// if true, we will fall back to a fake local account when network fails
const USE_DEV_FAKE_AUTH = true;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        const storedUser = await AsyncStorage.getItem(USER_KEY);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load auth state', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      // normal backend login
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.user);
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch (error: any) {
      console.warn('Login failed, error:', error?.message);

      if (!USE_DEV_FAKE_AUTH) {
        Alert.alert('Login Failed', error?.message || 'Unknown error');
        return;
      }

      // dev fallback: create a fake user so you can test navigation
      const fakeUser: any = {
        id: 'dev-user-1',
        username: 'aisha_dev',
        email: (credentials as any).email || 'test@example.com',
      };

      const fakeToken = 'dev-fake-token';

      setToken(fakeToken);
      setUser(fakeUser);
      await AsyncStorage.setItem(TOKEN_KEY, fakeToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(fakeUser));

      // optional: small alert so you know it used fake auth
      Alert.alert('Dev login', 'Backend not reachable, using fake dev account.');
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      // normal backend register
      const response = await authService.register(credentials);
      setToken(response.token);
      setUser(response.user);
      await AsyncStorage.setItem(TOKEN_KEY, response.token);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch (error: any) {
      console.warn('Registration failed, error:', error?.message);

      if (!USE_DEV_FAKE_AUTH) {
        Alert.alert('Registration Failed', error?.message || 'Unknown error');
        return;
      }

      // dev fallback: treat registration as successful with fake data
      const fakeUser: any = {
        id: 'dev-user-1',
        username: (credentials as any).username || 'aisha_dev',
        email: (credentials as any).email || 'test@example.com',
      };

      const fakeToken = 'dev-fake-token';

      setToken(fakeToken);
      setUser(fakeUser);
      await AsyncStorage.setItem(TOKEN_KEY, fakeToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(fakeUser));

      Alert.alert('Dev registration', 'Backend not reachable, using fake dev account.');
    }
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
