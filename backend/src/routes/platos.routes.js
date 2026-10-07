const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET /api/platos
router.get('/', async (req, res, next) => {
  try {
    const { categoriaId, disponible, q } = req.query;

    const where = {};
    if (categoriaId) {
      where.categoriaId = parseInt(categoriaId, 10);
    }
    if (disponible !== undefined) {
      where.disponible = disponible === 'true' || disponible === true;
    }
    if (q) {
      where.OR = [
        { nombre: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } },
      ];
    }

    const platos = await prisma.plato.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        categoria: {
          select: { id: true, nombre: true },
        },
      },
    });

    res.json({ success: true, data: platos });
  } catch (error) {
    next(error);
  }
});

// GET /api/platos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const plato = await prisma.plato.findUnique({
      where: { id },
      include: {
        categoria: true,
      },
    });
    if (!plato) {
      return res.status(404).json({ success: false, error: 'Plato no encontrado' });
    }
    res.json({ success: true, data: plato });
  } catch (error) {
    next(error);
  }
});

// POST /api/platos
router.post('/', async (req, res, next) => {
  try {
    const { nombre, descripcion, precio, categoriaId, disponible } = req.body;
    if (!nombre || precio === undefined || !categoriaId) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, precio y categoría son obligatorios',
      });
    }

    const nuevo = await prisma.plato.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        precio: parseFloat(precio),
        categoriaId: parseInt(categoriaId, 10),
        disponible: disponible !== undefined ? Boolean(disponible) : true,
      },
      include: {
        categoria: { select: { id: true, nombre: true } },
      },
    });

    res.status(201).json({ success: true, data: nuevo, message: 'Plato registrado en el menú' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/platos/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre, descripcion, precio, categoriaId, disponible } = req.body;

    const dataToUpdate = {};
    if (nombre !== undefined) dataToUpdate.nombre = nombre.trim();
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion ? descripcion.trim() : null;
    if (precio !== undefined) dataToUpdate.precio = parseFloat(precio);
    if (categoriaId !== undefined) dataToUpdate.categoriaId = parseInt(categoriaId, 10);
    if (disponible !== undefined) dataToUpdate.disponible = Boolean(disponible);

    const updated = await prisma.plato.update({
      where: { id },
      data: dataToUpdate,
      include: {
        categoria: { select: { id: true, nombre: true } },
      },
    });

    res.json({ success: true, data: updated, message: 'Plato actualizado correctamente' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/platos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.plato.delete({ where: { id } });
    res.json({ success: true, message: 'Plato eliminado del menú' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
