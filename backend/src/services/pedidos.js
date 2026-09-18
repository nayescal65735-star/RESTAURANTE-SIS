const prisma = require("../lib/prisma");
const { httpError } = require("../lib/errors");
const { idParam } = require("../validators/common");

const allowedStatuses = ["PENDIENTE", "EN_PREPARACION", "LISTO", "ENTREGADO", "CANCELADO"];

function serialize(order) {
  const detalles = order.detalles.map((detail) => {
    const precio = Number(detail.precio);
    return {
      ...detail,
      precio,
      subtotal: Number((precio * detail.cantidad).toFixed(2)),
    };
  });
  return {
    ...order,
    detalles,
    total: Number(detalles.reduce((sum, detail) => sum + detail.subtotal, 0).toFixed(2)),
  };
}

async function list() {
  const orders = await prisma.pedido.findMany({
    include: { mesa: true, cliente: true, usuario: true, detalles: { include: { plato: true } } },
    orderBy: { createdAt: "desc" },
  });
  return orders.map(serialize);
}

async function getById(id) {
  const order = await prisma.pedido.findUnique({
    where: { id: idParam(id) },
    include: { mesa: true, cliente: true, usuario: true, detalles: { include: { plato: true } } },
  });
  if (!order) throw httpError(404, "Pedido no encontrado");
  return serialize(order);
}

async function resolveUserId(userId, tx) {
  if (userId) {
    const user = await tx.usuario.findUnique({ where: { id: userId } });
    if (!user) throw httpError(404, "Usuario no encontrado");
    return user.id;
  }
  const user = await tx.usuario.findFirst({ where: { activo: true }, orderBy: { id: "asc" } });
  if (!user) throw httpError(400, "No existe un usuario activo para registrar el pedido");
  return user.id;
}

async function create(data) {
  return prisma.$transaction(async (tx) => {
    if (data.mesaId) {
      const mesa = await tx.mesa.findUnique({ where: { id: data.mesaId } });
      if (!mesa) throw httpError(404, "Mesa no encontrada");
    }
    if (data.clienteId) {
      const cliente = await tx.cliente.findUnique({ where: { id: data.clienteId } });
      if (!cliente) throw httpError(404, "Cliente no encontrado");
    }

    const platoIds = [...new Set(data.detalles.map((detail) => detail.platoId))];
    const platos = await tx.plato.findMany({
      where: { id: { in: platoIds }, disponible: true },
    });
    if (platos.length !== platoIds.length) {
      throw httpError(404, "Uno o más platos no existen o no están disponibles");
    }
    const prices = new Map(platos.map((plato) => [plato.id, plato.precio]));
    const pedido = await tx.pedido.create({
      data: {
        usuarioId: await resolveUserId(data.usuarioId, tx),
        clienteId: data.clienteId,
        mesaId: data.mesaId,
        observacion: data.observacion,
        detalles: {
          create: data.detalles.map((detail) => ({
            platoId: detail.platoId,
            cantidad: detail.cantidad,
            precio: prices.get(detail.platoId),
          })),
        },
      },
      include: { mesa: true, cliente: true, usuario: true, detalles: { include: { plato: true } } },
    });
    return serialize(pedido);
  });
}

async function updateStatus(id, estado) {
  if (!allowedStatuses.includes(estado)) throw httpError(400, "Estado de pedido no válido");
  const orderId = idParam(id);
  await getById(orderId);
  await prisma.pedido.update({
    where: { id: orderId },
    data: { estado },
  });
  return getById(orderId);
}

module.exports = { list, getById, create, updateStatus };
