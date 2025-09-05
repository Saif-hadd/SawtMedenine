/**
 * Modèle Mongoose pour les soumissions citoyennes
 * Suggestions et réclamations des citoyens de Médenine
 */

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  // Informations du citoyen
  name: {
    type: String,
    required: [true, 'Le nom est requis'],
    trim: true,
    minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    match: [/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets']
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [255, 'L\'email ne peut pas dépasser 255 caractères'],
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Format d\'email invalide'],
    default: null
  },

  // Type de soumission
  type: {
    type: String,
    required: [true, 'Le type de soumission est requis'],
    enum: {
      values: ['Suggestion', 'Réclamation'],
      message: 'Le type doit être "Suggestion" ou "Réclamation"'
    },
    index: true // Index pour les requêtes de filtrage
  },

  // Contenu de la soumission
  subject: {
    type: String,
    required: [true, 'Le sujet est requis'],
    trim: true,
    minlength: [5, 'Le sujet doit contenir au moins 5 caractères'],
    maxlength: [200, 'Le sujet ne peut pas dépasser 200 caractères']
  },

  description: {
    type: String,
    required: [true, 'La description est requise'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères'],
    maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères']
  },

  // Fichier joint (optionnel)
  fileUrl: {
    type: String,
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Optionnel
        return /^https?:\/\/.+/.test(v); // URL valide
      },
      message: 'L\'URL du fichier doit être valide'
    }
  },

  // Informations sur le fichier
  fileInfo: {
    originalName: {
      type: String,
      default: null
    },
    cloudinaryId: {
      type: String,
      default: null
    },
    fileType: {
      type: String,
      enum: ['image', 'pdf', null],
      default: null
    },
    fileSize: {
      type: Number,
      default: null
    }
  },

  // Statut de traitement
  status: {
    type: String,
    required: true,
    enum: {
      values: ['Nouveau', 'En cours', 'Traité'],
      message: 'Le statut doit être "Nouveau", "En cours" ou "Traité"'
    },
    default: 'Nouveau',
    index: true // Index pour les requêtes de filtrage
  },

  // Métadonnées de traitement
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    default: null
  },

  processedAt: {
    type: Date,
    default: null
  },

  // Notes internes (visibles uniquement par les admins)
  internalNotes: {
    type: String,
    maxlength: [1000, 'Les notes internes ne peuvent pas dépasser 1000 caractères'],
    default: ''
  }

}, {
  timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  collection: 'submissions' // Nom explicite de la collection
});

// Index composé pour les requêtes de filtrage et tri
submissionSchema.index({ type: 1, status: 1, createdAt: -1 });

// Index de recherche textuelle
submissionSchema.index({
  name: 'text',
  subject: 'text',
  description: 'text'
}, {
  weights: {
    subject: 10,
    name: 5,
    description: 1
  },
  name: 'submission_text_index'
});

// Middleware pre-save pour la validation et nettoyage
submissionSchema.pre('save', function(next) {
  // Nettoyer les champs texte
  if (this.name) this.name = this.name.trim();
  if (this.email) this.email = this.email.trim().toLowerCase();
  if (this.subject) this.subject = this.subject.trim();
  if (this.description) this.description = this.description.trim();

  // Mettre à jour processedAt si le statut change
  if (this.isModified('status') && this.status !== 'Nouveau') {
    this.processedAt = new Date();
  }

  next();
});

// Méthode d'instance pour obtenir un résumé de la soumission
submissionSchema.methods.getSummary = function() {
  return {
    id: this._id,
    name: this.name,
    type: this.type,
    subject: this.subject,
    status: this.status,
    hasFile: !!this.fileUrl,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Méthode statique pour les statistiques
submissionSchema.statics.getStats = async function() {
  try {
    const stats = await this.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          suggestions: {
            $sum: { $cond: [{ $eq: ['$type', 'Suggestion'] }, 1, 0] }
          },
          complaints: {
            $sum: { $cond: [{ $eq: ['$type', 'Réclamation'] }, 1, 0] }
          },
          nouveau: {
            $sum: { $cond: [{ $eq: ['$status', 'Nouveau'] }, 1, 0] }
          },
          enCours: {
            $sum: { $cond: [{ $eq: ['$status', 'En cours'] }, 1, 0] }
          },
          traite: {
            $sum: { $cond: [{ $eq: ['$status', 'Traité'] }, 1, 0] }
          }
        }
      }
    ]);

    return stats[0] || {
      total: 0,
      suggestions: 0,
      complaints: 0,
      nouveau: 0,
      enCours: 0,
      traite: 0
    };
  } catch (error) {
    console.error('❌ Erreur calcul statistiques:', error);
    throw error;
  }
};

// Méthode statique pour la recherche avancée
submissionSchema.statics.searchSubmissions = async function(searchTerm, filters = {}, options = {}) {
  try {
    const {
      type = 'all',
      status = 'all',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    // Construction de la requête
    let query = {};

    // Recherche textuelle
    if (searchTerm && searchTerm.trim()) {
      query.$text = { $search: searchTerm.trim() };
    }

    // Filtres
    if (type !== 'all') {
      query.type = type;
    }

    if (status !== 'all') {
      query.status = status;
    }

    // Filtres de date si fournis
    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) {
        query.createdAt.$gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        query.createdAt.$lte = new Date(filters.dateTo);
      }
    }

    // Options de tri
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Exécution de la requête avec pagination
    const skip = (page - 1) * limit;
    
    const [submissions, total] = await Promise.all([
      this.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.countDocuments(query)
    ]);

    return {
      submissions,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: submissions.length,
        totalCount: total
      }
    };

  } catch (error) {
    console.error('❌ Erreur recherche soumissions:', error);
    throw error;
  }
};

// Middleware post-remove pour nettoyer les fichiers Cloudinary
submissionSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.fileInfo && doc.fileInfo.cloudinaryId) {
    try {
      const { deleteFile } = require('../config/cloudinary');
      await deleteFile(doc.fileInfo.cloudinaryId, doc.fileInfo.fileType || 'image');
      console.log(`🗑️ Fichier Cloudinary supprimé: ${doc.fileInfo.cloudinaryId}`);
    } catch (error) {
      console.error('❌ Erreur suppression fichier Cloudinary:', error);
    }
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;