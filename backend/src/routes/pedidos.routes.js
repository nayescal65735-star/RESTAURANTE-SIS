const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

const pedidoInclude = {
  usuario: { select: { id: true, nombre: true, email: true, rol: true } },
  cliente: { select: { id: true, nombre: true, telefono: true, email: true } },
  mesa: { select: { id: true, numero: true, capacidad: true, estado: true } },
  detalles: {
    include: {
      plato: {
        select: { id: true, nombre: true, precio: true, categoriaId: true },
      },
    },
  },
  venta: {
    select: { id: true, total: true, metodoPago: true, estado: true, fecha: true },
  },
};

// GET /api/pedidos
router.get('/', async (req, res, next) => {
  try {
    const { estado, mesaId } = req.query;
    const where = {};

    if (estado) {
      where.estado = estado;
    }
    if (mesaId) {
      where.mesaId = parseInt(mesaId, 10);
    }

    const pedidos = await prisma.pedido.findMany({
      where,
      orderBy: { fecha: 'desc' },
      include: pedidoInclude,
    });

    res.json({ success: true, data: pedidos });
  } catch (error) {
    next(error);
  }
});

// GET /api/pedidos/:id
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: pedidoInclude,
    });

    if (!pedido) {
      return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
    }

    res.json({ success: true, data: pedido });
  } catch (error) {
    next(error);
  }
});

// POST /api/pedidos
router.post('/', async (req, res, next) => {
  try {
    const { usuarioId, clienteId, mesaId, observacion, detalles, estado } = req.body;

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El pedido debe contener al menos un plato en el detalle',
      });
    }

    // Validar usuario (si no se envía, asignar el primer admin/mesero)
    let finalUsuarioId = usuarioId ? parseInt(usuarioId, 10) : null;
    if (!finalUsuarioId) {
      const defaultUser = await prisma.usuario.findFirst({ where: { activo: true } });
      if (!defaultUser) {
        return res.status(400).json({ success: false, error: 'No hay usuarios registrados en el sistema' });
      }
      finalUsuarioId = defaultUser.id;
    }

    // Validar platos y obtener precios reales de la BD
    const platoIds = detalles.map((d) => parseInt(d.platoId, 10));
    const platosDb = await prisma.plato.findMany({
      where: { id: { in: platoIds } },
    });

    if (platosDb.length !== platoIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Uno o más platos seleccionados no existen en la base de datos',
      });
    }

    // Mapear detalles con precios de la base de datos para integridad
    const detallesData = detalles.map((d) => {
      const plato = platosDb.find((p) => p.id === parseInt(d.platoId, 10));
      return {
        platoId: plato.id,
        cantidad: parseInt(d.cantidad, 10) || 1,
        precio: plato.precio, // Precio congelado al momento del pedido
      };
    });

    const parsedMesaId = mesaId ? parseInt(mesaId, 10) : null;
    const parsedClienteId = clienteId ? parseInt(clienteId, 10) : null;

    // Transacción para crear pedido y actualizar mesa
    const nuevoPedido = await prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.create({
        data: {
          usuarioId: finalUsuarioId,
          clienteId: parsedClienteId,
          mesaId: parsedMesaId,
          observacion: observacion ? observacion.trim() : null,
          estado: estado || 'PENDIENTE',
          detalles: {
            create: detallesData,
          },
        },
        include: pedidoInclude,
      });

      // Si tiene mesa asignada, cambiar estado a OCUPADA
      if (parsedMesaId) {
        await tx.mesa.update({
          where: { id: parsedMesaId },
          data: { estado: 'OCUPADA' },
        });
      }

      return pedido;
    });

    res.status(201).json({
      success: true,
      data: nuevoPedido,
      message: 'Pedido registrado exitosamente',
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/pedidos/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { estado, observacion, mesaId } = req.body;

    const dataToUpdate = {};
    if (estado !== undefined) {
      const validEstados = ['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO'];
      if (!validEstados.includes(estado)) {
        return res.status(400).json({ success: false, error: 'Estado de pedido inválido' });
      }
      dataToUpdate.estado = estado;
    }
    if (observacion !== undefined) dataToUpdate.observacion = observacion ? observacion.trim() : null;
    if (mesaId !== undefined) dataToUpdate.mesaId = mesaId ? parseInt(mesaId, 10) : null;

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.pedido.update({
        where: { id },
        data: dataToUpdate,
        include: pedidoInclude,
      });

      // Si se cancela y tiene mesa, liberar la mesa si no hay otros pedidos activos
      if (p.estado === 'CANCELADO' && p.mesaId) {
        const otrosPedidos = await tx.pedido.count({
          where: {
            mesaId: p.mesaId,
            id: { not: p.id },
            estado: { in: ['PENDIENTE', 'EN_PREPARACION', 'LISTO'] },
          },
        });
        if (otrosPedidos === 0) {
          await tx.mesa.update({
            where: { id: p.mesaId },
            data: { estado: 'DISPONIBLE' },
          });
        }
      }

      return p;
    });

    res.json({ success: true, data: updated, message: 'Estado del pedido actualizado' });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/pedidos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.pedido.delete({ where: { id } });
    res.json({ success: true, message: 'Pedido eliminado correctamente' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
