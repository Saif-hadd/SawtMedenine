/**
 * Middleware d'authentification pour protéger les routes administrateur
 * Vérifie la validité du token JWT et l'autorisation d'accès
 */

const { verifyToken, extractTokenFromHeader } = require('../config/auth');
const Admin = require('../models/Admin');

/**
 * Middleware de vérification d'authentification admin
 * Protège toutes les routes /api/admin
 */
const authenticateAdmin = async (req, res, next) => {
  try {
    // Extraire le token du header Authorization
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Token d\'authentification requis.',
        code: 'NO_TOKEN'
      });
    }

    // Vérifier et décoder le token
    const decoded = verifyToken(token);

    // Vérifier que l'administrateur existe toujours en base
    const admin = await Admin.findById(decoded.id).select('-passwordHash');
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Accès refusé. Administrateur non trouvé.',
        code: 'ADMIN_NOT_FOUND'
      });
    }

    // Vérifier le rôle
    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Privilèges administrateur requis.',
        code: 'INSUFFICIENT_PRIVILEGES'
      });
    }

    // Ajouter les informations de l'admin à la requête
    req.admin = {
      id: admin._id,
      email: admin.email,
      role: 'admin'
    };

    console.log(`✅ Admin authentifié: ${admin.email}`);
    next();

  } catch (error) {
    console.error('❌ Erreur authentification admin:', error.message);

    // Gestion des différents types d'erreurs
    if (error.message.includes('Token expiré')) {
      return res.status(401).json({
        success: false,
        message: 'Session expirée. Veuillez vous reconnecter.',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.message.includes('Token invalide')) {
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification invalide.',
        code: 'INVALID_TOKEN'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur lors de l\'authentification.',
      code: 'AUTH_ERROR'
    });
  }
};

/**
 * Middleware optionnel pour identifier un admin sans bloquer l'accès
 * Utile pour des routes qui peuvent être accessibles aux deux types d'utilisateurs
 */
const identifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const decoded = verifyToken(token);
      const admin = await Admin.findById(decoded.id).select('-passwordHash');
      
      if (admin && decoded.role === 'admin') {
        req.admin = {
          id: admin._id,
          email: admin.email,
          role: 'admin'
        };
      }
    }

    next();
  } catch (error) {
    // En cas d'erreur, on continue sans authentification
    console.log('ℹ️ Token présent mais invalide, accès en mode public');
    next();
  }
};

/**
 * Middleware de limitation du taux de requêtes pour les routes sensibles
 */
const rateLimitAuth = (req, res, next) => {
  // Cette fonction peut être étendue avec express-rate-limit
  // Pour l'instant, on passe directement
  next();
};

module.exports = {
  authenticateAdmin,
  identifyAdmin,
  rateLimitAuth
};