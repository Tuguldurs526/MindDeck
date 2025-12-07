//check if the user is logged in or not 

import React, { createContext,useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthContextType, LoginCredentials,RegisterCredentials } from '../types/types';
import { authService } from '../service/AuthService';
import { Alert } from 'react-native';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

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
    try{
        const response = await authService.login(credentials);
        setToken(response.token);
        setUser(response.user);
        await AsyncStorage.setItem(TOKEN_KEY, response.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    } catch (error:any){
        Alert.alert('Login Failed', error.message);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try{
        const response = await authService.register(credentials);
        setToken(response.token);
        setUser(response.user);
        await AsyncStorage.setItem(TOKEN_KEY, response.token);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }catch (error:any){
        Alert.alert('Registration Failed', error.message);
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
  }

  return (
    <AuthContext.Provider
        value={value}
    >
      {children}
    </AuthContext.Provider>
  );


    
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
     }
        return context;
    }