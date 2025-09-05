/**
 * Serveur principal de l'application Médenine Citizen Portal
 * Backend sécurisé pour la gestion des suggestions et réclamations citoyennes
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');

// Configuration de la base de données
const connectDB = require('./config/db');

// Routes
const citizenRoutes = require('./routes/citizen');
const adminRoutes = require('./routes/admin');

// Initialisation de l'application Express
const app = express();

// Connexion à la base de données
connectDB();

// ================================
// MIDDLEWARE DE SÉCURITÉ
// ================================

// Helmet pour sécuriser les headers HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// Configuration CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Autoriser les requêtes sans origine (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://medenine-portal.netlify.app', // Exemple de domaine de production
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(`❌ Origine CORS non autorisée: ${origin}`);
      callback(new Error('Non autorisé par la politique CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // Cache preflight pendant 24h
};

app.use(cors(corsOptions));

// Protection contre les injections NoSQL
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.log(`⚠️ Tentative d'injection NoSQL détectée: ${key} dans ${req.path}`);
  }
}));

// Limitation du taux de requêtes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  message: {
    success: false,
    message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.log(`🚫 Rate limit dépassé pour IP: ${req.ip} sur ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
});

// Limitation stricte pour les routes d'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite à 5 tentatives de connexion par IP
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    console.log(`🔒 Tentatives de connexion excessives depuis IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    });
  }
});

// Appliquer le rate limiting général
app.use(generalLimiter);

// Rate limiting spécifique pour l'authentification
app.use('/api/admin/login', authLimiter);

// ================================
// MIDDLEWARE DE PARSING
// ================================

// Parser JSON avec limite de taille
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      console.log(`❌ JSON invalide reçu de ${req.ip}`);
      res.status(400).json({
        success: false,
        message: 'Format JSON invalide',
        code: 'INVALID_JSON'
      });
      return;
    }
  }
}));

// Parser URL-encoded
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// ================================
// MIDDLEWARE DE LOGGING
// ================================

// Logger les requêtes en mode développement
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`📝 ${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
    next();
  });
}

// ================================
// ROUTES DE SANTÉ
// ================================

// Route de santé générale
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Serveur Médenine Portal opérationnel',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Route d'information sur l'API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'API Médenine Citizen Portal',
    data: {
      version: '1.0.0',
      description: 'API pour la gestion des suggestions et réclamations citoyennes de Médenine',
      endpoints: {
        citizen: '/api/citizen',
        admin: '/api/admin'
      },
      documentation: 'https://docs.medenine-portal.tn',
      support: 'support@medenine.tn'
    }
  });
});

// ================================
// ROUTES PRINCIPALES
// ================================

// Routes citoyennes (publiques)
app.use('/api/citizen', citizenRoutes);

// Routes administrateur (privées)
app.use('/api/admin', adminRoutes);

// ================================
// GESTION DES ERREURS
// ================================

// Route 404 pour les endpoints non trouvés
app.use('*', (req, res) => {
  console.log(`❌ Route non trouvée: ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
  res.status(404).json({
    success: false,
    message: 'Endpoint non trouvé',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
});

// Middleware de gestion d'erreurs global
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error);

  // Erreur de validation Mongoose
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }));

    return res.status(400).json({
      success: false,
      message: 'Erreur de validation des données',
      errors: validationErrors,
      code: 'VALIDATION_ERROR'
    });
  }

  // Erreur de cast MongoDB (ID invalide)
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'ID invalide',
      code: 'INVALID_ID'
    });
  }

  // Erreur de duplication MongoDB
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} déjà existant`,
      code: 'DUPLICATE_ENTRY'
    });
  }

  // Erreur CORS
  if (error.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Accès refusé par la politique CORS',
      code: 'CORS_ERROR'
    });
  }

  // Erreur de taille de payload
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'Données trop volumineuses',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }

  // Erreur générique
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.message,
      stack: error.stack 
    })
  });
});

// ================================
// DÉMARRAGE DU SERVEUR
// ================================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('🚀 ================================');
  console.log('🏛️  MÉDENINE CITIZEN PORTAL API');
  console.log('🚀 ================================');
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 URL locale: http://localhost:${PORT}`);
  console.log(`🔗 API Health: http://localhost:${PORT}/health`);
  console.log(`👥 Routes citoyens: http://localhost:${PORT}/api/citizen`);
  console.log(`🔐 Routes admin: http://localhost:${PORT}/api/admin`);
  console.log('🚀 ================================');
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
  console.log('🔄 Signal SIGTERM reçu, arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 Signal SIGINT reçu, arrêt du serveur...');
  server.close(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Promesse rejetée non gérée:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exception non capturée:', err);
  process.exit(1);
});

module.exports = app;