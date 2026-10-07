const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET /api/categorias
router.get('/', async (req, res, next) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { platos: true },
        },
      },
    });
    res.json({ success: true, data: categorias });
  } catch (error) {
    next(error);
  }
});

// POST /api/categorias
router.post('/', async (req, res, next) => {
  try {
    const { nombre, descripcion, activo } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, error: 'El nombre de la categoría es obligatorio' });
    }

    const nueva = await prisma.categoria.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion ? descripcion.trim() : null,
        activo: activo !== undefined ? Boolean(activo) : true,
      },
    });

    res.status(201).json({ success: true, data: nueva, message: 'Categoría creada correctamente' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/categorias/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { nombre, descripcion, activo } = req.body;

    const dataToUpdate = {};
    if (nombre !== undefined) dataToUpdate.nombre = nombre.trim();
    if (descripcion !== undefined) dataToUpdate.descripcion = descripcion ? descripcion.trim() : null;
    if (activo !== undefined) dataToUpdate.activo = Boolean(activo);

    const updated = await prisma.categoria.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({ success: true, data: updated, message: 'Categoría actualizada correctamente' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/categorias/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.categoria.delete({ where: { id } });
    res.json({ success: true, message: 'Categoría eliminada correctamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
