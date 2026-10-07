const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const {
  hashPassword,
  verifyPassword,
  generateToken,
  authenticateToken,
} = require('../utils/auth');

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Debe ingresar correo y contraseña',
      });
    }

    const emailNorm = String(email).trim().toLowerCase();
    const usuario = await prisma.usuario.findUnique({
      where: { email: emailNorm },
    });

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas o usuario no encontrado',
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        error: 'Este usuario se encuentra desactivado',
      });
    }

    const passwordValida = verifyPassword(String(password), usuario.password);
    if (!passwordValida) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas: Contraseña incorrecta',
      });
    }

    // Si la contraseña estaba en texto plano, migrarla a hash de forma transparente
    if (!usuario.password.startsWith('scrypt:')) {
      try {
        const hashedPassword = hashPassword(String(password));
        await prisma.usuario.update({
          where: { id: usuario.id },
          data: { password: hashedPassword },
        });
      } catch (migrateErr) {
        console.warn('Advertencia al migrar contraseña:', migrateErr.message);
      }
    }

    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = generateToken(payload);

    res.json({
      success: true,
      token,
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        activo: usuario.activo,
      },
      message: 'Inicio de sesión exitoso',
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Obtener información del usuario autenticado
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no encontrado o inactivo',
      });
    }

    res.json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
