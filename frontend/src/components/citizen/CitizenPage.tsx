import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, TrendingUp, Clock } from 'lucide-react';
import { Layout } from '../ui/Layout';
import { SuggestionForm } from './SuggestionForm';

export const CitizenPage: React.FC = () => {
  const stats = [
    {
      icon: MessageCircle,
      number: "2,847",
      label: "Demandes traitées",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: Users,
      number: "1,256",
      label: "Citoyens actifs",
      color: "text-green-600 bg-green-100"
    },
    {
      icon: TrendingUp,
      number: "94%",
      label: "Taux de résolution",
      color: "text-orange-600 bg-orange-100"
    },
    {
      icon: Clock,
      number: "2.3j",
      label: "Temps moyen de traitement",
      color: "text-purple-600 bg-purple-100"
    }
  ];

  return (
    <Layout title="Suggestions & Réclamations">
      {/* Hero Section */}
      <section className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Ensemble, construisons
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-600">
              l'avenir de Médenine
            </span>
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Votre participation active contribue à améliorer notre belle ville. 
            Chaque suggestion compte, chaque voix est entendue.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
            >
              <div className={`inline-flex p-3 rounded-lg ${stat.color} mb-3`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-1">
                {stat.number}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form Section */}
      <section>
        <SuggestionForm />
      </section>

      {/* Additional Info */}
      <section className="mt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Comment ça marche ?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Soumettez</h4>
              <p className="text-gray-600 text-sm">
                Remplissez le formulaire avec votre suggestion ou réclamation
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-orange-600">2</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Analysons</h4>
              <p className="text-gray-600 text-sm">
                Nos équipes examinent votre demande dans les plus brefs délais
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-green-600">3</span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">Agissons</h4>
              <p className="text-gray-600 text-sm">
                Nous mettons en œuvre les solutions adaptées
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </Layout>
  );
};