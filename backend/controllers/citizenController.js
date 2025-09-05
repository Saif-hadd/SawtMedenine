/**
 * Contrôleur pour les fonctionnalités citoyennes
 * Gestion des soumissions de suggestions et réclamations
 */

const Submission = require('../models/Submission');
const { uploadFile } = require('../config/cloudinary');

/**
 * Soumettre une nouvelle suggestion ou réclamation
 * POST /api/citizen/submission
 */
const submitSuggestion = async (req, res) => {
  try {
    console.log('📝 Nouvelle soumission reçue');
    
    const { name, email, type, subject, description } = req.body;
    const file = req.file;

    // Préparer les données de la soumission
    const submissionData = {
      name: name.trim(),
      email: email ? email.trim().toLowerCase() : null,
      type,
      subject: subject.trim(),
      description: description.trim(),
      status: 'Nouveau'
    };

    // Traiter le fichier s'il est présent
    if (file) {
      try {
        console.log(`📎 Upload du fichier: ${file.originalname}`);
        
        // Déterminer le type de ressource pour Cloudinary
        const resourceType = file.mimetype === 'application/pdf' ? 'raw' : 'image';
        
        // Upload vers Cloudinary
        const uploadResult = await uploadFile(file.buffer, file.originalname, resourceType);
        
        if (uploadResult.success) {
          submissionData.fileUrl = uploadResult.url;
          submissionData.fileInfo = {
            originalName: file.originalname,
            cloudinaryId: uploadResult.publicId,
            fileType: resourceType,
            fileSize: file.size
          };
          
          console.log(`✅ Fichier uploadé: ${uploadResult.url}`);
        } else {
          throw new Error('Échec de l\'upload du fichier');
        }
        
      } catch (uploadError) {
        console.error('❌ Erreur upload fichier:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Erreur lors de l\'upload du fichier. Veuillez réessayer.',
          code: 'FILE_UPLOAD_ERROR'
        });
      }
    }

    // Créer la soumission en base de données
    const submission = new Submission(submissionData);
    await submission.save();

    console.log(`✅ Soumission créée avec succès: ${submission._id}`);

    // Réponse de succès
    res.status(201).json({
      success: true,
      message: 'Votre demande a été soumise avec succès. Nous vous remercions pour votre participation citoyenne.',
      data: {
        id: submission._id,
        type: submission.type,
        subject: submission.subject,
        status: submission.status,
        submittedAt: submission.createdAt,
        hasFile: !!submission.fileUrl
      }
    });

    // Log pour suivi administratif
    console.log(`📊 Nouvelle ${submission.type.toLowerCase()} de ${submission.name}: "${submission.subject}"`);

  } catch (error) {
    console.error('❌ Erreur création soumission:', error);

    // Gestion des erreurs de validation Mongoose
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Données invalides. Veuillez corriger les erreurs.',
        errors: validationErrors,
        code: 'VALIDATION_ERROR'
      });
    }

    // Erreur générique
    res.status(500).json({
      success: false,
      message: 'Une erreur interne s\'est produite. Veuillez réessayer plus tard.',
      code: 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtenir les statistiques publiques (optionnel)
 * GET /api/citizen/stats
 */
const getPublicStats = async (req, res) => {
  try {
    console.log('📊 Demande de statistiques publiques');

    const stats = await Submission.getStats();

    // Calculer le taux de résolution
    const resolutionRate = stats.total > 0 
      ? Math.round((stats.traite / stats.total) * 100) 
      : 0;

    // Calculer la moyenne de traitement (approximative)
    const avgProcessingTime = await Submission.aggregate([
      {
        $match: {
          status: 'Traité',
          processedAt: { $exists: true }
        }
      },
      {
        $project: {
          processingTime: {
            $divide: [
              { $subtract: ['$processedAt', '$createdAt'] },
              1000 * 60 * 60 * 24 // Convertir en jours
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$processingTime' }
        }
      }
    ]);

    const avgDays = avgProcessingTime.length > 0 
      ? Math.round(avgProcessingTime[0].avgDays * 10) / 10 
      : 0;

    const publicStats = {
      totalSubmissions: stats.total,
      suggestions: stats.suggestions,
      complaints: stats.complaints,
      resolved: stats.traite,
      resolutionRate: `${resolutionRate}%`,
      averageProcessingTime: `${avgDays} jours`,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: publicStats
    });

    console.log('✅ Statistiques publiques envoyées');

  } catch (error) {
    console.error('❌ Erreur récupération statistiques:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques.',
      code: 'STATS_ERROR'
    });
  }
};

/**
 * Vérifier le statut d'une soumission (optionnel)
 * GET /api/citizen/submission/:id/status
 */
const checkSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Vérification statut soumission: ${id}`);

    // Rechercher la soumission (informations limitées pour la confidentialité)
    const submission = await Submission.findById(id)
      .select('type subject status createdAt updatedAt')
      .lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Soumission non trouvée.',
        code: 'SUBMISSION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: {
        id: submission._id,
        type: submission.type,
        subject: submission.subject,
        status: submission.status,
        submittedAt: submission.createdAt,
        lastUpdated: submission.updatedAt
      }
    });

    console.log(`✅ Statut envoyé pour: ${id}`);

  } catch (error) {
    console.error('❌ Erreur vérification statut:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'ID de soumission invalide.',
        code: 'INVALID_ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut.',
      code: 'STATUS_CHECK_ERROR'
    });
  }
};

/**
 * Obtenir les types de soumissions disponibles
 * GET /api/citizen/types
 */
const getSubmissionTypes = async (req, res) => {
  try {
    const types = [
      {
        value: 'Suggestion',
        label: 'Suggestion',
        description: 'Proposer une amélioration ou une nouvelle idée',
        icon: '💡'
      },
      {
        value: 'Réclamation',
        label: 'Réclamation',
        description: 'Signaler un problème ou dysfonctionnement',
        icon: '🚨'
      }
    ];

    res.json({
      success: true,
      data: types
    });

  } catch (error) {
    console.error('❌ Erreur récupération types:', error);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des types.',
      code: 'TYPES_ERROR'
    });
  }
};

/**
 * Endpoint de santé pour vérifier le service
 * GET /api/citizen/health
 */
const healthCheck = async (req, res) => {
  try {
    // Vérifier la connexion à la base de données
    const dbStatus = await Submission.countDocuments({});
    
    res.json({
      success: true,
      message: 'Service citoyen opérationnel',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: 'connected',
        totalSubmissions: dbStatus
      }
    });

  } catch (error) {
    console.error('❌ Erreur health check:', error);
    
    res.status(503).json({
      success: false,
      message: 'Service temporairement indisponible',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected'
      }
    });
  }
};

module.exports = {
  submitSuggestion,
  getPublicStats,
  checkSubmissionStatus,
  getSubmissionTypes,
  healthCheck
};