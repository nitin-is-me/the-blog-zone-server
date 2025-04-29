// crypto-utils.js
const crypto = require('crypto');

// Encryption settings
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'mera-32-character-secret-key-here'; // Must be 32 chars for aes-256
const IV_LENGTH = 16; // For AES, this is always 16
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts text using AES-256-CBC with a random initialization vector
 * @param {string} text - The text to encrypt (post content)
 * @returns {string} - Encrypted text as hex string with IV prepended
 */
const encrypt = (text) => {
  if (!text) return text;
  
  // Create a random initialization vector
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Create cipher with key and iv
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  // Encrypt the text
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Prepend IV to encrypted data for use in decryption
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * Decrypts text using AES-256-CBC
 * @param {string} text - The encrypted text with IV prepended
 * @returns {string} - Decrypted text in utf8
 */
const decrypt = (text) => {
  if (!text) return text;
  
  // Extract IV from the encrypted text
  const textParts = text.split(':');
  if (textParts.length !== 2) return text; // Not in expected format
  
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = textParts.join(':');
  
  // Create decipher with key and iv
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  // Decrypt the text
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

module.exports = { encrypt, decrypt };
