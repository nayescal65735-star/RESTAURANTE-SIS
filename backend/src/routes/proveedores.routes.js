const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET /api/proveedores
router.get('/', async (req, res, next) => {
  try {
    const proveedores = await prisma.proveedor.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { inventarios: true },
        },
      },
    });
    res.json({ success: true, data: proveedores });
  } catch (error) {
    next(error);
  }
});

// POST /api/proveedores
router.post('/', async (req, res, next) => {
  try {
    const { nombre, contacto, telefono, email, direccion, activo } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, error: 'El nombre del proveedor es obligatorio' });
    }

    const nuevo = await prisma.proveedor.create({
      data: {
        nombre: nombre.trim(),
        contacto: contacto ? contacto.trim() : null,
        telefono: telefono ? telefono.trim() : null,
        email: email ? email.trim().toLowerCase() : null,
        direccion: direccion ? direccion.trim() : null,
        activo: activo !== undefined ? Boolean(activo) : true,
      },
    });

    res.status(201).json({ success: true, data: nuevo, message: 'Proveedor creado correctamente' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/proveedores/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre, contacto, telefono, email, direccion, activo } = req.body;

    const dataToUpdate = {};
    if (nombre !== undefined) dataToUpdate.nombre = nombre.trim();
    if (contacto !== undefined) dataToUpdate.contacto = contacto ? contacto.trim() : null;
    if (telefono !== undefined) dataToUpdate.telefono = telefono ? telefono.trim() : null;
    if (email !== undefined) dataToUpdate.email = email ? email.trim().toLowerCase() : null;
    if (direccion !== undefined) dataToUpdate.direccion = direccion ? direccion.trim() : null;
    if (activo !== undefined) dataToUpdate.activo = Boolean(activo);

    const updated = await prisma.proveedor.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({ success: true, data: updated, message: 'Proveedor actualizado correctamente' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/proveedores/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.proveedor.delete({ where: { id } });
    res.json({ success: true, message: 'Proveedor eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
