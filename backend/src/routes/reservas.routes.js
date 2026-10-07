const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

const reservaInclude = {
  cliente: { select: { id: true, nombre: true, telefono: true, email: true } },
  mesa: { select: { id: true, numero: true, capacidad: true, estado: true } },
};

// GET /api/reservas
router.get('/', async (req, res, next) => {
  try {
    const { estado, mesaId } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (mesaId) where.mesaId = parseInt(mesaId, 10);

    const reservas = await prisma.reserva.findMany({
      where,
      orderBy: { fecha: 'asc' },
      include: reservaInclude,
    });

    res.json({ success: true, data: reservas });
  } catch (error) {
    next(error);
  }
});

// POST /api/reservas
router.post('/', async (req, res, next) => {
  try {
    const { clienteId, mesaId, fecha, cantidad, observacion, estado } = req.body;

    if (!clienteId || !mesaId || !fecha || !cantidad) {
      return res.status(400).json({
        success: false,
        error: 'Cliente, mesa, fecha y cantidad de personas son obligatorios',
      });
    }

    const parsedClienteId = parseInt(clienteId, 10);
    const parsedMesaId = parseInt(mesaId, 10);
    const parsedCantidad = parseInt(cantidad, 10);
    const parsedFecha = new Date(fecha);

    if (isNaN(parsedFecha.getTime())) {
      return res.status(400).json({ success: false, error: 'Fecha inválida' });
    }

    const nuevaReserva = await prisma.reserva.create({
      data: {
        clienteId: parsedClienteId,
        mesaId: parsedMesaId,
        fecha: parsedFecha,
        cantidad: parsedCantidad,
        observacion: observacion ? observacion.trim() : null,
        estado: estado || 'PENDIENTE',
      },
      include: reservaInclude,
    });

    res.status(201).json({
      success: true,
      data: nuevaReserva,
      message: 'Reserva creada correctamente',
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/reservas/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { clienteId, mesaId, fecha, cantidad, observacion, estado } = req.body;

    const dataToUpdate = {};
    if (clienteId !== undefined) dataToUpdate.clienteId = parseInt(clienteId, 10);
    if (mesaId !== undefined) dataToUpdate.mesaId = parseInt(mesaId, 10);
    if (fecha !== undefined) dataToUpdate.fecha = new Date(fecha);
    if (cantidad !== undefined) dataToUpdate.cantidad = parseInt(cantidad, 10);
    if (observacion !== undefined) dataToUpdate.observacion = observacion ? observacion.trim() : null;
    if (estado !== undefined) {
      const valid = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'];
      if (!valid.includes(estado)) {
        return res.status(400).json({ success: false, error: 'Estado de reserva inválido' });
      }
      dataToUpdate.estado = estado;
    }

    const updated = await prisma.reserva.update({
      where: { id },
      data: dataToUpdate,
      include: reservaInclude,
    });

    res.json({ success: true, data: updated, message: 'Reserva actualizada' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/reservas/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.reserva.delete({ where: { id } });
    res.json({ success: true, message: 'Reserva eliminada correctamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
