/**
 * Routes publiques pour les citoyens
 * Soumission de suggestions et réclamations
 */

const express = require('express');
const router = express.Router();

// Middleware
const { uploadWithErrorHandling, validateUploadedFile } = require('../middleware/upload');
const { 
  validateSubmission, 
  validateQueryParams,
  cleanStrings,
  sanitizeInput 
} = require('../middleware/validation');

// Contrôleurs
const {
  submitSuggestion,
  getPublicStats,
  checkSubmissionStatus,
  getSubmissionTypes,
  healthCheck
} = require('../controllers/citizenController');

// Middleware global pour les routes citoyennes
router.use(sanitizeInput()); // Protection XSS
router.use(cleanStrings); // Nettoyage des chaînes

/**
 * @route   POST /api/citizen/submission
 * @desc    Soumettre une nouvelle suggestion ou réclamation
 * @access  Public
 */
router.post('/submission', 
  uploadWithErrorHandling,      // Gestion upload fichier
  validateUploadedFile,         // Validation post-upload
  validateSubmission,           // Validation des champs
  submitSuggestion             // Contrôleur
);

/**
 * @route   GET /api/citizen/stats
 * @desc    Obtenir les statistiques publiques
 * @access  Public
 */
router.get('/stats', getPublicStats);

/**
 * @route   GET /api/citizen/submission/:id/status
 * @desc    Vérifier le statut d'une soumission
 * @access  Public
 */
router.get('/submission/:id/status', checkSubmissionStatus);

/**
 * @route   GET /api/citizen/types
 * @desc    Obtenir les types de soumissions disponibles
 * @access  Public
 */
router.get('/types', getSubmissionTypes);

/**
 * @route   GET /api/citizen/health
 * @desc    Vérifier l'état du service
 * @access  Public
 */
router.get('/health', healthCheck);

module.exports = router;