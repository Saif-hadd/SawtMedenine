export interface Suggestion {
  id: string;
  name: string;
  email?: string;
  type: 'suggestion' | 'complaint';
  subject: string;
  description: string;
  attachment_url?: string;
  attachment_name?: string;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface SuggestionFormData {
  name: string;
  email?: string;
  type: 'suggestion' | 'complaint';
  subject: string;
  description: string;
  attachment?: File;
}