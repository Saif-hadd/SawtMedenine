/**
 * Middleware d'upload sécurisé avec Multer
 * Gestion en mémoire pour upload direct vers Cloudinary
 */

const multer = require('multer');
const path = require('path');

/**
 * Configuration du stockage en mémoire
 * Les fichiers sont stockés temporairement en RAM avant upload vers Cloudinary
 */
const storage = multer.memoryStorage();

/**
 * Filtre pour les types de fichiers autorisés
 * @param {Object} req - Objet de requête Express
 * @param {Object} file - Objet fichier Multer
 * @param {Function} cb - Callback
 */
const fileFilter = (req, file, cb) => {
  console.log(`📁 Tentative d'upload: ${file.originalname} (${file.mimetype})`);

  // Types MIME autorisés
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];

  // Extensions autorisées (vérification supplémentaire)
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  // Vérifier le type MIME
  if (!allowedMimeTypes.includes(file.mimetype)) {
    console.log(`❌ Type MIME non autorisé: ${file.mimetype}`);
    return cb(new Error('INVALID_MIME_TYPE'), false);
  }

  // Vérifier l'extension
  if (!allowedExtensions.includes(fileExtension)) {
    console.log(`❌ Extension non autorisée: ${fileExtension}`);
    return cb(new Error('INVALID_EXTENSION'), false);
  }

  // Vérifier que le nom du fichier n'est pas malveillant
  const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
  if (sanitizedName !== file.originalname) {
    console.log(`⚠️ Nom de fichier nettoyé: ${file.originalname} -> ${sanitizedName}`);
    file.originalname = sanitizedName;
  }

  console.log(`✅ Fichier accepté: ${file.originalname}`);
  cb(null, true);
};

/**
 * Configuration Multer pour l'upload sécurisé
 */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB par défaut
    files: 1, // Un seul fichier par requête
    fields: 10, // Limite le nombre de champs non-fichier
    fieldNameSize: 100, // Limite la taille des noms de champs
    fieldSize: 1024 * 1024 // Limite la taille des valeurs de champs (1MB)
  }
});

/**
 * Middleware pour gérer les erreurs d'upload Multer
 */
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('❌ Erreur Multer:', error.message);

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: `Fichier trop volumineux. Taille maximale autorisée: ${Math.round((parseInt(process.env.MAX_FILE_SIZE) || 5242880) / 1024 / 1024)}MB`,
          code: 'FILE_TOO_LARGE'
        });

      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Trop de fichiers. Un seul fichier autorisé par soumission.',
          code: 'TOO_MANY_FILES'
        });

      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Champ de fichier inattendu. Utilisez le champ "file".',
          code: 'UNEXPECTED_FILE_FIELD'
        });

      default:
        return res.status(400).json({
          success: false,
          message: 'Erreur lors de l\'upload du fichier.',
          code: 'UPLOAD_ERROR'
        });
    }
  }

  // Erreurs personnalisées du fileFilter
  if (error.message === 'INVALID_MIME_TYPE') {
    return res.status(400).json({
      success: false,
      message: 'Fichier non autorisé. Formats acceptés : .jpg, .png, .pdf jusqu\'à 5 Mo.',
      code: 'INVALID_FILE_TYPE'
    });
  }

  if (error.message === 'INVALID_EXTENSION') {
    return res.status(400).json({
      success: false,
      message: 'Extension de fichier non autorisée. Extensions acceptées : .jpg, .jpeg, .png, .pdf',
      code: 'INVALID_FILE_EXTENSION'
    });
  }

  // Autres erreurs
  console.error('❌ Erreur upload non gérée:', error);
  return res.status(500).json({
    success: false,
    message: 'Erreur interne lors de l\'upload du fichier.',
    code: 'INTERNAL_UPLOAD_ERROR'
  });
};

/**
 * Middleware d'upload pour un seul fichier
 * Utilise le champ "file" dans le formulaire
 */
const uploadSingle = upload.single('file');

/**
 * Wrapper pour gérer les erreurs d'upload de manière propre
 */
const uploadWithErrorHandling = (req, res, next) => {
  uploadSingle(req, res, (error) => {
    if (error) {
      return handleUploadErrors(error, req, res, next);
    }
    next();
  });
};

/**
 * Middleware de validation post-upload
 * Vérifications supplémentaires après que Multer ait traité le fichier
 */
const validateUploadedFile = (req, res, next) => {
  if (!req.file) {
    return next(); // Pas de fichier, on continue
  }

  const file = req.file;

  // Vérifier que le buffer n'est pas vide
  if (!file.buffer || file.buffer.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Fichier vide ou corrompu.',
      code: 'EMPTY_FILE'
    });
  }

  // Vérifier la signature du fichier (magic numbers) pour plus de sécurité
  const fileSignatures = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'application/pdf': [0x25, 0x50, 0x44, 0x46] // %PDF
  };

  const signature = fileSignatures[file.mimetype];
  if (signature) {
    const fileHeader = Array.from(file.buffer.slice(0, signature.length));
    const isValidSignature = signature.every((byte, index) => byte === fileHeader[index]);

    if (!isValidSignature) {
      console.log(`❌ Signature de fichier invalide pour ${file.mimetype}`);
      return res.status(400).json({
        success: false,
        message: 'Fichier corrompu ou type de fichier non conforme.',
        code: 'INVALID_FILE_SIGNATURE'
      });
    }
  }

  console.log(`✅ Fichier validé après upload: ${file.originalname}`);
  next();
};

module.exports = {
  uploadWithErrorHandling,
  validateUploadedFile,
  handleUploadErrors
};