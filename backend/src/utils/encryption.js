import CryptoJS from 'crypto-js';

/**
 * Utilidad de encriptación segura para API keys
 * Usa AES-256 con clave derivada del entorno
 */

// Clave de encriptación derivada del entorno
const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY || process.env.SUPABASE_URL;
  if (!key) {
    throw new Error('ENCRYPTION_KEY o SUPABASE_URL requerido para encriptación');
  }
  // Usar hash SHA256 para crear una clave de 256 bits consistente
  return CryptoJS.SHA256(key).toString();
};

/**
 * Encripta un texto usando AES-256
 * @param {string} text - Texto a encriptar
 * @returns {string} - Texto encriptado en formato base64
 */
export const encrypt = (text) => {
  try {
    const key = getEncryptionKey();
    const encrypted = CryptoJS.AES.encrypt(text, key).toString();
    return encrypted;
  } catch (error) {
    console.error('Error durante encriptación:', error);
    throw new Error('Error al encriptar datos');
  }
};

/**
 * Desencripta un texto encriptado con AES-256
 * @param {string} encryptedText - Texto encriptado
 * @returns {string} - Texto original desencriptado
 */
export const decrypt = (encryptedText) => {
  try {
    const key = getEncryptionKey();
    const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      throw new Error('No se pudo desencriptar - posible clave incorrecta');
    }
    
    return originalText;
  } catch (error) {
    console.error('Error durante desencriptación:', error);
    throw new Error('Error al desencriptar datos');
  }
};

/**
 * Encripta un API key específicamente
 * @param {string} apiKey - API key a encriptar
 * @returns {string} - API key encriptada
 */
export const encryptApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    throw new Error('API key debe ser un string válido');
  }
  return encrypt(apiKey);
};

/**
 * Desencripta un API key
 * @param {string} encryptedApiKey - API key encriptada
 * @returns {string} - API key original
 */
export const decryptApiKey = (encryptedApiKey) => {
  if (!encryptedApiKey || typeof encryptedApiKey !== 'string') {
    throw new Error('API key encriptada debe ser un string válido');
  }
  return decrypt(encryptedApiKey);
};