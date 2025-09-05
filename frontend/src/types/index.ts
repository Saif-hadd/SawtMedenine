export interface Suggestion {
  _id: string;
  name: string;
  email?: string;
  type: 'Suggestion' | 'Réclamation';
  subject: string;
  description: string;
  fileUrl?: string;
  fileInfo?: {
    originalName: string;
    cloudinaryId: string;
    fileType: string;
    fileSize: number;
  };
  status: 'Nouveau' | 'En cours' | 'Traité';
  processedBy?: string;
  processedAt?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  admin: Admin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface SuggestionFormData {
  name: string;
  email?: string;
  type: 'Suggestion' | 'Réclamation';
  subject: string;
  description: string;
  file?: File;
}

export interface DashboardStats {
  general: {
    total: number;
    suggestions: number;
    complaints: number;
    nouveau: number;
    enCours: number;
    traite: number;
  };
  monthly: Array<{
    _id: { year: number; month: number };
    count: number;
    suggestions: number;
    complaints: number;
  }>;
  processingTime: {
    average: number;
    minimum: number;
    maximum: number;
  };
  recent: Array<{
    _id: string;
    name: string;
    type: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  code?: string;
}

export interface PaginationInfo {
  current: number;
  total: number;
  count: number;
  totalCount: number;
}

export interface SubmissionsResponse {
  submissions: Suggestion[];
  pagination: PaginationInfo;
  stats: DashboardStats['general'];
  filters: {
    type: string;
    status: string;
    search: string;
    dateFrom?: string;
    dateTo?: string;
  };
}