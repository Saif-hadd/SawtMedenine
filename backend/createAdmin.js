/**
 * Script de création d'un administrateur initial - VERSION CORRIGÉE
 * Utilise la méthode createAdmin pour hash automatique
 */

const mongoose = require('mongoose');
require('dotenv').config();
const Admin = require('./models/Admin'); // Ajustez le chemin si nécessaire

const createInitialAdmin = async () => {
  try {
    console.log('🔧 Création de l\'administrateur initial...');

    // Vérifier si un admin existe déjà
    const existingAdmin = await Admin.findOne({ email: 'admin@medenine4100.tn' });

    if (existingAdmin) {
      console.log('⚠️ Admin existant trouvé. Suppression...');
      await Admin.deleteOne({ _id: existingAdmin._id });
      console.log('✅ Admin existant supprimé');
    }

    // Créer le nouvel admin - le mot de passe sera hashé automatiquement par le middleware
    const adminData = {
      email: 'admin@medenine4100.tn',
      password: 'Admin4100Medenine@', // mot de passe clair
      firstName: 'Admin',
      lastName: 'Med'
    };

    const admin = await Admin.createAdmin(adminData);

    console.log('✅ Nouvel administrateur créé avec succès !');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe:', adminData.password);
    console.log('⚠️  Changez ce mot de passe après la première connexion !');

    // Test de connexion pour vérifier que tout fonctionne
    console.log('\n🧪 Test de connexion...');
    const authResult = await Admin.authenticate(adminData.email, adminData.password);
    
    if (authResult.success) {
      console.log('✅ Test de connexion réussi !');
    } else {
      console.log('❌ Test de connexion échoué:', authResult.message);
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error.message);
  }
};

const main = async () => {
  try {
    console.log('🔗 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medenine');
    console.log('✅ Connecté à MongoDB');

    await createInitialAdmin();

    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
};

// Lancer le script
if (require.main === module) {
  main();
}

module.exports = { createInitialAdmin };