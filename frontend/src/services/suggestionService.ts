import { supabase } from '../lib/supabase';
import { Suggestion, SuggestionFormData } from '../types';

export class SuggestionService {
  static async create(data: SuggestionFormData): Promise<{ data: Suggestion | null; error: string | null }> {
    try {
      // Handle file upload if present
      let attachmentUrl = null;
      let attachmentName = null;
      
      if (data.attachment) {
        const fileExt = data.attachment.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, data.attachment);
          
        if (uploadError) {
          return { data: null, error: 'Erreur lors de l\'upload du fichier' };
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('attachments')
          .getPublicUrl(fileName);
          
        attachmentUrl = publicUrl;
        attachmentName = data.attachment.name;
      }

      const { data: suggestion, error } = await supabase
        .from('suggestions')
        .insert([{
          name: data.name,
          email: data.email || null,
          type: data.type,
          subject: data.subject,
          description: data.description,
          attachment_url: attachmentUrl,
          attachment_name: attachmentName,
          status: 'new'
        }])
        .select()
        .single();

      if (error) {
        return { data: null, error: error.message };
      }

      return { data: suggestion, error: null };
    } catch (err) {
      return { data: null, error: 'Une erreur inattendue s\'est produite' };
    }
  }

  static async getAll(): Promise<{ data: Suggestion[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: 'Erreur lors de la récupération des données' };
    }
  }

  static async updateStatus(id: string, status: Suggestion['status']): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('suggestions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: 'Erreur lors de la mise à jour' };
    }
  }

  static async delete(id: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('suggestions')
        .delete()
        .eq('id', id);

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err) {
      return { error: 'Erreur lors de la suppression' };
    }
  }

  static exportToCSV(suggestions: Suggestion[]): void {
    const headers = ['Date', 'Nom', 'Email', 'Type', 'Sujet', 'Description', 'Statut'];
    const csvContent = [
      headers.join(','),
      ...suggestions.map(s => [
        new Date(s.created_at).toLocaleDateString('fr-FR'),
        `"${s.name}"`,
        `"${s.email || 'N/A'}"`,
        s.type === 'suggestion' ? 'Suggestion' : 'Réclamation',
        `"${s.subject}"`,
        `"${s.description.replace(/"/g, '""')}"`,
        s.status === 'new' ? 'Nouveau' : s.status === 'in_progress' ? 'En cours' : 'Traité'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `suggestions-medenine-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
}