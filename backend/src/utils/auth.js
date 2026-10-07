const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'restaurante-sis-super-secret-key-2026';
const JWT_EXPIRES_IN_MS = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Hashea una contraseña usando scrypt con salt aleatorio seguro
 * Formato resultante: scrypt:<salt_hex>:<hash_hex>
 */
function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password debe ser una cadena no vacía');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifica si una contraseña coincide con el valor almacenado (scrypt o texto plano legado)
 */
function verifyPassword(password, storedPassword) {
  if (!password || !storedPassword) return false;

  if (storedPassword.startsWith('scrypt:')) {
    const parts = storedPassword.split(':');
    if (parts.length !== 3) return false;
    const [, salt, originalHash] = parts;
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
    const hashBuffer = Buffer.from(originalHash, 'hex');
    if (keyBuffer.length !== hashBuffer.length) return false;
    return crypto.timingSafeEqual(keyBuffer, hashBuffer);
  }

  // Compatibilidad con contraseñas legadas en texto plano
  return password === storedPassword;
}

/**
 * Genera un token JWT firmado con HMAC SHA-256
 */
function generateToken(payload) {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const exp = Math.floor((Date.now() + JWT_EXPIRES_IN_MS) / 1000);
  const fullPayload = {
    ...payload,
    exp,
    iat: Math.floor(Date.now() / 1000),
  };

  const base64UrlHeader = Buffer.from(JSON.stringify(header))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const base64UrlPayload = Buffer.from(JSON.stringify(fullPayload))
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const signatureInput = `${base64UrlHeader}.${base64UrlPayload}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${signature}`;
}

/**
 * Valida y decodifica un token JWT
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signature] = parts;
  const signatureInput = `${headerB64}.${payloadB64}`;

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payloadJson = Buffer.from(payloadB64, 'base64').toString('utf8');
    const payload = JSON.parse(payloadJson);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expirado
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Middleware de Express para validar Authorization: Bearer <token>
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado: Token no proporcionado',
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(403).json({
      success: false,
      error: 'Sesión expirada o token inválido',
    });
  }

  req.user = user;
  next();
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  authenticateToken,
};
