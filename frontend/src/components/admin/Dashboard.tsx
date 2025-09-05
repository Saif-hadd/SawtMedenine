import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Filter, 
  Download, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  LogOut,
  Search,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from '../ui/Layout';
import { SuggestionService } from '../../services/suggestionService';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../ui/Toast';
import { Suggestion } from '../../types';

export const Dashboard: React.FC = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);
  
  const { logout } = useAuth();
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    filterSuggestions();
  }, [suggestions, selectedStatus, selectedType, searchTerm]);

  const loadSuggestions = async () => {
    setIsLoading(true);
    const { data, error } = await SuggestionService.getAll();
    
    if (error) {
      showToast('error', error);
    } else if (data) {
      setSuggestions(data);
    }
    
    setIsLoading(false);
  };

  const filterSuggestions = () => {
    let filtered = suggestions;

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(s => s.status === selectedStatus);
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(s => s.type === selectedType);
    }

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSuggestions(filtered);
  };

  const handleStatusUpdate = async (id: string, newStatus: Suggestion['status']) => {
    const { error } = await SuggestionService.updateStatus(id, newStatus);
    
    if (error) {
      showToast('error', error);
    } else {
      setSuggestions(prev => prev.map(s => 
        s.id === id ? { ...s, status: newStatus, updated_at: new Date().toISOString() } : s
      ));
      showToast('success', 'Statut mis à jour avec succès');
    }
  };

  const handleExport = () => {
    SuggestionService.exportToCSV(filteredSuggestions);
    showToast('success', 'Export CSV généré avec succès');
  };

  const getStatusIcon = (status: Suggestion['status']) => {
    switch (status) {
      case 'new':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
  };

  const getStatusLabel = (status: Suggestion['status']) => {
    switch (status) {
      case 'new':
        return 'Nouveau';
      case 'in_progress':
        return 'En cours';
      case 'resolved':
        return 'Traité';
    }
  };

  const getStatusBadgeClass = (status: Suggestion['status']) => {
    switch (status) {
      case 'new':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const stats = [
    {
      label: 'Total',
      value: suggestions.length,
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      label: 'Nouveaux',
      value: suggestions.filter(s => s.status === 'new').length,
      icon: AlertTriangle,
      color: 'bg-orange-500'
    },
    {
      label: 'En cours',
      value: suggestions.filter(s => s.status === 'in_progress').length,
      icon: Clock,
      color: 'bg-blue-500'
    },
    {
      label: 'Traités',
      value: suggestions.filter(s => s.status === 'resolved').length,
      icon: CheckCircle,
      color: 'bg-green-500'
    }
  ];

  if (isLoading) {
    return (
      <Layout title="Tableau de bord administrateur" isAdmin>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Layout title="Tableau de bord administrateur" isAdmin>
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Gestion des demandes citoyennes
          </h2>
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className={`inline-flex p-3 rounded-lg ${stat.color} text-white mb-3`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, sujet ou description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="new">Nouveau</option>
                <option value="in_progress">En cours</option>
                <option value="resolved">Traité</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tous les types</option>
                <option value="suggestion">Suggestions</option>
                <option value="complaint">Réclamations</option>
              </select>
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Suggestions Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Citoyen
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Sujet
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuggestions.map((suggestion) => (
                  <motion.tr
                    key={suggestion.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {new Date(suggestion.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {suggestion.name}
                        </div>
                        {suggestion.email && (
                          <div className="text-sm text-gray-500">
                            {suggestion.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        suggestion.type === 'suggestion' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {suggestion.type === 'suggestion' ? 'Suggestion' : 'Réclamation'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {suggestion.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={suggestion.status}
                        onChange={(e) => handleStatusUpdate(suggestion.id, e.target.value as Suggestion['status'])}
                        className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusBadgeClass(suggestion.status)}`}
                      >
                        <option value="new">Nouveau</option>
                        <option value="in_progress">En cours</option>
                        <option value="resolved">Traité</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedSuggestion(suggestion)}
                        className="text-blue-600 hover:text-blue-800 mr-3 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>

            {filteredSuggestions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aucune demande trouvée</p>
              </div>
            )}
          </div>
        </div>
      </Layout>

      {/* Detail Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {selectedSuggestion.subject}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>{selectedSuggestion.name}</span>
                    {selectedSuggestion.email && <span>{selectedSuggestion.email}</span>}
                    <span>{new Date(selectedSuggestion.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSuggestion(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Type and Status */}
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedSuggestion.type === 'suggestion' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedSuggestion.type === 'suggestion' ? 'Suggestion' : 'Réclamation'}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadgeClass(selectedSuggestion.status)}`}>
                    {getStatusIcon(selectedSuggestion.status)}
                    <span className="ml-1">{getStatusLabel(selectedSuggestion.status)}</span>
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedSuggestion.description}
                  </p>
                </div>

                {/* Attachment */}
                {selectedSuggestion.attachment_url && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Pièce jointe</h4>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-600 flex-1">
                        {selectedSuggestion.attachment_name}
                      </span>
                      <a
                        href={selectedSuggestion.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Voir
                      </a>
                    </div>
                  </div>
                )}

                {/* Status Update */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Modifier le statut</h4>
                  <select
                    value={selectedSuggestion.status}
                    onChange={(e) => {
                      handleStatusUpdate(selectedSuggestion.id, e.target.value as Suggestion['status']);
                      setSelectedSuggestion(prev => prev ? { ...prev, status: e.target.value as Suggestion['status'] } : null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="new">Nouveau</option>
                    <option value="in_progress">En cours</option>
                    <option value="resolved">Traité</option>
                  </select>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
};