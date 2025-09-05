/**
 * Validateurs personnalisés pour l'application
 * Fonctions de validation spécifiques aux besoins de Médenine
 */

const path = require('path');

/**
 * Valider le type de fichier uploadé
 * @param {Object} file - Objet fichier Multer
 * @returns {Object} - Résultat de la validation
 */
const validateFileType = (file) => {
  if (!file) {
    return { isValid: true, message: 'Aucun fichier' };
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/pdf'
  ];

  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  // Vérifier le type MIME
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return {
      isValid: false,
      message: 'Type de fichier non autorisé. Formats acceptés : JPG, PNG, PDF'
    };
  }

  // Vérifier l'extension
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      message: 'Extension de fichier non autorisée'
    };
  }

  // Vérifier la taille (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      message: 'Fichier trop volumineux. Taille maximale : 5MB'
    };
  }

  return { isValid: true, message: 'Fichier valide' };
};

/**
 * Valider le nom d'une personne (citoyen)
 * @param {string} name - Nom à valider
 * @returns {Object} - Résultat de la validation
 */
const validatePersonName = (name) => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: 'Nom requis' };
  }

  const trimmedName = name.trim();

  // Longueur
  if (trimmedName.length < 2) {
    return { isValid: false, message: 'Le nom doit contenir au moins 2 caractères' };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, message: 'Le nom ne peut pas dépasser 100 caractères' };
  }

  // Caractères autorisés (lettres, espaces, apostrophes, tirets)
  // Inclut les caractères arabes et français
  const nameRegex = /^[a-zA-ZÀ-ÿ\u0600-\u06FF\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      message: 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'
    };
  }

  // Pas de caractères répétés excessivement
  if (/(.)\1{4,}/.test(trimmedName)) {
    return {
      isValid: false,
      message: 'Le nom contient trop de caractères répétés'
    };
  }

  return { isValid: true, message: 'Nom valide' };
};

/**
 * Valider un email tunisien ou international
 * @param {string} email - Email à valider
 * @returns {Object} - Résultat de la validation
 */
const validateEmail = (email) => {
  if (!email) {
    return { isValid: true, message: 'Email optionnel' }; // Email optionnel
  }

  if (typeof email !== 'string') {
    return { isValid: false, message: 'Format d\'email invalide' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Longueur
  if (trimmedEmail.length > 255) {
    return { isValid: false, message: 'Email trop long (max 255 caractères)' };
  }

  // Format de base
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, message: 'Format d\'email invalide' };
  }

  // Vérifications supplémentaires
  const parts = trimmedEmail.split('@');
  const localPart = parts[0];
  const domainPart = parts[1];

  // Partie locale (avant @)
  if (localPart.length > 64) {
    return { isValid: false, message: 'Partie locale de l\'email trop longue' };
  }

  // Domaine
  if (domainPart.length > 253) {
    return { isValid: false, message: 'Domaine de l\'email trop long' };
  }

  // Caractères dangereux
  const dangerousChars = /[<>()[\]\\,;:\s@"]/;
  if (dangerousChars.test(localPart.replace(/[.]/g, ''))) {
    return { isValid: false, message: 'Email contient des caractères non autorisés' };
  }

  return { isValid: true, message: 'Email valide' };
};

/**
 * Valider le sujet d'une soumission
 * @param {string} subject - Sujet à valider
 * @returns {Object} - Résultat de la validation
 */
const validateSubject = (subject) => {
  if (!subject || typeof subject !== 'string') {
    return { isValid: false, message: 'Sujet requis' };
  }

  const trimmedSubject = subject.trim();

  // Longueur
  if (trimmedSubject.length < 5) {
    return { isValid: false, message: 'Le sujet doit contenir au moins 5 caractères' };
  }

  if (trimmedSubject.length > 200) {
    return { isValid: false, message: 'Le sujet ne peut pas dépasser 200 caractères' };
  }

  // Pas que des espaces ou caractères spéciaux
  if (!/[a-zA-ZÀ-ÿ\u0600-\u06FF0-9]/.test(trimmedSubject)) {
    return { isValid: false, message: 'Le sujet doit contenir au moins une lettre ou un chiffre' };
  }

  // Pas de contenu suspect
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:text\/html/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedSubject)) {
      return { isValid: false, message: 'Le sujet contient du contenu non autorisé' };
    }
  }

  return { isValid: true, message: 'Sujet valide' };
};

/**
 * Valider la description d'une soumission
 * @param {string} description - Description à valider
 * @returns {Object} - Résultat de la validation
 */
const validateDescription = (description) => {
  if (!description || typeof description !== 'string') {
    return { isValid: false, message: 'Description requise' };
  }

  const trimmedDescription = description.trim();

  // Longueur
  if (trimmedDescription.length < 10) {
    return { isValid: false, message: 'La description doit contenir au moins 10 caractères' };
  }

  if (trimmedDescription.length > 2000) {
    return { isValid: false, message: 'La description ne peut pas dépasser 2000 caractères' };
  }

  // Pas que des espaces ou caractères spéciaux
  if (!/[a-zA-ZÀ-ÿ\u0600-\u06FF0-9]/.test(trimmedDescription)) {
    return { isValid: false, message: 'La description doit contenir au moins une lettre ou un chiffre' };
  }

  // Pas de contenu suspect
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i,
    /data:text\/html/i,
    /<iframe/i,
    /<object/i,
    /<embed/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedDescription)) {
      return { isValid: false, message: 'La description contient du contenu non autorisé' };
    }
  }

  // Vérifier les URLs suspectes
  const urlRegex = /https?:\/\/[^\s]+/gi;
  const urls = trimmedDescription.match(urlRegex) || [];
  
  for (const url of urls) {
    // Bloquer certains domaines suspects
    const suspiciousDomains = [
      'bit.ly',
      'tinyurl.com',
      'goo.gl',
      't.co'
    ];

    const domain = url.replace(/https?:\/\//, '').split('/')[0];
    if (suspiciousDomains.some(suspicious => domain.includes(suspicious))) {
      return { isValid: false, message: 'La description contient des liens non autorisés' };
    }
  }

  return { isValid: true, message: 'Description valide' };
};

/**
 * Valider le type de soumission
 * @param {string} type - Type à valider
 * @returns {Object} - Résultat de la validation
 */
const validateSubmissionType = (type) => {
  const allowedTypes = ['Suggestion', 'Réclamation'];

  if (!type || typeof type !== 'string') {
    return { isValid: false, message: 'Type de soumission requis' };
  }

  if (!allowedTypes.includes(type)) {
    return {
      isValid: false,
      message: 'Type de soumission invalide. Types autorisés : Suggestion, Réclamation'
    };
  }

  return { isValid: true, message: 'Type valide' };
};

/**
 * Valider le statut d'une soumission
 * @param {string} status - Statut à valider
 * @returns {Object} - Résultat de la validation
 */
const validateSubmissionStatus = (status) => {
  const allowedStatuses = ['Nouveau', 'En cours', 'Traité'];

  if (!status || typeof status !== 'string') {
    return { isValid: false, message: 'Statut requis' };
  }

  if (!allowedStatuses.includes(status)) {
    return {
      isValid: false,
      message: 'Statut invalide. Statuts autorisés : Nouveau, En cours, Traité'
    };
  }

  return { isValid: true, message: 'Statut valide' };
};

/**
 * Valider un ID MongoDB
 * @param {string} id - ID à valider
 * @returns {Object} - Résultat de la validation
 */
const validateMongoId = (id) => {
  if (!id || typeof id !== 'string') {
    return { isValid: false, message: 'ID requis' };
  }

  // Format MongoDB ObjectId (24 caractères hexadécimaux)
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
  
  if (!mongoIdRegex.test(id)) {
    return { isValid: false, message: 'Format d\'ID invalide' };
  }

  return { isValid: true, message: 'ID valide' };
};

/**
 * Valider les paramètres de pagination
 * @param {Object} params - Paramètres de pagination
 * @returns {Object} - Résultat de la validation
 */
const validatePaginationParams = (params) => {
  const { page, limit } = params;
  const errors = [];

  // Page
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 1 || pageNum > 1000) {
      errors.push('Le numéro de page doit être entre 1 et 1000');
    }
  }

  // Limite
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('La limite doit être entre 1 et 100');
    }
  }

  return {
    isValid: errors.length === 0,
    message: errors.length === 0 ? 'Paramètres valides' : errors.join(', ')
  };
};

/**
 * Valider une date
 * @param {string} dateString - Date à valider
 * @returns {Object} - Résultat de la validation
 */
const validateDate = (dateString) => {
  if (!dateString) {
    return { isValid: true, message: 'Date optionnelle' };
  }

  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return { isValid: false, message: 'Format de date invalide' };
  }

  // Vérifier que la date n'est pas dans le futur (pour les filtres)
  const now = new Date();
  if (date > now) {
    return { isValid: false, message: 'La date ne peut pas être dans le futur' };
  }

  // Vérifier que la date n'est pas trop ancienne (plus de 10 ans)
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  
  if (date < tenYearsAgo) {
    return { isValid: false, message: 'La date ne peut pas être antérieure à 10 ans' };
  }

  return { isValid: true, message: 'Date valide' };
};

/**
 * Valider une recherche textuelle
 * @param {string} searchTerm - Terme de recherche
 * @returns {Object} - Résultat de la validation
 */
const validateSearchTerm = (searchTerm) => {
  if (!searchTerm) {
    return { isValid: true, message: 'Recherche optionnelle' };
  }

  if (typeof searchTerm !== 'string') {
    return { isValid: false, message: 'Le terme de recherche doit être une chaîne' };
  }

  const trimmedTerm = searchTerm.trim();

  // Longueur
  if (trimmedTerm.length > 200) {
    return { isValid: false, message: 'Le terme de recherche ne peut pas dépasser 200 caractères' };
  }

  // Pas de caractères suspects
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+=/i
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmedTerm)) {
      return { isValid: false, message: 'Le terme de recherche contient du contenu non autorisé' };
    }
  }

  return { isValid: true, message: 'Terme de recherche valide' };
};

module.exports = {
  validateFileType,
  validatePersonName,
  validateEmail,
  validateSubject,
  validateDescription,
  validateSubmissionType,
  validateSubmissionStatus,
  validateMongoId,
  validatePaginationParams,
  validateDate,
  validateSearchTerm
};