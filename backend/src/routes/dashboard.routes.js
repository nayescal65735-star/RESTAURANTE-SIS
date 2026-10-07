const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

// GET /api/dashboard - Métricas consolidadas en tiempo real
router.get('/', async (req, res, next) => {
  try {
    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);

    const hoyFin = new Date();
    hoyFin.setHours(23, 59, 59, 999);

    // Contadores en paralelo
    const [
      totalMesas,
      mesasDisponibles,
      mesasOcupadas,
      mesasReservadas,
      totalClientes,
      pedidosHoyCount,
      pedidosPendientesCount,
      ventasHoy,
      todasVentas,
      pedidosRecientes,
      ultimasVentas,
      mesasLista,
    ] = await Promise.all([
      prisma.mesa.count(),
      prisma.mesa.count({ where: { estado: 'DISPONIBLE' } }),
      prisma.mesa.count({ where: { estado: 'OCUPADA' } }),
      prisma.mesa.count({ where: { estado: 'RESERVADA' } }),
      prisma.cliente.count(),
      prisma.pedido.count({
        where: {
          fecha: {
            gte: hoyInicio,
            lte: hoyFin,
          },
        },
      }),
      prisma.pedido.count({
        where: {
          estado: {
            in: ['PENDIENTE', 'EN_PREPARACION', 'LISTO'],
          },
        },
      }),
      prisma.venta.findMany({
        where: {
          fecha: {
            gte: hoyInicio,
            lte: hoyFin,
          },
          estado: 'PAGADA',
        },
        select: { total: true },
      }),
      prisma.venta.findMany({
        where: { estado: 'PAGADA' },
        select: { total: true },
      }),
      prisma.pedido.findMany({
        take: 5,
        orderBy: { fecha: 'desc' },
        include: {
          cliente: { select: { nombre: true } },
          mesa: { select: { numero: true } },
          usuario: { select: { nombre: true } },
          detalles: {
            include: { plato: { select: { nombre: true, precio: true } } },
          },
          venta: { select: { id: true, total: true, estado: true, metodoPago: true } },
        },
      }),
      prisma.venta.findMany({
        take: 5,
        orderBy: { fecha: 'desc' },
        include: {
          cliente: { select: { nombre: true } },
          usuario: { select: { nombre: true } },
          pedido: {
            select: {
              id: true,
              mesa: { select: { numero: true } },
            },
          },
        },
      }),
      prisma.mesa.findMany({
        orderBy: { numero: 'asc' },
      }),
    ]);

    const totalVentasHoy = ventasHoy.reduce((acc, v) => acc + Number(v.total), 0);
    const totalVentasHistorico = todasVentas.reduce((acc, v) => acc + Number(v.total), 0);

    res.json({
      success: true,
      data: {
        totalMesas,
        mesasDisponibles,
        mesasOcupadas,
        mesasReservadas,
        totalClientes,
        pedidosHoy: pedidosHoyCount,
        pedidosPendientes: pedidosPendientesCount,
        ventasHoy: totalVentasHoy,
        totalVentas: totalVentasHistorico,
        pedidosRecientes,
        ultimasVentas,
        mesas: mesasLista,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
