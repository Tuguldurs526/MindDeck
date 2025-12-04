export interface User {
    id: string;
    username: string;
    email: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    username: string;
    email: string;
    password: string;
  }
  
  export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  
  export type Screen = 'login' | 'register' | 'home';

  export interface FormValues {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }