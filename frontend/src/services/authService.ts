import { supabase } from '../lib/supabase';

export class AuthService {
  static async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Simulate admin authentication since we're using Supabase Auth
      // In production, you'd set up proper admin roles in Supabase
      if (email === 'admin@medenine.tn' && password === 'Admin123!Medenine') {
        localStorage.setItem('admin_session', 'authenticated');
        return { success: true };
      }
      
      return { success: false, error: 'Identifiants incorrects' };
    } catch (err) {
      return { success: false, error: 'Erreur de connexion' };
    }
  }

  static logout(): void {
    localStorage.removeItem('admin_session');
  }

  static isAuthenticated(): boolean {
    return localStorage.getItem('admin_session') === 'authenticated';
  }

  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 8) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' };
    }
    return { isValid: true };
  }

  static sanitizeInput(input: string): string {
    return input.trim().replace(/[<>]/g, '');
  }
}