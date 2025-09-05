/**
 * Modèle Mongoose pour les administrateurs
 * Gestion des comptes administrateur avec authentification sécurisée
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  // Informations de connexion
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [255, 'L\'email ne peut pas dépasser 255 caractères'],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Format d\'email invalide'],
    index: true // Index pour les requêtes de connexion
  },

  passwordHash: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [60, 'Hash de mot de passe invalide'] // bcrypt génère des hashs de 60 caractères
  },

  // Informations du profil
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères'],
    default: ''
  },

  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    default: ''
  },

  // Statut du compte
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  // Rôle (pour extension future)
  role: {
    type: String,
    enum: ['admin', 'super_admin'],
    default: 'admin'
  },

  // Métadonnées de sécurité
  lastLogin: {
    type: Date,
    default: null
  },

  loginAttempts: {
    type: Number,
    default: 0
  },

  lockUntil: {
    type: Date,
    default: null
  },

  // Historique des mots de passe (pour éviter la réutilisation)
  passwordHistory: [{
    hash: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Préférences
  preferences: {
    language: {
      type: String,
      enum: ['fr', 'ar'],
      default: 'fr'
    },
    timezone: {
      type: String,
      default: 'Africa/Tunis'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  }

}, {
  timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  collection: 'admins' // Nom explicite de la collection
});

// Index composé pour les requêtes de sécurité
adminSchema.index({ email: 1, isActive: 1 });

// Virtual pour vérifier si le compte est verrouillé
adminSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Middleware pre-save pour hasher le mot de passe
adminSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    // Générer le salt et hasher le mot de passe
    const saltRounds = 12; // Coût élevé pour la sécurité
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    
    console.log(`✅ Mot de passe hashé pour: ${this.email}`);
    next();
  } catch (error) {
    console.error('❌ Erreur hashage mot de passe:', error);
    next(error);
  }
});

// Méthode d'instance pour vérifier le mot de passe
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    if (!candidatePassword || !this.passwordHash) {
      return false;
    }

    const isMatch = await bcrypt.compare(candidatePassword, this.passwordHash);
    console.log(`🔐 Vérification mot de passe pour ${this.email}: ${isMatch ? 'succès' : 'échec'}`);
    
    return isMatch;
  } catch (error) {
    console.error('❌ Erreur vérification mot de passe:', error);
    return false;
  }
};

// Méthode d'instance pour incrémenter les tentatives de connexion
adminSchema.methods.incLoginAttempts = async function() {
  try {
    // Si le compte était verrouillé et que la période est expirée
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.updateOne({
        $unset: { lockUntil: 1 },
        $set: { loginAttempts: 1 }
      });
    }

    const updates = { $inc: { loginAttempts: 1 } };
    const maxAttempts = 5;
    const lockTime = 30 * 60 * 1000; // 30 minutes

    // Verrouiller le compte après 5 tentatives
    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
      updates.$set = { lockUntil: Date.now() + lockTime };
      console.log(`🔒 Compte verrouillé pour 30 minutes: ${this.email}`);
    }

    return this.updateOne(updates);
  } catch (error) {
    console.error('❌ Erreur incrémentation tentatives:', error);
    throw error;
  }
};

// Méthode d'instance pour réinitialiser les tentatives de connexion
adminSchema.methods.resetLoginAttempts = async function() {
  try {
    return this.updateOne({
      $unset: { loginAttempts: 1, lockUntil: 1 },
      $set: { lastLogin: new Date() }
    });
  } catch (error) {
    console.error('❌ Erreur réinitialisation tentatives:', error);
    throw error;
  }
};

// Méthode d'instance pour changer le mot de passe
adminSchema.methods.changePassword = async function(newPassword, oldPassword = null) {
  try {
    // Vérifier l'ancien mot de passe si fourni
    if (oldPassword) {
      const isOldPasswordValid = await this.comparePassword(oldPassword);
      if (!isOldPasswordValid) {
        throw new Error('Ancien mot de passe incorrect');
      }
    }

    // Vérifier que le nouveau mot de passe n'est pas dans l'historique
    if (this.passwordHistory && this.passwordHistory.length > 0) {
      for (const oldHash of this.passwordHistory.slice(-5)) { // Vérifier les 5 derniers
        const isSamePassword = await bcrypt.compare(newPassword, oldHash.hash);
        if (isSamePassword) {
          throw new Error('Vous ne pouvez pas réutiliser un ancien mot de passe');
        }
      }
    }

    // Ajouter l'ancien hash à l'historique
    if (this.passwordHash) {
      this.passwordHistory.push({
        hash: this.passwordHash,
        createdAt: new Date()
      });

      // Garder seulement les 5 derniers mots de passe
      if (this.passwordHistory.length > 5) {
        this.passwordHistory = this.passwordHistory.slice(-5);
      }
    }

    // Définir le nouveau mot de passe (sera hashé par le middleware pre-save)
    this.passwordHash = newPassword;
    
    await this.save();
    console.log(`✅ Mot de passe changé pour: ${this.email}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
    throw error;
  }
};

// Méthode statique pour créer un admin avec validation
adminSchema.statics.createAdmin = async function(adminData) {
  try {
    const { email, password, firstName = '', lastName = '' } = adminData;

    // Vérifier si l'admin existe déjà
    const existingAdmin = await this.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      throw new Error('Un administrateur avec cet email existe déjà');
    }

    // Créer le nouvel admin
    const admin = new this({
      email: email.toLowerCase(),
      passwordHash: password, // Sera hashé par le middleware
      firstName,
      lastName
    });

    await admin.save();
    console.log(`✅ Nouvel administrateur créé: ${email}`);
    
    return admin;
  } catch (error) {
    console.error('❌ Erreur création admin:', error);
    throw error;
  }
};

// Méthode statique pour l'authentification
adminSchema.statics.authenticate = async function(email, password) {
  try {
    const admin = await this.findOne({ 
      email: email.toLowerCase(),
      isActive: true 
    });

    if (!admin) {
      console.log(`❌ Tentative de connexion avec email inexistant: ${email}`);
      return { success: false, message: 'Identifiants incorrects' };
    }

    // Vérifier si le compte est verrouillé
    if (admin.isLocked) {
      console.log(`🔒 Tentative de connexion sur compte verrouillé: ${email}`);
      return { 
        success: false, 
        message: 'Compte temporairement verrouillé. Réessayez plus tard.' 
      };
    }

    // Vérifier le mot de passe
    const isPasswordValid = await admin.comparePassword(password);

    if (!isPasswordValid) {
      await admin.incLoginAttempts();
      return { success: false, message: 'Identifiants incorrects' };
    }

    // Connexion réussie
    await admin.resetLoginAttempts();
    
    return { 
      success: true, 
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      }
    };

  } catch (error) {
    console.error('❌ Erreur authentification:', error);
    return { success: false, message: 'Erreur interne du serveur' };
  }
};

// Méthode pour nettoyer les anciens verrous expirés
adminSchema.statics.cleanExpiredLocks = async function() {
  try {
    const result = await this.updateMany(
      { lockUntil: { $lt: new Date() } },
      { $unset: { lockUntil: 1, loginAttempts: 1 } }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`🧹 ${result.modifiedCount} verrous expirés nettoyés`);
    }
  } catch (error) {
    console.error('❌ Erreur nettoyage verrous:', error);
  }
};

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;