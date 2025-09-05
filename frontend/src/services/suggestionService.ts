import { ApiClient } from '../lib/api';
import { Suggestion, SuggestionFormData, SubmissionsResponse, DashboardStats } from '../types';

export class SuggestionService {
  /**
   * Créer une nouvelle suggestion/réclamation
   */
  static async create(data: SuggestionFormData): Promise<{ 
    data: Suggestion | null; 
    error: string | null 
  }> {
    try {
      const formData = new FormData();
      
      // Ajouter les champs texte
      formData.append('name', data.name);
      if (data.email) {
        formData.append('email', data.email);
      }
      formData.append('type', data.type);
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      
      // Ajouter le fichier s'il existe
      if (data.file) {
        formData.append('file', data.file);
      }

      return ApiClient.postFormData<Suggestion>('/citizen/submission', formData);
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Une erreur inattendue s\'est produite' 
      };
    }
  }

  /**
   * Obtenir toutes les suggestions (admin)
   */
  static async getAll(params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ data: SubmissionsResponse | null; error: string | null }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/admin/submissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return ApiClient.get<SubmissionsResponse>(endpoint);
    } catch (err) {
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Erreur lors de la récupération des données' 
      };
    }
  }

  /**
   * Obtenir une suggestion spécifique (admin)
   */
  static async getById(id: string): Promise<{ data: Suggestion | null; error: string | null }> {
    return ApiClient.get<Suggestion>(`/admin/submission/${id}`);
  }

  /**
   * Mettre à jour le statut d'une suggestion (admin)
   */
  static async updateStatus(
    id: string, 
    status: Suggestion['status']
  ): Promise<{ error: string | null }> {
    const { error } = await ApiClient.patch(`/admin/submission/${id}/status`, { status });
    return { error };
  }

  /**
   * Mettre à jour les notes internes d'une suggestion (admin)
   */
  static async updateNotes(
    id: string, 
    notes: string
  ): Promise<{ error: string | null }> {
    const { error } = await ApiClient.patch(`/admin/submission/${id}/notes`, { notes });
    return { error };
  }

  /**
   * Supprimer une suggestion (admin)
   */
  static async delete(id: string): Promise<{ error: string | null }> {
    const { error } = await ApiClient.delete(`/admin/submission/${id}`);
    return { error };
  }

  /**
   * Exporter les suggestions en CSV (admin)
   */
  static async exportCSV(params?: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ error: string | null }> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const endpoint = `/admin/export${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const { blob, error } = await ApiClient.downloadFile(endpoint);

      if (error) {
        return { error };
      }

      if (blob) {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `soumissions_medenine_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return { error: null };
    } catch (err) {
      return { 
        error: err instanceof Error ? err.message : 'Erreur lors de l\'export' 
      };
    }
  }

  /**
   * Obtenir les statistiques du dashboard (admin)
   */
  static async getDashboardStats(): Promise<{ 
    data: DashboardStats | null; 
    error: string | null 
  }> {
    return ApiClient.get<DashboardStats>('/admin/dashboard/stats');
  }

  /**
   * Obtenir les statistiques publiques
   */
  static async getPublicStats(): Promise<{ 
    data: any | null; 
    error: string | null 
  }> {
    return ApiClient.get('/citizen/stats');
  }

  /**
   * Vérifier le statut d'une suggestion (public)
   */
  static async checkStatus(id: string): Promise<{ 
    data: Partial<Suggestion> | null; 
    error: string | null 
  }> {
    return ApiClient.get<Partial<Suggestion>>(`/citizen/submission/${id}/status`);
  }

  /**
   * Obtenir les types de soumissions disponibles
   */
  static async getTypes(): Promise<{ 
    data: Array<{
      value: string;
      label: string;
      description: string;
      icon: string;
    }> | null; 
    error: string | null 
  }> {
    return ApiClient.get('/citizen/types');
  }

  /**
   * Vérifier l'état du service
   */
  static async healthCheck(): Promise<{ 
    data: any | null; 
    error: string | null 
  }> {
    return ApiClient.get('/citizen/health');
  }

  /**
   * Utilitaire pour formater les dates
   */
  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Utilitaire pour obtenir le libellé du statut
   */
  static getStatusLabel(status: Suggestion['status']): string {
    switch (status) {
      case 'Nouveau':
        return 'Nouveau';
      case 'En cours':
        return 'En cours';
      case 'Traité':
        return 'Traité';
      default:
        return status;
    }
  }

  /**
   * Utilitaire pour obtenir le libellé du type
   */
  static getTypeLabel(type: Suggestion['type']): string {
    return type;
  }

  /**
   * Utilitaire pour obtenir la classe CSS du statut
   */
  static getStatusBadgeClass(status: Suggestion['status']): string {
    switch (status) {
      case 'Nouveau':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'En cours':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Traité':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  /**
   * Utilitaire pour obtenir la classe CSS du type
   */
  static getTypeBadgeClass(type: Suggestion['type']): string {
    switch (type) {
      case 'Suggestion':
        return 'bg-green-100 text-green-800';
      case 'Réclamation':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}