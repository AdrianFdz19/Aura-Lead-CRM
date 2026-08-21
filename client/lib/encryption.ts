import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Función interna para obtener y validar la llave en tiempo de ejecución (Runtime)
function getKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY || "";

  if (!keyHex && process.env.NODE_ENV === 'production') {
    throw new Error('ENCRYPTION_KEY is missing');
  }

  return Buffer.from(keyHex, 'hex');
}

export function encrypt(text: string): string {
  const key = getKey(); // Se obtiene solo cuando se usa
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const key = getKey(); // Se obtiene solo cuando se usa
  const [ivHex, tagHex, encryptedHex] = encryptedText.split(':');
  
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error('Invalid encrypted text format.');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}