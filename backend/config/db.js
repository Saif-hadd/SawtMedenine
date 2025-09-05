/**
 * Configuration de la base de données MongoDB Atlas
 * Connexion sécurisée avec gestion d'erreurs
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    console.log(`✅ MongoDB Atlas connecté: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB déconnecté');
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔒 Connexion MongoDB fermée suite à l\'arrêt de l\'application');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB Atlas:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
