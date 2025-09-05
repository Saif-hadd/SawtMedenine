/**
 * Middleware de validation et nettoyage des données d'entrée
 * Protection contre les injections et validation des formats
 */

const { body, param, query, validationResult } = require('express-validator');
const xss = require('xss-clean');

/**
 * Middleware de nettoyage XSS global
 */
const sanitizeInput = () => {
  return xss();
};

/**
 * Middleware pour gérer les erreurs de validation
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value
    }));

    console.log('❌ Erreurs de validation:', formattedErrors);

    return res.status(400).json({
      success: false,
      message: 'Données invalides. Veuillez corriger les erreurs.',
      errors: formattedErrors,
      code: 'VALIDATION_ERROR'
    });
  }

  next();
};

/**
 * Validateurs pour les soumissions citoyennes
 */
const validateSubmission = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom doit contenir entre 2 et 100 caractères')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
    .withMessage('Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets')
    .escape(), // Échapper les caractères HTML

  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('L\'email ne peut pas dépasser 255 caractères'),

  body('type')
    .isIn(['Suggestion', 'Réclamation'])
    .withMessage('Le type doit être "Suggestion" ou "Réclamation"'),

  body('subject')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Le sujet doit contenir entre 5 et 200 caractères')
    .escape(),

  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('La description doit contenir entre 10 et 2000 caractères')
    .escape(),

  handleValidationErrors
];

/**
 * Validateurs pour l'authentification admin
 */
const validateAdminLogin = [
  body('email')
    .isEmail()
    .withMessage('Format d\'email invalide')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('L\'email ne peut pas dépasser 255 caractères'),

  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Le mot de passe doit contenir entre 8 et 128 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial'),

  handleValidationErrors
];

/**
 * Validateurs pour la mise à jour du statut
 */
const validateStatusUpdate = [
  param('id')
    .isMongoId()
    .withMessage('ID de soumission invalide'),

  body('status')
    .isIn(['Nouveau', 'En cours', 'Traité'])
    .withMessage('Le statut doit être "Nouveau", "En cours" ou "Traité"'),

  handleValidationErrors
];

/**
 * Validateurs pour les paramètres de requête (pagination, filtres)
 */
const validateQueryParams = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Le numéro de page doit être un entier entre 1 et 1000'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être un entier entre 1 et 100'),

  query('type')
    .optional()
    .isIn(['Suggestion', 'Réclamation', 'all'])
    .withMessage('Le type de filtre doit être "Suggestion", "Réclamation" ou "all"'),

  query('status')
    .optional()
    .isIn(['Nouveau', 'En cours', 'Traité', 'all'])
    .withMessage('Le statut de filtre doit être "Nouveau", "En cours", "Traité" ou "all"'),

  query('search')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Le terme de recherche ne peut pas dépasser 200 caractères')
    .escape(),

  handleValidationErrors
];

/**
 * Middleware de validation des fichiers uploadés
 */
const validateFileUpload = (req, res, next) => {
  if (!req.file) {
    return next(); // Pas de fichier, on continue
  }

  const file = req.file;
  const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880; // 5MB par défaut
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf'
  ];

  // Vérifier la taille
  if (file.size > maxSize) {
    return res.status(400).json({
      success: false,
      message: `Fichier trop volumineux. Taille maximale autorisée: ${Math.round(maxSize / 1024 / 1024)}MB`,
      code: 'FILE_TOO_LARGE'
    });
  }

  // Vérifier le type MIME
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Fichier non autorisé. Formats acceptés : .jpg, .png, .pdf jusqu\'à 5 Mo.',
      code: 'INVALID_FILE_TYPE'
    });
  }

  // Vérifier l'extension du fichier (sécurité supplémentaire)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
  
  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({
      success: false,
      message: 'Extension de fichier non autorisée. Extensions acceptées : .jpg, .jpeg, .png, .pdf',
      code: 'INVALID_FILE_EXTENSION'
    });
  }

  console.log(`✅ Fichier validé: ${file.originalname} (${Math.round(file.size / 1024)}KB)`);
  next();
};

/**
 * Middleware de nettoyage des chaînes de caractères
 */
const cleanStrings = (req, res, next) => {
  const cleanString = (str) => {
    if (typeof str !== 'string') return str;
    
    // Supprimer les caractères de contrôle et les espaces en trop
    return str
      .replace(/[\x00-\x1F\x7F]/g, '') // Supprimer les caractères de contrôle
      .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
      .trim(); // Supprimer les espaces en début/fin
  };

  // Nettoyer récursivement tous les champs string du body
  const cleanObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = cleanString(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        cleanObject(obj[key]);
      }
    }
  };

  if (req.body && typeof req.body === 'object') {
    cleanObject(req.body);
  }

  next();
};

module.exports = {
  sanitizeInput,
  handleValidationErrors,
  validateSubmission,
  validateAdminLogin,
  validateStatusUpdate,
  validateQueryParams,
  validateFileUpload,
  cleanStrings
};