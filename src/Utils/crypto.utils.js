import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import * as dotenv from 'dotenv';
dotenv.config();

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 chars
const SALT = 'fixed-salt-value'; // Use a fixed salt for key derivation

// Key derivation (must be consistent)
const key = scryptSync(ENCRYPTION_KEY, SALT, 32);

export const encrypt = (text) => {
    if (!text) return text;
    try {
        const iv = randomBytes(16);
        const cipher = createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Encryption failed');
    }
};

export const decrypt = (encryptedText) => {
    if (!encryptedText) return encryptedText;
    try {
        const [ivHex, data] = encryptedText.split(':');
        if (!ivHex || !data) throw new Error('Invalid encrypted format');
        
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(data, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};