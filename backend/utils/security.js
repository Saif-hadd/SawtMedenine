/**
 * Utilitaires de sécurité
 * Fonctions pour le hashage, validation et protection
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Hasher un mot de passe avec bcrypt
 * @param {string} password - Mot de passe en clair
 * @param {number} saltRounds - Nombre de rounds pour le salt (défaut: 12)
 * @returns {Promise<string>} - Hash du mot de passe
 */
const hashPassword = async (password, saltRounds = 12) => {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('Mot de passe invalide');
    }

    const hash = await bcrypt.hash(password, saltRounds);
    console.log('✅ Mot de passe hashé avec succès');
    return hash;
  } catch (error) {
    console.error('❌ Erreur hashage mot de passe:', error);
    throw new Error('Erreur lors du hashage du mot de passe');
  }
};

/**
 * Vérifier un mot de passe contre son hash
 * @param {string} password - Mot de passe en clair
 * @param {string} hash - Hash à vérifier
 * @returns {Promise<boolean>} - True si le mot de passe correspond
 */
const verifyPassword = async (password, hash) => {
  try {
    if (!password || !hash) {
      return false;
    }

    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('❌ Erreur vérification mot de passe:', error);
    return false;
  }
};

/**
 * Générer un token aléatoire sécurisé
 * @param {number} length - Longueur du token (défaut: 32)
 * @returns {string} - Token hexadécimal
 */
const generateSecureToken = (length = 32) => {
  try {
    return crypto.randomBytes(length).toString('hex');
  } catch (error) {
    console.error('❌ Erreur génération token:', error);
    throw new Error('Erreur lors de la génération du token');
  }
};

/**
 * Générer un salt aléatoire
 * @param {number} length - Longueur du salt (défaut: 16)
 * @returns {string} - Salt hexadécimal
 */
const generateSalt = (length = 16) => {
  try {
    return crypto.randomBytes(length).toString('hex');
  } catch (error) {
    console.error('❌ Erreur génération salt:', error);
    throw new Error('Erreur lors de la génération du salt');
  }
};

/**
 * Hasher une chaîne avec SHA-256
 * @param {string} data - Données à hasher
 * @param {string} salt - Salt optionnel
 * @returns {string} - Hash SHA-256
 */
const hashSHA256 = (data, salt = '') => {
  try {
    const hash = crypto.createHash('sha256');
    hash.update(data + salt);
    return hash.digest('hex');
  } catch (error) {
    console.error('❌ Erreur hash SHA-256:', error);
    throw new Error('Erreur lors du hashage SHA-256');
  }
};

/**
 * Valider la force d'un mot de passe
 * @param {string} password - Mot de passe à valider
 * @returns {Object} - Résultat de la validation
 */
const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      score: 0,
      message: 'Mot de passe requis'
    };
  }

  let score = 0;
  const feedback = [];

  // Longueur minimale
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Au moins 8 caractères');
  }

  // Longueur recommandée
  if (password.length >= 12) {
    score += 1;
  } else {
    feedback.push('12 caractères ou plus recommandés');
  }

  // Majuscules
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Au moins une majuscule');
  }

  // Minuscules
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Au moins une minuscule');
  }

  // Chiffres
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Au moins un chiffre');
  }

  // Caractères spéciaux
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Au moins un caractère spécial');
  }

  // Pas de séquences communes
  const commonSequences = ['123', 'abc', 'qwerty', 'password', 'admin'];
  const hasCommonSequence = commonSequences.some(seq => 
    password.toLowerCase().includes(seq)
  );
  
  if (!hasCommonSequence) {
    score += 1;
  } else {
    feedback.push('Éviter les séquences communes');
  }

  // Déterminer le niveau de sécurité
  let level = 'Très faible';
  let isValid = false;

  if (score >= 5) {
    level = 'Fort';
    isValid = true;
  } else if (score >= 4) {
    level = 'Moyen';
    isValid = true;
  } else if (score >= 3) {
    level = 'Faible';
    isValid = false;
  }

  return {
    isValid,
    score,
    level,
    message: isValid 
      ? `Mot de passe ${level.toLowerCase()}` 
      : `Mot de passe ${level.toLowerCase()}: ${feedback.join(', ')}`,
    feedback
  };
};

/**
 * Nettoyer et échapper une chaîne pour éviter les injections
 * @param {string} input - Chaîne à nettoyer
 * @returns {string} - Chaîne nettoyée
 */
const sanitizeString = (input) => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Supprimer < et >
    .replace(/javascript:/gi, '') // Supprimer javascript:
    .replace(/on\w+=/gi, '') // Supprimer les handlers d'événements
    .replace(/\0/g, '') // Supprimer les caractères null
    .substring(0, 10000); // Limiter la longueur
};

/**
 * Valider un email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si l'email est valide
 */
const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
};

/**
 * Générer un ID de session sécurisé
 * @returns {string} - ID de session
 */
const generateSessionId = () => {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(16).toString('hex');
  return hashSHA256(timestamp + randomBytes);
};

/**
 * Vérifier si une IP est dans une liste blanche
 * @param {string} ip - Adresse IP
 * @param {Array} whitelist - Liste des IPs autorisées
 * @returns {boolean} - True si l'IP est autorisée
 */
const isIPWhitelisted = (ip, whitelist = []) => {
  if (!Array.isArray(whitelist) || whitelist.length === 0) {
    return true; // Pas de restriction si pas de whitelist
  }

  return whitelist.includes(ip);
};

/**
 * Créer un hash HMAC pour vérifier l'intégrité des données
 * @param {string} data - Données à signer
 * @param {string} secret - Clé secrète
 * @returns {string} - Signature HMAC
 */
const createHMAC = (data, secret) => {
  try {
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  } catch (error) {
    console.error('❌ Erreur création HMAC:', error);
    throw new Error('Erreur lors de la création de la signature');
  }
};

/**
 * Vérifier une signature HMAC
 * @param {string} data - Données originales
 * @param {string} signature - Signature à vérifier
 * @param {string} secret - Clé secrète
 * @returns {boolean} - True si la signature est valide
 */
const verifyHMAC = (data, signature, secret) => {
  try {
    const expectedSignature = createHMAC(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('❌ Erreur vérification HMAC:', error);
    return false;
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  generateSalt,
  hashSHA256,
  validatePasswordStrength,
  sanitizeString,
  isValidEmail,
  generateSessionId,
  isIPWhitelisted,
  createHMAC,
  verifyHMAC
};