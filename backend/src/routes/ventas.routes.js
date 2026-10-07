const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

const ventaInclude = {
  usuario: { select: { id: true, nombre: true, email: true, rol: true } },
  cliente: { select: { id: true, nombre: true, telefono: true, email: true } },
  pedido: {
    include: {
      mesa: { select: { id: true, numero: true } },
      detalles: {
        include: {
          plato: { select: { id: true, nombre: true, precio: true } },
        },
      },
    },
  },
};

// GET /api/ventas
router.get('/', async (req, res, next) => {
  try {
    const { metodoPago, estado } = req.query;
    const where = {};
    if (metodoPago) where.metodoPago = metodoPago;
    if (estado) where.estado = estado;

    const ventas = await prisma.venta.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: ventaInclude,
    });

    res.json({ success: true, data: ventas });
  } catch (error) {
    next(error);
  }
});

// GET /api/ventas/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const venta = await prisma.venta.findUnique({
      where: { id },
      include: ventaInclude,
    });

    if (!venta) {
      return res.status(404).json({ success: false, error: 'Venta no encontrada' });
    }

    res.json({ success: true, data: venta });
  } catch (error) {
    next(error);
  }
});

// POST /api/ventas
router.post('/', async (req, res, next) => {
  try {
    const { pedidoId, metodoPago, usuarioId, clienteId, estado } = req.body;

    if (!pedidoId) {
      return res.status(400).json({ success: false, error: 'El ID de pedido es obligatorio' });
    }

    const parsedPedidoId = parseInt(pedidoId, 10);

    // Verificar si ya existe una venta para este pedido
    const ventaExistente = await prisma.venta.findUnique({
      where: { pedidoId: parsedPedidoId },
    });
    if (ventaExistente) {
      return res.status(400).json({
        success: false,
        error: `Ya existe un registro de venta (#${ventaExistente.id}) para este pedido`,
      });
    }

    // Obtener el pedido y sus detalles
    const pedido = await prisma.pedido.findUnique({
      where: { id: parsedPedidoId },
      include: {
        detalles: true,
        cliente: true,
        usuario: true,
        mesa: true,
      },
    });

    if (!pedido) {
      return res.status(404).json({ success: false, error: 'El pedido no existe' });
    }

    // Calcular el total a partir de los detalles
    const totalCalculado = pedido.detalles.reduce((acc, d) => {
      return acc + Number(d.precio) * d.cantidad;
    }, 0);

    // Validar método de pago
    const validMetodos = ['EFECTIVO', 'TARJETA', 'QR'];
    const finalMetodoPago = validMetodos.includes(metodoPago) ? metodoPago : 'EFECTIVO';
    const finalEstado = estado || 'PAGADA';
    const finalUsuarioId = usuarioId ? parseInt(usuarioId, 10) : pedido.usuarioId;
    const finalClienteId = clienteId ? parseInt(clienteId, 10) : pedido.clienteId;

    // Transacción atómica: Crear venta, actualizar pedido a ENTREGADO y liberar mesa
    const nuevaVenta = await prisma.$transaction(async (tx) => {
      const venta = await tx.venta.create({
        data: {
          total: totalCalculado,
          metodoPago: finalMetodoPago,
          estado: finalEstado,
          pedidoId: parsedPedidoId,
          usuarioId: finalUsuarioId,
          clienteId: finalClienteId,
        },
        include: ventaInclude,
      });

      // Si el pago se efectúa, marcar pedido como ENTREGADO
      if (finalEstado === 'PAGADA') {
        await tx.pedido.update({
          where: { id: parsedPedidoId },
          data: { estado: 'ENTREGADO' },
        });

        // Si tenía mesa asociada, liberar la mesa si no hay otros pedidos activos
        if (pedido.mesaId) {
          const otrosPendientes = await tx.pedido.count({
            where: {
              mesaId: pedido.mesaId,
              id: { not: parsedPedidoId },
              estado: { in: ['PENDIENTE', 'EN_PREPARACION', 'LISTO'] },
            },
          });
          if (otrosPendientes === 0) {
            await tx.mesa.update({
              where: { id: pedido.mesaId },
              data: { estado: 'DISPONIBLE' },
            });
          }
        }
      }

      return venta;
    });

    res.status(201).json({
      success: true,
      data: nuevaVenta,
      message: 'Venta registrada y cobrada exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/ventas/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { metodoPago, estado } = req.body;

    const dataToUpdate = {};
    if (metodoPago !== undefined) dataToUpdate.metodoPago = metodoPago;
    if (estado !== undefined) dataToUpdate.estado = estado;

    const updated = await prisma.venta.update({
      where: { id },
      data: dataToUpdate,
      include: ventaInclude,
    });

    res.json({ success: true, data: updated, message: 'Venta actualizada' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
