import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

interface AuthContextType {
  authToken: string | null;
  userId: number | null;
  login: (token: string, userId: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const login = (token: string, userId: number) => {
    setAuthToken(token);
    setUserId(userId);
  };

  const logout = () => {
    setAuthToken(null);
    setUserId(null);
  };

  const contextValue = useMemo(
    () => ({ authToken, userId, login, logout }),
    [authToken, userId]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
