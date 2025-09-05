/**
 * Configuration et utilitaires pour l'API Backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export class ApiClient {
  private static baseURL = API_BASE_URL;

  /**
   * Effectuer une requête HTTP
   */
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      // Ajouter le token d'authentification si disponible
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`,
        };
      }

      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: result.message || `Erreur HTTP: ${response.status}`
        };
      }

      if (!result.success) {
        return {
          data: null,
          error: result.message || 'Erreur inconnue'
        };
      }

      return {
        data: result.data,
        error: null
      };

    } catch (error) {
      console.error('Erreur API:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      };
    }
  }

  /**
   * Requête GET
   */
  static async get<T>(endpoint: string): Promise<{ data: T | null; error: string | null }> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * Requête POST
   */
  static async post<T>(
    endpoint: string,
    data?: any
  ): Promise<{ data: T | null; error: string | null }> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Requête POST avec FormData (pour les fichiers)
   */
  static async postFormData<T>(
    endpoint: string,
    formData: FormData
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        method: 'POST',
        body: formData,
      };

      // Ajouter le token d'authentification si disponible
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers = {
          'Authorization': `Bearer ${token}`,
        };
      }

      const response = await fetch(url, config);
      const result = await response.json();

      if (!response.ok) {
        return {
          data: null,
          error: result.message || `Erreur HTTP: ${response.status}`
        };
      }

      if (!result.success) {
        return {
          data: null,
          error: result.message || 'Erreur inconnue'
        };
      }

      return {
        data: result.data,
        error: null
      };

    } catch (error) {
      console.error('Erreur API:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      };
    }
  }

  /**
   * Requête PATCH
   */
  static async patch<T>(
    endpoint: string,
    data?: any
  ): Promise<{ data: T | null; error: string | null }> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Requête DELETE
   */
  static async delete<T>(endpoint: string): Promise<{ data: T | null; error: string | null }> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Télécharger un fichier
   */
  static async downloadFile(endpoint: string): Promise<{ blob: Blob | null; error: string | null }> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const config: RequestInit = {
        method: 'GET',
      };

      // Ajouter le token d'authentification si disponible
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers = {
          'Authorization': `Bearer ${token}`,
        };
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        return {
          blob: null,
          error: `Erreur HTTP: ${response.status}`
        };
      }

      const blob = await response.blob();
      return {
        blob,
        error: null
      };

    } catch (error) {
      console.error('Erreur téléchargement:', error);
      return {
        blob: null,
        error: error instanceof Error ? error.message : 'Erreur de téléchargement'
      };
    }
  }
}