import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation } from 'lucide-react';

export const MedenineMap: React.FC = () => {
  const medenineCoords = {
    lat: 33.35495,
    lng: 10.50548
  };

  return (
    <div className="relative">
      {/* Interactive Map Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white rounded-2xl shadow-2xl p-4 border border-white/20 backdrop-blur-sm"
      >
        {/* Map Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-gray-800">Médenine, Tunisie</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
            onClick={() => window.open(`https://www.google.com/maps?q=${medenineCoords.lat},${medenineCoords.lng}`, '_blank')}
          >
            <Navigation className="h-4 w-4 text-blue-600" />
          </motion.button>
        </div>

        {/* Embedded Google Map */}
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <iframe
            src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3276.8!2d${medenineCoords.lng}!3d${medenineCoords.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12556b1b1b1b1b1b%3A0x1b1b1b1b1b1b1b1b!2sM%C3%A9denine%2C%20Tunisia!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s`}
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-xl"
          />
          
          {/* Custom Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
              <div className="text-xs text-gray-600">Coordonnées</div>
              <div className="text-sm font-semibold text-gray-800">
                {medenineCoords.lat}°N, {medenineCoords.lng}°E
              </div>
            </div>
          </div>
        </div>

        {/* Map Info */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="font-semibold text-blue-800">Région</div>
            <div className="text-blue-600">Médenine, Sud-Est</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="font-semibold text-green-800">Population</div>
            <div className="text-green-600">~65,000 hab.</div>
          </div>
        </div>
      </motion.div>

      {/* Floating Animation Elements */}
      <motion.div
        className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 rounded-full"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-2 -left-2 w-3 h-3 bg-orange-400 rounded-full"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
    </div>
  );
};