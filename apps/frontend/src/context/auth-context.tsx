"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

// Define user type
export type User = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
};

// Define auth context type
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  signup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
};

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real implementation, you would verify the token with your API
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Authentication error:", error);
        // Clear any invalid data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Dummy login function - replace with actual API call
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // DUMMY VALIDATION - Replace with actual API call
      if (email === "user@example.com" && password === "password") {
        // Dummy user data - this would come from your API
        const userData: User = {
          id: "user-123",
          email: "user@example.com",
          name: "John Doe",
          role: "user",
        };

        // Store user data and token
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", "dummy-jwt-token");

        setUser(userData);
        return { success: true };
      }

      return {
        success: false,
        message: "Invalid email or password",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An error occurred during login. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Dummy signup function - replace with actual API call
  const signup = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);

    try {
      // Simulate API request delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // DUMMY VALIDATION - Replace with actual API call
      // In a real implementation, you would send this data to your API
      if (email && password && name) {
        // Dummy user data - this would come from your API after successful registration
        const userData: User = {
          id: `user-${Date.now()}`,
          email,
          name,
          role: "user",
        };

        // Store user data and token
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", "dummy-jwt-token");

        setUser(userData);
        return { success: true };
      }

      return {
        success: false,
        message: "Please provide all required information",
      };
    } catch (error) {
      console.error("Signup error:", error);
      return {
        success: false,
        message: "An error occurred during signup. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // Compute authentication status
  const isAuthenticated = !!user;

  // Create the context value object
  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
