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
    validate: {
      validator: function(v) {
        // Accepter les mots de passe en clair (pour le hashing) ou les hashs bcrypt
        return v && (v.length >= 8 || (v.startsWith('$2b$') || v.startsWith('$2a$')) && v.length === 60);
      },
      message: 'Le mot de passe doit faire au moins 8 caractères ou être un hash bcrypt valide'
    }
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
  if (!this.isModified('passwordHash')) return next();

  try {
    // Vérifier si le mot de passe est déjà hashé
    if (this.passwordHash.startsWith('$2b$') || this.passwordHash.startsWith('$2a$')) return next();

    // Validation du mot de passe en clair
    if (this.passwordHash.length < 8) throw new Error('Le mot de passe doit faire au moins 8 caractères');

    // Générer le salt et hasher le mot de passe
    const saltRounds = 12;
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
    if (!candidatePassword || !this.passwordHash) return false;

    const isMatch = await bcrypt.compare(candidatePassword, this.passwordHash);
    console.log(`🔐 Vérification mot de passe pour ${this.email}: ${isMatch ? 'succès' : 'échec'}`);
    
    return isMatch;
  } catch (error) {
    console.error('❌ Erreur vérification mot de passe:', error);
    return false;
  }
};

// Méthodes pour gérer les tentatives de connexion et verrouillage
adminSchema.methods.incLoginAttempts = async function() {
  try {
    if (this.lockUntil && this.lockUntil < Date.now()) {
      return this.updateOne({ $unset: { lockUntil: 1 }, $set: { loginAttempts: 1 } });
    }

    const updates = { $inc: { loginAttempts: 1 } };
    const maxAttempts = 5;
    const lockTime = 30 * 60 * 1000; // 30 minutes

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

adminSchema.methods.resetLoginAttempts = async function() {
  try {
    return this.updateOne({ $unset: { loginAttempts: 1, lockUntil: 1 }, $set: { lastLogin: new Date() } });
  } catch (error) {
    console.error('❌ Erreur réinitialisation tentatives:', error);
    throw error;
  }
};

// Changement de mot de passe
adminSchema.methods.changePassword = async function(newPassword, oldPassword = null) {
  try {
    if (oldPassword) {
      const isOldPasswordValid = await this.comparePassword(oldPassword);
      if (!isOldPasswordValid) throw new Error('Ancien mot de passe incorrect');
    }

    if (this.passwordHistory && this.passwordHistory.length > 0) {
      for (const oldHash of this.passwordHistory.slice(-5)) {
        const isSamePassword = await bcrypt.compare(newPassword, oldHash.hash);
        if (isSamePassword) throw new Error('Vous ne pouvez pas réutiliser un ancien mot de passe');
      }
    }

    if (this.passwordHash) {
      this.passwordHistory.push({ hash: this.passwordHash, createdAt: new Date() });
      if (this.passwordHistory.length > 5) this.passwordHistory = this.passwordHistory.slice(-5);
    }

    this.passwordHash = newPassword;
    await this.save();
    console.log(`✅ Mot de passe changé pour: ${this.email}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur changement mot de passe:', error);
    throw error;
  }
};

// Création d'un admin
adminSchema.statics.createAdmin = async function(adminData) {
  try {
    const { email, password, firstName = '', lastName = '' } = adminData;
    const existingAdmin = await this.findOne({ email: email.toLowerCase() });
    if (existingAdmin) throw new Error('Un administrateur avec cet email existe déjà');

    const newAdmin = new this({ email: email.toLowerCase(), passwordHash: password, firstName, lastName });
    await newAdmin.save();
    console.log(`✅ Nouvel administrateur créé: ${email}`);
    return newAdmin;
  } catch (error) {
    console.error('❌ Erreur création admin:', error);
    throw error;
  }
};

// Authentification
adminSchema.statics.authenticate = async function(email, password) {
  try {
    const adminUser = await this.findOne({ email: email.toLowerCase(), isActive: true });
    if (!adminUser) return { success: false, message: 'Identifiants incorrects' };
    if (adminUser.isLocked) return { success: false, message: 'Compte temporairement verrouillé. Réessayez plus tard.' };

    const isPasswordValid = await adminUser.comparePassword(password);
    if (!isPasswordValid) {
      await adminUser.incLoginAttempts();
      return { success: false, message: 'Identifiants incorrects' };
    }

    await adminUser.resetLoginAttempts();
    return { success: true, admin: { id: adminUser._id, email: adminUser.email, firstName: adminUser.firstName, lastName: adminUser.lastName, role: adminUser.role } };
  } catch (error) {
    console.error('❌ Erreur authentification:', error);
    return { success: false, message: 'Erreur interne du serveur' };
  }
};

// Nettoyage des verrous expirés
adminSchema.statics.cleanExpiredLocks = async function() {
  try {
    const result = await this.updateMany({ lockUntil: { $lt: new Date() } }, { $unset: { lockUntil: 1, loginAttempts: 1 } });
    if (result.modifiedCount > 0) console.log(`🧹 ${result.modifiedCount} verrous expirés nettoyés`);
  } catch (error) {
    console.error('❌ Erreur nettoyage verrous:', error);
  }
};

// Gestion du modèle pour éviter l'erreur "Cannot overwrite model once compiled"
let Admin;
try {
  Admin = mongoose.model('Admin');
} catch (error) {
  Admin = mongoose.model('Admin', adminSchema);
}

module.exports = Admin;
