import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Users, TrendingUp, Clock, MapPin, Star, Award, Heart } from 'lucide-react';
import { Layout } from '../ui/Layout';
import { SuggestionForm } from './SuggestionForm';
import { MedenineMap } from './MedenineMap';

export const CitizenPage: React.FC = () => {
  const stats = [
    {
      icon: MessageCircle,
      number: "2,847",
      label: "Demandes traitées",
      color: "text-blue-600 bg-blue-100",
      gradient: "from-blue-500 to-blue-600"
    },
    {
      icon: Users,
      number: "1,256",
      label: "Citoyens actifs",
      color: "text-green-600 bg-green-100",
      gradient: "from-green-500 to-green-600"
    },
    {
      icon: TrendingUp,
      number: "94%",
      label: "Taux de résolution",
      color: "text-orange-600 bg-orange-100",
      gradient: "from-orange-500 to-orange-600"
    },
    {
      icon: Clock,
      number: "2.3j",
      label: "Temps moyen de traitement",
      color: "text-purple-600 bg-purple-100",
      gradient: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <Layout title="SawtMedenine">
      {/* Hero Section with Background */}
      <section className="relative mb-16 -mt-8 pt-16 pb-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.8) 100%), url('https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-blue-900/40" />
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-5xl mx-auto px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
              className="mb-8"
            >
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                Ensemble, construisons
                <motion.span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300"
                  animate={{ 
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    ease: "linear" 
                  }}
                  style={{ backgroundSize: "200% 200%" }}
                >
                  l'avenir de Médenine
                </motion.span>
              </h1>
            </motion.div>
            
            <motion.p 
              className="text-xl md:text-2xl text-blue-100 leading-relaxed mb-12 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            >
              Votre participation active contribue à améliorer notre belle ville. 
              Chaque suggestion compte, chaque voix est entendue.
            </motion.p>
            
            <motion.div
              className="flex flex-wrap justify-center gap-4 mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              {[
                { icon: Star, text: "Excellence" },
                { icon: Award, text: "Qualité" },
                { icon: Heart, text: "Engagement" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20"
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.2)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <item.icon className="h-5 w-5 text-yellow-300" />
                  <span className="text-white font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 -mt-8 relative z-10">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.15,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                transition: { type: "spring", stiffness: 300 }
              }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/20 hover:shadow-3xl transition-all duration-300 group"
            >
              <div className="relative overflow-hidden">
                <motion.div 
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${stat.gradient} mb-4 shadow-lg`}
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <stat.icon className="h-7 w-7 text-white" />
                </motion.div>
                <motion.div 
                  className="text-3xl font-bold text-gray-800 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 200 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-sm text-gray-600 font-medium group-hover:text-gray-800 transition-colors">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      {/* Médenine Showcase Section */}
      <section className="mb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl shadow-2xl p-8 md:p-12 text-white overflow-hidden relative"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <motion.h2 
                className="text-4xl font-bold mb-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Découvrez Médenine
              </motion.h2>
              <motion.p 
                className="text-lg text-blue-100 mb-6 leading-relaxed"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Située dans le sud-est de la Tunisie, Médenine est une ville riche en histoire et en culture. 
                Connue pour ses ksour traditionnels et son patrimoine architectural unique, 
                elle représente un pont entre tradition et modernité.
              </motion.p>
              <motion.div 
                className="flex items-center space-x-2 text-blue-200"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <MapPin className="h-5 w-5" />
                <span>33.35495° N, 10.50548° E</span>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative"
            >
              <MedenineMap />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Form Section */}
      <section>
        <SuggestionForm />
      </section>

      {/* Additional Info */}
      <section className="mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-white to-blue-50 rounded-3xl shadow-2xl p-8 md:p-12 border border-blue-100/50"
        >
          <motion.h3 
            className="text-4xl font-bold text-gray-800 mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Comment ça marche ?
          </motion.h3>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: "1",
                title: "Soumettez",
                description: "Remplissez le formulaire avec votre suggestion ou réclamation",
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-100"
              },
              {
                step: "2", 
                title: "Analysons",
                description: "Nos équipes examinent votre demande dans les plus brefs délais",
                color: "from-orange-500 to-orange-600",
                bgColor: "bg-orange-100"
              },
              {
                step: "3",
                title: "Agissons", 
                description: "Nous mettons en œuvre les solutions adaptées",
                color: "from-green-500 to-green-600",
                bgColor: "bg-green-100"
              }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="text-center group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.2, duration: 0.6 }}
                whileHover={{ y: -10 }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </motion.div>
                <h4 className="font-bold text-xl text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
            
          {/* Process Flow Line */}
          <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2/3 h-0.5 bg-gradient-to-r from-blue-200 via-orange-200 to-green-200 -z-10"></div>
        </motion.div>
      </section>
    </Layout>
  );
};
