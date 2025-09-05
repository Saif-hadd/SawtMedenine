/**
 * Routes privées pour les administrateurs
 * Authentification et gestion des soumissions
 */

const express = require('express');
const router = express.Router();

// Middleware d'authentification
const { authenticateAdmin } = require('../middleware/auth');

// Middleware de validation
const { 
  validateAdminLogin, 
  validateStatusUpdate,
  validateQueryParams,
  cleanStrings,
  sanitizeInput 
} = require('../middleware/validation');

// Contrôleurs
const {
  login,
  getSubmissions,
  getSubmission,
  updateSubmissionStatus,
  updateSubmissionNotes,
  deleteSubmission,
  exportSubmissions,
  getDashboardStats,
  getProfile
} = require('../controllers/adminController');

// Middleware global pour les routes admin
router.use(sanitizeInput()); // Protection XSS
router.use(cleanStrings); // Nettoyage des chaînes

/**
 * @route   POST /api/admin/login
 * @desc    Authentification administrateur
 * @access  Public (mais restreint)
 */
router.post('/login', 
  validateAdminLogin,  // Validation email/password
  login               // Contrôleur de connexion
);

// Middleware d'authentification pour toutes les routes suivantes
router.use(authenticateAdmin);

/**
 * @route   GET /api/admin/profile
 * @desc    Obtenir le profil de l'administrateur connecté
 * @access  Private (Admin)
 */
router.get('/profile', getProfile);

/**
 * @route   GET /api/admin/submissions
 * @desc    Obtenir toutes les soumissions avec filtres et pagination
 * @access  Private (Admin)
 */
router.get('/submissions', 
  validateQueryParams,  // Validation des paramètres de requête
  getSubmissions       // Contrôleur
);

/**
 * @route   GET /api/admin/submission/:id
 * @desc    Obtenir une soumission spécifique
 * @access  Private (Admin)
 */
router.get('/submission/:id', getSubmission);

/**
 * @route   PATCH /api/admin/submission/:id/status
 * @desc    Mettre à jour le statut d'une soumission
 * @access  Private (Admin)
 */
router.patch('/submission/:id/status', 
  validateStatusUpdate,      // Validation ID et statut
  updateSubmissionStatus    // Contrôleur
);

/**
 * @route   PATCH /api/admin/submission/:id/notes
 * @desc    Ajouter/modifier les notes internes d'une soumission
 * @access  Private (Admin)
 */
router.patch('/submission/:id/notes', 
  [
    // Validation des notes internes
    require('express-validator').param('id').isMongoId().withMessage('ID invalide'),
    require('express-validator').body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Les notes ne peuvent pas dépasser 1000 caractères')
      .trim()
      .escape(),
    require('../middleware/validation').handleValidationErrors
  ],
  updateSubmissionNotes
);

/**
 * @route   DELETE /api/admin/submission/:id
 * @desc    Supprimer une soumission
 * @access  Private (Admin)
 */
router.delete('/submission/:id', 
  [
    require('express-validator').param('id').isMongoId().withMessage('ID invalide'),
    require('../middleware/validation').handleValidationErrors
  ],
  deleteSubmission
);

/**
 * @route   GET /api/admin/export
 * @desc    Exporter les soumissions en CSV
 * @access  Private (Admin)
 */
router.get('/export', 
  validateQueryParams,  // Validation des filtres d'export
  exportSubmissions    // Contrôleur
);

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Obtenir les statistiques détaillées pour le dashboard
 * @access  Private (Admin)
 */
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;