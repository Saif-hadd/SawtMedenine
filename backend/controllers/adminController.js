/**
 * Contrôleur pour les fonctionnalités administrateur
 * Authentification et gestion des soumissions
 */

const Admin = require('../models/Admin');
const Submission = require('../models/Submission');
const { generateToken } = require('../config/auth');
const { Parser } = require('json2csv');

/**
 * Authentification administrateur
 * POST /api/admin/login
 */
const login = async (req, res) => {
  try {
    console.log('🔐 Tentative de connexion admin');
    
    const { email, password } = req.body;

    // Nettoyer les verrous expirés
    await Admin.cleanExpiredLocks();

    // Authentifier l'administrateur
    const authResult = await Admin.authenticate(email, password);

    if (!authResult.success) {
      console.log(`❌ Échec connexion: ${email}`);
      return res.status(401).json({
        success: false,
        message: authResult.message,
        code: 'AUTH_FAILED'
      });
    }

    // Générer le token JWT
    const token = generateToken(authResult.admin.id, authResult.admin.email);

    console.log(`✅ Connexion réussie: ${authResult.admin.email}`);

    // Réponse de succès
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        admin: {
          id: authResult.admin.id,
          email: authResult.admin.email,
          firstName: authResult.admin.firstName,
          lastName: authResult.admin.lastName,
          role: authResult.admin.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur connexion admin:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur lors de la connexion.',
      code: 'LOGIN_ERROR'
    });
  }
};

/**
 * Obtenir toutes les soumissions avec filtres et pagination
 * GET /api/admin/submissions
 */
const getSubmissions = async (req, res) => {
  try {
    console.log(`📋 Récupération soumissions par admin: ${req.admin.email}`);

    const {
      page = 1,
      limit = 20,
      type = 'all',
      status = 'all',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;

    // Construire les filtres
    const filters = {};
    if (dateFrom || dateTo) {
      filters.dateFrom = dateFrom;
      filters.dateTo = dateTo;
    }

    // Options de recherche
    const searchOptions = {
      type,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    // Effectuer la recherche
    const result = await Submission.searchSubmissions(search, filters, searchOptions);

    // Obtenir les statistiques
    const stats = await Submission.getStats();

    console.log(`✅ ${result.submissions.length} soumissions récupérées`);

    res.json({
      success: true,
      data: {
        submissions: result.submissions,
        pagination: result.pagination,
        stats: stats,
        filters: {
          type,
          status,
          search,
          dateFrom,
          dateTo
        }
      }
    });

  } catch (error) {
    console.error('❌ Erreur récupération soumissions:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des soumissions.',
      code: 'FETCH_SUBMISSIONS_ERROR'
    });
  }
};

/**
 * Obtenir une soumission spécifique
 * GET /api/admin/submission/:id
 */
const getSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Récupération soumission: ${id}`);

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée.',
        code: 'SUBMISSION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: submission
    });

    console.log(`✅ Soumission récupérée: ${id}`);

  } catch (error) {
    console.error('❌ Erreur récupération soumission:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de soumission invalide.',
        code: 'INVALID_ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la soumission.',
      code: 'FETCH_SUBMISSION_ERROR'
    });
  }
};

/**
 * Mettre à jour le statut d'une soumission
 * PATCH /api/admin/submission/:id/status
 */
const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    console.log(`🔄 Mise à jour statut ${id}: ${status} par ${req.admin.email}`);

    const submission = await Submission.findById(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée.',
        code: 'SUBMISSION_NOT_FOUND'
      });
    }

    // Mettre à jour le statut et les métadonnées
    submission.status = status;
    submission.processedBy = req.admin.id;
    
    if (status !== 'Nouveau') {
      submission.processedAt = new Date();
    }

    await submission.save();

    console.log(`✅ Statut mis à jour: ${id} -> ${status}`);

    res.json({
      success: true,
      message: `Statut mis à jour vers "${status}"`,
      data: {
        id: submission._id,
        status: submission.status,
        processedAt: submission.processedAt,
        processedBy: req.admin.email
      }
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour statut:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de soumission invalide.',
        code: 'INVALID_ID'
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide.',
        code: 'INVALID_STATUS'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du statut.',
      code: 'UPDATE_STATUS_ERROR'
    });
  }
};

/**
 * Ajouter des notes internes à une soumission
 * PATCH /api/admin/submission/:id/notes
 */
const updateSubmissionNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    console.log(`📝 Mise à jour notes ${id} par ${req.admin.email}`);

    const submission = await Submission.findByIdAndUpdate(
      id,
      { 
        internalNotes: notes.trim(),
        processedBy: req.admin.id 
      },
      { new: true, runValidators: true }
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée.',
        code: 'SUBMISSION_NOT_FOUND'
      });
    }

    console.log(`✅ Notes mises à jour: ${id}`);

    res.json({
      success: true,
      message: 'Notes internes mises à jour',
      data: {
        id: submission._id,
        internalNotes: submission.internalNotes,
        updatedAt: submission.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Erreur mise à jour notes:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de soumission invalide.',
        code: 'INVALID_ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des notes.',
      code: 'UPDATE_NOTES_ERROR'
    });
  }
};

/**
 * Supprimer une soumission
 * DELETE /api/admin/submission/:id
 */
const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🗑️ Suppression soumission ${id} par ${req.admin.email}`);

    const submission = await Submission.findByIdAndDelete(id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée.',
        code: 'SUBMISSION_NOT_FOUND'
      });
    }

    console.log(`✅ Soumission supprimée: ${id}`);

    res.json({
      success: true,
      message: 'Soumission supprimée avec succès',
      data: {
        id: submission._id,
        subject: submission.subject,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erreur suppression soumission:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de soumission invalide.',
        code: 'INVALID_ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression.',
      code: 'DELETE_SUBMISSION_ERROR'
    });
  }
};

/**
 * Exporter les soumissions en CSV
 * GET /api/admin/export
 */
const exportSubmissions = async (req, res) => {
  try {
    console.log(`📊 Export CSV demandé par: ${req.admin.email}`);

    const {
      type = 'all',
      status = 'all',
      dateFrom,
      dateTo
    } = req.query;

    // Construire les filtres
    const filters = {};
    if (dateFrom || dateTo) {
      filters.dateFrom = dateFrom;
      filters.dateTo = dateTo;
    }

    // Récupérer toutes les soumissions correspondantes
    const result = await Submission.searchSubmissions('', filters, {
      type,
      status,
      page: 1,
      limit: 10000, // Limite élevée pour l'export
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    // Préparer les données pour le CSV
    const csvData = result.submissions.map(submission => ({
      'ID': submission._id,
      'Date de soumission': new Date(submission.createdAt).toLocaleDateString('fr-FR'),
      'Nom': submission.name,
      'Email': submission.email || 'Non fourni',
      'Type': submission.type,
      'Sujet': submission.subject,
      'Description': submission.description.replace(/\n/g, ' ').substring(0, 200) + '...',
      'Statut': submission.status,
      'Fichier joint': submission.fileUrl ? 'Oui' : 'Non',
      'Date de traitement': submission.processedAt 
        ? new Date(submission.processedAt).toLocaleDateString('fr-FR') 
        : 'Non traité',
      'Dernière mise à jour': new Date(submission.updatedAt).toLocaleDateString('fr-FR')
    }));

    // Générer le CSV
    const fields = [
      'ID', 'Date de soumission', 'Nom', 'Email', 'Type', 
      'Sujet', 'Description', 'Statut', 'Fichier joint', 
      'Date de traitement', 'Dernière mise à jour'
    ];

    const json2csvParser = new Parser({ fields, delimiter: ';' });
    const csv = json2csvParser.parse(csvData);

    // Générer le nom du fichier
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `soumissions_medenine_${timestamp}.csv`;

    console.log(`✅ Export CSV généré: ${csvData.length} lignes`);

    // Envoyer le fichier CSV
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', Buffer.byteLength(csv, 'utf8'));
    
    // Ajouter le BOM UTF-8 pour Excel
    res.write('\ufeff');
    res.end(csv);

  } catch (error) {
    console.error('❌ Erreur export CSV:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export des données.',
      code: 'EXPORT_ERROR'
    });
  }
};

/**
 * Obtenir les statistiques détaillées pour le dashboard
 * GET /api/admin/dashboard/stats
 */
const getDashboardStats = async (req, res) => {
  try {
    console.log(`📊 Statistiques dashboard demandées par: ${req.admin.email}`);

    // Statistiques générales
    const generalStats = await Submission.getStats();

    // Statistiques par mois (12 derniers mois)
    const monthlyStats = await Submission.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          suggestions: {
            $sum: { $cond: [{ $eq: ['$type', 'Suggestion'] }, 1, 0] }
          },
          complaints: {
            $sum: { $cond: [{ $eq: ['$type', 'Réclamation'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Temps de traitement moyen
    const processingTimeStats = await Submission.aggregate([
      {
        $match: {
          status: 'Traité',
          processedAt: { $exists: true }
        }
      },
      {
        $project: {
          processingTimeHours: {
            $divide: [
              { $subtract: ['$processedAt', '$createdAt'] },
              1000 * 60 * 60 // Convertir en heures
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgHours: { $avg: '$processingTimeHours' },
          minHours: { $min: '$processingTimeHours' },
          maxHours: { $max: '$processingTimeHours' }
        }
      }
    ]);

    const processingTime = processingTimeStats[0] || {
      avgHours: 0,
      minHours: 0,
      maxHours: 0
    };

    // Soumissions récentes (dernières 24h)
    const recentSubmissions = await Submission.find({
      createdAt: {
        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    })
    .select('name type subject status createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    const dashboardData = {
      general: generalStats,
      monthly: monthlyStats,
      processingTime: {
        average: Math.round(processingTime.avgHours * 10) / 10,
        minimum: Math.round(processingTime.minHours * 10) / 10,
        maximum: Math.round(processingTime.maxHours * 10) / 10
      },
      recent: recentSubmissions,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Statistiques dashboard envoyées');

    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('❌ Erreur statistiques dashboard:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques.',
      code: 'DASHBOARD_STATS_ERROR'
    });
  }
};

/**
 * Vérifier le profil de l'administrateur connecté
 * GET /api/admin/profile
 */
const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id)
      .select('-passwordHash -passwordHistory')
      .lean();

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Profil administrateur non trouvé.',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: admin
    });

  } catch (error) {
    console.error('❌ Erreur récupération profil:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil.',
      code: 'PROFILE_ERROR'
    });
  }
};

module.exports = {
  login,
  getSubmissions,
  getSubmission,
  updateSubmissionStatus,
  updateSubmissionNotes,
  deleteSubmission,
  exportSubmissions,
  getDashboardStats,
  getProfile
};