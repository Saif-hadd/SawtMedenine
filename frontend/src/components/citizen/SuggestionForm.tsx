import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload, Send, FileText, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
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
      const maxSize = 5 * 1024 * 1024; // 5MB (selon le backend)
      if (file.size > maxSize) {
        showToast('error', 'Le fichier ne doit pas dépasser 5MB');
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
        file: selectedFile || undefined
      };

      const { data: suggestion, error } = await SuggestionService.create(sanitizedData);
      
      if (error) {
        showToast('error', error);
        return;
      }

      showToast('success', 'Votre demande a été envoyée avec succès!');
      reset();
      setSelectedFile(null);
      
      // Réinitialiser le champ file
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234F46E5' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative z-10">
            <motion.div 
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Sparkles className="h-8 w-8 text-white" />
                </motion.div>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
              Votre voix compte
              </h2>
              <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
              Partagez vos suggestions et réclamations pour améliorer notre ville
              </p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Nom */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <label className="block text-sm font-bold text-gray-700 mb-3">
                Nom complet *
                </label>
                <input
                type="text"
                {...register('name', { 
                  required: 'Le nom est requis',
                  minLength: { value: 2, message: 'Le nom doit contenir au moins 2 caractères' },
                  maxLength: { value: 100, message: 'Le nom ne peut pas dépasser 100 caractères' }
                })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                placeholder="Votre nom complet"
                />
                {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name.message}
                </p>
                )}
              </motion.div>

            {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <label className="block text-sm font-bold text-gray-700 mb-3">
                Email (optionnel)
                </label>
                <input
                type="email"
                {...register('email', {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Adresse email invalide'
                  },
                  maxLength: { value: 255, message: 'L\'email ne peut pas dépasser 255 caractères' }
                })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                placeholder="votre.email@example.com"
                />
                {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.email.message}
                </p>
                )}
              </motion.div>

            {/* Type */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <label className="block text-sm font-bold text-gray-700 mb-4">
                Type de demande *
                </label>
                <div className="grid grid-cols-2 gap-6">
                <motion.label
                    whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer border-2 rounded-2xl p-6 transition-all duration-300 ${
                    watchType === 'Suggestion' 
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg' 
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    value="Suggestion"
                    {...register('type', { required: 'Veuillez sélectionner un type' })}
                    className="sr-only"
                  />
                  <div className="text-center">
                      <div className="text-3xl mb-3">💡</div>
                      <div className="font-bold text-gray-800 text-lg">Suggestion</div>
                      <div className="text-sm text-gray-600 mt-2">
                      Proposer une amélioration
                    </div>
                  </div>
                </motion.label>

                <motion.label
                    whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer border-2 rounded-2xl p-6 transition-all duration-300 ${
                    watchType === 'Réclamation' 
                        ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg' 
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    value="Réclamation"
                    {...register('type', { required: 'Veuillez sélectionner un type' })}
                    className="sr-only"
                  />
                  <div className="text-center">
                      <div className="text-3xl mb-3">🚨</div>
                      <div className="font-bold text-gray-800 text-lg">Réclamation</div>
                      <div className="text-sm text-gray-600 mt-2">
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
              </motion.div>

            {/* Sujet */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <label className="block text-sm font-bold text-gray-700 mb-3">
                Sujet *
                </label>
                <input
                type="text"
                {...register('subject', { 
                  required: 'Le sujet est requis',
                  minLength: { value: 5, message: 'Le sujet doit contenir au moins 5 caractères' },
                  maxLength: { value: 200, message: 'Le sujet ne peut pas dépasser 200 caractères' }
                })}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-gray-50/50 hover:bg-white"
                placeholder="Résumez votre demande en quelques mots"
                />
                {errors.subject && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.subject.message}
                </p>
                )}
              </motion.div>

            {/* Description */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <label className="block text-sm font-bold text-gray-700 mb-3">
                Description détaillée *
                </label>
                <textarea
                {...register('description', { 
                  required: 'La description est requise',
                  minLength: { value: 10, message: 'La description doit contenir au moins 10 caractères' },
                  maxLength: { value: 2000, message: 'La description ne peut pas dépasser 2000 caractères' }
                })}
                  rows={6}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 resize-none bg-gray-50/50 hover:bg-white"
                placeholder="Décrivez votre suggestion ou réclamation en détail..."
                />
                {errors.description && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.description.message}
                </p>
                )}
              </motion.div>

            {/* Upload */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <label className="block text-sm font-bold text-gray-700 mb-3">
                Pièce jointe (optionnel)
                </label>
                <motion.div 
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-blue-400 transition-all duration-300 bg-gray-50/30 hover:bg-blue-50/50"
                  whileHover={{ scale: 1.02 }}
                >
                <div className="text-center">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                    </motion.div>
                  <label className="cursor-pointer">
                      <span className="text-blue-600 hover:text-blue-700 font-bold text-lg">
                      Choisir un fichier
                    </span>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                      className="sr-only"
                    />
                  </label>
                    <p className="text-sm text-gray-500 mt-2">
                    PNG, JPG, PDF (max 5MB)
                  </p>
                </div>
                
                {selectedFile && (
                    <motion.div 
                      className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl flex items-center border border-blue-200"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle2 className="h-6 w-6 text-green-600 mr-3" />
                      <span className="text-sm text-gray-800 flex-1 font-medium">{selectedFile.name}</span>
                      <motion.button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                      Supprimer
                      </motion.button>
                    </motion.div>
                )}
                </motion.div>
              </motion.div>

            {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white font-bold py-5 px-8 rounded-2xl hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
            >
              <div className="flex items-center justify-center space-x-2">
                {isSubmitting ? (
                  <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span className="text-lg">Envoi en cours...</span>
                  </>
                ) : (
                  <>
                      <Send className="h-6 w-6" />
                      <span className="text-lg">Envoyer ma demande</span>
                  </>
                )}
              </div>
              </motion.button>

            {/* Info */}
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <div className="flex">
                  <AlertCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-bold mb-2 text-base">Information importante</p>
                  <p>
                    Vos données sont traitées de manière confidentielle selon la réglementation en vigueur.
                    Vous recevrez une confirmation par email si vous avez fourni une adresse.
                  </p>
                </div>
                </div>
              </motion.div>
          </form>
          </div>
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