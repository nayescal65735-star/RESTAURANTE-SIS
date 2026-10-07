const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET /api/mesas
router.get('/', async (req, res, next) => {
  try {
    const mesas = await prisma.mesa.findMany({
      orderBy: { numero: 'asc' },
      include: {
        pedidos: {
          where: {
            estado: { in: ['PENDIENTE', 'EN_PREPARACION', 'LISTO'] },
          },
          orderBy: { fecha: 'desc' },
          take: 1,
          include: {
            cliente: { select: { id: true, nombre: true } },
            usuario: { select: { id: true, nombre: true } },
            detalles: {
              include: { plato: { select: { nombre: true, precio: true } } },
            },
          },
        },
        reservas: {
          where: {
            estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
          },
          orderBy: { fecha: 'asc' },
          take: 1,
          include: {
            cliente: { select: { nombre: true, telefono: true } },
          },
        },
      },
    });

    res.json({ success: true, data: mesas });
  } catch (error) {
    next(error);
  }
});

// POST /api/mesas
router.post('/', async (req, res, next) => {
  try {
    const { numero, capacidad, estado } = req.body;
    if (!numero || !capacidad) {
      return res.status(400).json({ success: false, error: 'Número y capacidad son obligatorios' });
    }

    const num = parseInt(numero, 10);
    const cap = parseInt(capacidad, 10);

    const existe = await prisma.mesa.findUnique({ where: { numero: num } });
    if (existe) {
      return res.status(400).json({ success: false, error: `La mesa número ${num} ya existe` });
    }

    const nuevaMesa = await prisma.mesa.create({
      data: {
        numero: num,
        capacidad: cap,
        estado: estado || 'DISPONIBLE',
      },
    });

    res.status(201).json({ success: true, data: nuevaMesa, message: 'Mesa creada correctamente' });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/mesas/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { numero, capacidad, estado } = req.body;

    const dataToUpdate = {};
    if (numero !== undefined) dataToUpdate.numero = parseInt(numero, 10);
    if (capacidad !== undefined) dataToUpdate.capacidad = parseInt(capacidad, 10);
    if (estado !== undefined) {
      const validEstados = ['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'MANTENIMIENTO'];
      if (!validEstados.includes(estado)) {
        return res.status(400).json({ success: false, error: 'Estado de mesa inválido' });
      }
      dataToUpdate.estado = estado;
    }

    const updated = await prisma.mesa.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({ success: true, data: updated, message: 'Mesa actualizada correctamente' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/mesas/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.mesa.delete({ where: { id } });
    res.json({ success: true, message: 'Mesa eliminada correctamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
