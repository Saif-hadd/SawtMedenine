import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, Send, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SuggestionFormData } from '../../types';
import { SuggestionService } from '../../services/suggestionService';
import { AuthService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';
import { Toast } from '../ui/Toast';

export const SuggestionForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast, showToast, hideToast } = useToast();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset,
    watch 
  } = useForm<SuggestionFormData>();

  const watchType = watch('type');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        showToast('error', 'Le fichier ne doit pas dépasser 10MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        showToast('error', 'Seuls les fichiers JPG, PNG et PDF sont autorisés');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data: SuggestionFormData) => {
    setIsSubmitting(true);
    
    try {
      // Sanitize inputs
      const sanitizedData: SuggestionFormData = {
        name: AuthService.sanitizeInput(data.name),
        email: data.email ? AuthService.sanitizeInput(data.email) : undefined,
        type: data.type,
        subject: AuthService.sanitizeInput(data.subject),
        description: AuthService.sanitizeInput(data.description),
        attachment: selectedFile || undefined
      };

      const { data: suggestion, error } = await SuggestionService.create(sanitizedData);
      
      if (error) {
        showToast('error', error);
        return;
      }

      showToast('success', 'Votre demande a été envoyée avec succès!');
      reset();
      setSelectedFile(null);
      
    } catch (err) {
      showToast('error', 'Une erreur inattendue s\'est produite');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Votre voix compte
            </h2>
            <p className="text-gray-600">
              Partagez vos suggestions et réclamations pour améliorer notre ville
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                {...register('name', { 
                  required: 'Le nom est requis',
                  minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Votre nom complet"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email (optionnel)
              </label>
              <input
                type="email"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide'
                  }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="votre.email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Type de demande *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 ${
                    watchType === 'suggestion' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    value="suggestion"
                    {...register('type', { required: 'Veuillez sélectionner un type' })}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-2">💡</div>
                    <div className="font-semibold text-gray-700">Suggestion</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Proposer une amélioration
                    </div>
                  </div>
                </motion.label>

                <motion.label
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 ${
                    watchType === 'complaint' 
                      ? 'border-orange-500 bg-orange-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    value="complaint"
                    {...register('type', { required: 'Veuillez sélectionner un type' })}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-2">🚨</div>
                    <div className="font-semibold text-gray-700">Réclamation</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Signaler un problème
                    </div>
                  </div>
                </motion.label>
              </div>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Sujet */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sujet *
              </label>
              <input
                type="text"
                {...register('subject', { 
                  required: 'Le sujet est requis',
                  minLength: { value: 5, message: 'Le sujet doit contenir au moins 5 caractères' }
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Résumez votre demande en quelques mots"
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.subject.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description détaillée *
              </label>
              <textarea
                {...register('description', { 
                  required: 'La description est requise',
                  minLength: { value: 20, message: 'La description doit contenir au moins 20 caractères' }
                })}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Décrivez votre suggestion ou réclamation en détail..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pièce jointe (optionnel)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors duration-200">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Choisir un fichier
                    </span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      className="sr-only"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, PDF (max 10MB)
                  </p>
                </div>
                
                {selectedFile && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-blue-800 flex-1">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-4 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center space-x-2">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Envoyer ma demande</span>
                  </>
                )}
              </div>
            </motion.button>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Information importante</p>
                  <p>
                    Vos données sont traitées de manière confidentielle selon la réglementation en vigueur.
                    Vous recevrez une confirmation par email si vous avez fourni une adresse.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>

      <Toast
        type={toast.type}
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
};