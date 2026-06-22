import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_HEX = process.env.ENCRYPTION_KEY;

// Validamos la existencia de la llave en el entorno de servidor
if (!KEY_HEX) {
  throw new Error('ENCRYPTION_KEY environment variable is missing in server configuration.');
}

// Convertimos la llave hexadecimal a un buffer de 32 bytes (256 bits)
const key = Buffer.from(KEY_HEX, 'hex');

export function encrypt(text: string): string {
  // Generamos un Initialization Vector (IV) aleatorio de 12 bytes para GCM
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Obtenemos el Auth Tag para verificar la integridad del cifrado
  const tag = cipher.getAuthTag();
  
  // Unimos los componentes necesarios para poder descifrarlo posteriormente
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
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