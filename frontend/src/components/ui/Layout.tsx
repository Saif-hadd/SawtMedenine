import React from 'react';
import { Building, MapPin } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  isAdmin?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, isAdmin = false }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className={`shadow-lg transition-all duration-300 ${
        isAdmin 
          ? 'bg-gradient-to-r from-slate-800 to-slate-900' 
          : 'bg-gradient-to-r from-blue-600 to-blue-800'
      }`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${
                isAdmin ? 'bg-slate-700' : 'bg-blue-500/20'
              }`}>
                <Building className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                <div className="flex items-center space-x-2 text-blue-100">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Ville de Médenine</span>
                </div>
              </div>
            </div>
            {!isAdmin && (
              <div className="hidden md:flex items-center space-x-6 text-blue-100">
                <span className="text-sm">Service aux citoyens</span>
                <div className="h-6 w-px bg-blue-400"></div>
                <span className="text-sm">24/7 Disponible</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className={`mt-16 py-8 ${
        isAdmin 
          ? 'bg-slate-900 text-slate-300' 
          : 'bg-white border-t border-blue-100'
      }`}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2025 Municipalité de Médenine - Tous droits réservés
          </p>
          <p className="text-xs mt-2 opacity-75">
            Plateforme citoyenne pour suggestions et réclamations
          </p>
        </div>
      </footer>
    </div>
  );
};