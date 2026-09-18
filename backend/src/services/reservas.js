const prisma = require("../lib/prisma");
const { httpError } = require("../lib/errors");
const { idParam } = require("../validators/common");

const activeStates = ["PENDIENTE", "CONFIRMADA"];

async function list() {
  return prisma.reserva.findMany({
    include: { cliente: true, mesa: true },
    orderBy: { fecha: "asc" },
  });
}

async function getById(id) {
  const reserva = await prisma.reserva.findUnique({
    where: { id: idParam(id) },
    include: { cliente: true, mesa: true },
  });
  if (!reserva) throw httpError(404, "Reserva no encontrada");
  return reserva;
}

async function assertReferences(data) {
  const [cliente, mesa] = await Promise.all([
    prisma.cliente.findUnique({ where: { id: data.clienteId } }),
    prisma.mesa.findUnique({ where: { id: data.mesaId } }),
  ]);
  if (!cliente) throw httpError(404, "Cliente no encontrado");
  if (!mesa) throw httpError(404, "Mesa no encontrada");
  if (data.cantidad > mesa.capacidad) {
    throw httpError(400, "La cantidad de personas supera la capacidad de la mesa");
  }
  return mesa;
}

async function assertAvailability(data, ignoredId) {
  const conflict = await prisma.reserva.findFirst({
    where: {
      mesaId: data.mesaId,
      fecha: data.fecha,
      estado: { in: activeStates },
      ...(ignoredId ? { NOT: { id: ignoredId } } : {}),
    },
  });
  if (conflict) {
    throw httpError(409, "La mesa seleccionada ya está reservada para ese horario");
  }
}

async function create(data) {
  await assertReferences(data);
  await assertAvailability(data);
  return prisma.reserva.create({
    data,
    include: { cliente: true, mesa: true },
  });
}

async function update(id, data) {
  const reservationId = idParam(id);
  await getById(reservationId);
  await assertReferences(data);
  await assertAvailability(data, reservationId);
  return prisma.reserva.update({
    where: { id: reservationId },
    data,
    include: { cliente: true, mesa: true },
  });
}

async function remove(id) {
  await getById(id);
  return prisma.reserva.delete({ where: { id: idParam(id) } });
}

module.exports = { list, getById, create, update, remove };
