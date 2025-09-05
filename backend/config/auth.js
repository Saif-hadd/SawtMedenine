/**
 * Configuration JWT pour l'authentification des administrateurs
 * Génération et vérification des tokens sécurisés
 */

const jwt = require('jsonwebtoken');

/**
 * Génère un token JWT pour un administrateur
 * @param {string} adminId - ID de l'administrateur
 * @param {string} email - Email de l'administrateur
 * @returns {string} - Token JWT signé
 */
const generateToken = (adminId, email) => {
  try {
    const payload = {
      id: adminId,
      email: email,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000) // Timestamp de création
    };

    const options = {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      issuer: 'medenine-portal',
      audience: 'medenine-admin'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, options);
    
    console.log('✅ Token JWT généré pour:', email);
    return token;

  } catch (error) {
    console.error('❌ Erreur génération token JWT:', error);
    throw new Error('Erreur lors de la génération du token d\'authentification');
  }
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Token à vérifier
 * @returns {Object} - Payload décodé du token
 */
const verifyToken = (token) => {
  try {
    const options = {
      issuer: 'medenine-portal',
      audience: 'medenine-admin'
    };

    const decoded = jwt.verify(token, process.env.JWT_SECRET, options);
    
    // Vérifier que le token n'est pas expiré
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      throw new Error('Token expiré');
    }

    return decoded;

  } catch (error) {
    console.error('❌ Erreur vérification token JWT:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expiré, veuillez vous reconnecter');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Token invalide');
    } else {
      throw new Error('Erreur d\'authentification');
    }
  }
};

/**
 * Extrait le token du header Authorization
 * @param {string} authHeader - Header Authorization
 * @returns {string|null} - Token extrait ou null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  // Format attendu: "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Vérifie la force d'un mot de passe
 * @param {string} password - Mot de passe à vérifier
 * @returns {Object} - Résultat de la validation
 */
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;

  return {
    isValid,
    message: isValid 
      ? 'Mot de passe valide' 
      : 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
  };
};

module.exports = {
  generateToken,
  verifyToken,
  extractTokenFromHeader,
  validatePasswordStrength
};