import { ApiClient } from '../lib/api';
import { Admin } from '../types';

export class AuthService {
  /**
   * Connexion administrateur
   */
  static async login(email: string, password: string): Promise<{ 
    success: boolean; 
    admin?: Admin;
    error?: string 
  }> {
    try {
      const { data, error } = await ApiClient.post<{
        token: string;
        admin: Admin;
      }>('/admin/login', {
        email,
        password
      });

      if (error) {
        return { success: false, error };
      }

      if (data) {
        // Stocker le token et les informations admin
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_info', JSON.stringify(data.admin));
        return { success: true, admin: data.admin };
      }

      return { success: false, error: 'Réponse invalide du serveur' };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Erreur de connexion' 
      };
    }
  }

  /**
   * Déconnexion
   */
  static logout(): void {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem('admin_token');
    const adminInfo = localStorage.getItem('admin_info');
    return !!(token && adminInfo);
  }

  /**
   * Obtenir les informations de l'admin connecté
   */
  static getAdminInfo(): Admin | null {
    const adminInfo = localStorage.getItem('admin_info');
    if (adminInfo) {
      try {
        return JSON.parse(adminInfo);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Obtenir le token d'authentification
   */
  static getToken(): string | null {
    return localStorage.getItem('admin_token');
  }

  /**
   * Obtenir le profil de l'admin connecté depuis l'API
   */
  static async getProfile(): Promise<{ data: Admin | null; error: string | null }> {
    return ApiClient.get<Admin>('/admin/profile');
  }

  /**
   * Valider un mot de passe
   */
  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)) {
      return { 
        isValid: false, 
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial' 
      };
    }
    return { isValid: true };
  }

  /**
   * Nettoyer les entrées utilisateur
   */
  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Valider un email
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}