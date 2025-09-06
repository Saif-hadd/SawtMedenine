import React from 'react';
import { Building, MapPin, Phone, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, isAdmin = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`shadow-2xl backdrop-blur-sm transition-all duration-300 ${
          isAdmin 
            ? 'bg-gradient-to-r from-slate-800/95 to-slate-900/95' 
            : 'bg-gradient-to-r from-blue-600/95 via-blue-700/95 to-indigo-800/95'
        } border-b border-white/10`}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className={`p-3 rounded-xl shadow-lg ${
                  isAdmin ? 'bg-slate-700/80' : 'bg-white/20'
                } backdrop-blur-sm border border-white/20`}
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Building className="h-8 w-8 text-white drop-shadow-lg" />
              </motion.div>
              <div className="space-y-1">
                <motion.h1 
                  className="text-3xl font-bold text-white drop-shadow-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  {title}
                </motion.h1>
                <motion.div 
                  className="flex items-center space-x-2 text-blue-100"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <MapPin className="h-4 w-4 drop-shadow" />
                  <span className="text-sm font-medium">Ville de Médenine, Tunisie</span>
                </motion.div>
              </div>
            </motion.div>
            {!isAdmin && (
              <motion.div 
                className="hidden md:flex items-center space-x-6 text-blue-100"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-medium">Service aux citoyens</span>
                </div>
                <div className="h-6 w-px bg-blue-300/50"></div>
                <div className="flex items-center space-x-2 bg-green-500/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">24/7 Disponible</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        {children}
      </motion.main>

      {/* Footer */}
      <motion.footer 
        className={`mt-16 py-12 ${
          isAdmin 
            ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-slate-300' 
            : 'bg-gradient-to-r from-white to-blue-50 border-t border-blue-100/50'
        } backdrop-blur-sm`}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
            <div>
              <h3 className={`font-bold text-lg mb-3 ${isAdmin ? 'text-white' : 'text-gray-800'}`}>
                Municipalité de Médenine
              </h3>
              <p className={`text-sm ${isAdmin ? 'text-slate-400' : 'text-gray-600'}`}>
                Plateforme citoyenne pour suggestions et réclamations
              </p>
            </div>
            <div>
              <h4 className={`font-semibold mb-3 ${isAdmin ? 'text-white' : 'text-gray-800'}`}>
                Contact
              </h4>
              <div className={`space-y-2 text-sm ${isAdmin ? 'text-slate-400' : 'text-gray-600'}`}>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+216 75 640 001</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>contact@medenine.tn</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className={`font-semibold mb-3 ${isAdmin ? 'text-white' : 'text-gray-800'}`}>
                Localisation
              </h4>
              <p className={`text-sm ${isAdmin ? 'text-slate-400' : 'text-gray-600'}`}>
                Médenine, Tunisie<br />
                33.35495° N, 10.50548° E
              </p>
            </div>
          </div>
          <div className={`mt-8 pt-8 border-t ${isAdmin ? 'border-slate-700' : 'border-gray-200'} text-center`}>
            <p className={`text-sm ${isAdmin ? 'text-slate-400' : 'text-gray-600'}`}>
              © 2025 Municipalité de Médenine - Tous droits réservés
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};
