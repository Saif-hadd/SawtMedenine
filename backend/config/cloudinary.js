/**
 * Configuration Cloudinary pour le stockage sécurisé des fichiers
 * Dossier spécifique: medenine-app/
 */

const cloudinary = require('cloudinary').v2;

// Configuration avec les variables d'environnement
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true // Force HTTPS
});

/**
 * Upload un fichier vers Cloudinary dans le dossier medenine-app
 * @param {Buffer} fileBuffer - Buffer du fichier
 * @param {string} originalName - Nom original du fichier
 * @param {string} resourceType - Type de ressource ('image' ou 'raw' pour PDF)
 * @returns {Promise<Object>} - Résultat de l'upload
 */
const uploadFile = async (fileBuffer, originalName, resourceType = 'auto') => {
  try {
    // Générer un nom unique pour éviter les conflits
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}_${randomString}_${originalName}`;

    const uploadOptions = {
      folder: 'medenine-app', // Dossier spécifique pour l'application
      public_id: fileName,
      resource_type: resourceType,
      quality: 'auto:good', // Optimisation automatique de la qualité
      fetch_format: 'auto', // Format optimal automatique
      flags: 'sanitize', // Nettoie les métadonnées potentiellement dangereuses
    };

    // Upload vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Erreur upload Cloudinary:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(fileBuffer);
    });

    console.log('✅ Fichier uploadé vers Cloudinary:', result.public_id);
    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      format: result.format,
      bytes: result.bytes
    };

  } catch (error) {
    console.error('❌ Erreur critique upload Cloudinary:', error);
    throw new Error('Erreur lors de l\'upload du fichier');
  }
};

/**
 * Supprime un fichier de Cloudinary
 * @param {string} publicId - ID public du fichier à supprimer
 * @param {string} resourceType - Type de ressource
 * @returns {Promise<Object>} - Résultat de la suppression
 */
const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    console.log('🗑️ Fichier supprimé de Cloudinary:', publicId);
    return result;
  } catch (error) {
    console.error('❌ Erreur suppression Cloudinary:', error);
    throw new Error('Erreur lors de la suppression du fichier');
  }
};

/**
 * Génère une URL signée pour un accès sécurisé (optionnel)
 * @param {string} publicId - ID public du fichier
 * @param {Object} options - Options de transformation
 * @returns {string} - URL signée
 */
const getSignedUrl = (publicId, options = {}) => {
  try {
    const defaultOptions = {
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // Expire dans 1 heure
      ...options
    };

    return cloudinary.url(publicId, defaultOptions);
  } catch (error) {
    console.error('❌ Erreur génération URL signée:', error);
    throw new Error('Erreur lors de la génération de l\'URL sécurisée');
  }
};

module.exports = {
  cloudinary,
  uploadFile,
  deleteFile,
  getSignedUrl
};