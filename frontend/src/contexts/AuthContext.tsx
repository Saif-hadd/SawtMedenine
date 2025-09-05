import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, Admin } from '../types';
import { AuthService } from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuth = AuthService.isAuthenticated();
        setIsAuthenticated(isAuth);

        if (isAuth) {
          // Récupérer les informations admin depuis le localStorage
          const adminInfo = AuthService.getAdminInfo();
          if (adminInfo) {
            setAdmin(adminInfo);
          } else {
            // Si pas d'infos en local, essayer de les récupérer depuis l'API
            const { data, error } = await AuthService.getProfile();
            if (data && !error) {
              setAdmin(data);
              localStorage.setItem('admin_info', JSON.stringify(data));
            } else {
              // Token invalide, déconnecter
              AuthService.logout();
              setIsAuthenticated(false);
              setAdmin(null);
            }
          }
        }
      } catch (error) {
        console.error('Erreur initialisation auth:', error);
        AuthService.logout();
        setIsAuthenticated(false);
        setAdmin(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { success, admin: adminData, error } = await AuthService.login(email, password);
      
      if (success && adminData) {
        setIsAuthenticated(true);
        setAdmin(adminData);
        return true;
      } else {
        console.error('Erreur de connexion:', error);
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      admin,
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};