const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { hashPassword } = require('../utils/auth');

const usuarioSelect = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  createdAt: true,
  updatedAt: true,
};

// GET /api/usuarios
router.get('/', async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: usuarioSelect,
      orderBy: { id: 'asc' },
    });
    res.json({ success: true, data: usuarios });
  } catch (error) {
    next(error);
  }
});

// GET /api/usuarios/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      select: usuarioSelect,
    });
    if (!usuario) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }
    res.json({ success: true, data: usuario });
  } catch (error) {
    next(error);
  }
});

// POST /api/usuarios
router.post('/', async (req, res, next) => {
  try {
    const { nombre, email, password, rol, activo } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ success: false, error: 'Nombre, email y contraseña son obligatorios' });
    }

    const emailNorm = email.trim().toLowerCase();
    const existe = await prisma.usuario.findUnique({ where: { email: emailNorm } });
    if (existe) {
      return res.status(400).json({ success: false, error: 'El email ya está registrado' });
    }

    const hashedPassword = hashPassword(password.trim());

    const nuevo = await prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        email: emailNorm,
        password: hashedPassword,
        rol: rol || 'MESERO',
        activo: activo !== undefined ? Boolean(activo) : true,
      },
      select: usuarioSelect,
    });

    res.status(201).json({ success: true, data: nuevo, message: 'Usuario creado exitosamente' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/usuarios/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre, email, password, rol, activo } = req.body;

    const dataToUpdate = {};
    if (nombre !== undefined) dataToUpdate.nombre = nombre.trim();
    if (email !== undefined) dataToUpdate.email = email.trim().toLowerCase();
    if (password !== undefined && password.trim() !== '') {
      dataToUpdate.password = hashPassword(password.trim());
    }
    if (rol !== undefined) dataToUpdate.rol = rol;
    if (activo !== undefined) dataToUpdate.activo = Boolean(activo);

    const updated = await prisma.usuario.update({
      where: { id },
      data: dataToUpdate,
      select: usuarioSelect,
    });

    res.json({ success: true, data: updated, message: 'Usuario actualizado correctamente' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    // Soft delete o hard delete con control de dependencias
    const updated = await prisma.usuario.update({
      where: { id },
      data: { activo: false },
      select: usuarioSelect,
    });
    res.json({ success: true, data: updated, message: 'Usuario desactivado correctamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
