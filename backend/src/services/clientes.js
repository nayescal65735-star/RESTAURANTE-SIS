const prisma = require("../lib/prisma");
const { httpError } = require("../lib/errors");
const { idParam } = require("../validators/common");

async function list() {
  return prisma.cliente.findMany({ orderBy: { createdAt: "desc" } });
}

async function getById(id) {
  const cliente = await prisma.cliente.findUnique({ where: { id: idParam(id) } });
  if (!cliente) throw httpError(404, "Cliente no encontrado");
  return cliente;
}

async function create(data) {
  const duplicate = await prisma.cliente.findFirst({ where: { email: data.email } });
  if (duplicate) throw httpError(409, "Ya existe un cliente con ese email");
  return prisma.cliente.create({ data });
}

async function update(id, data) {
  await getById(id);
  const duplicate = await prisma.cliente.findFirst({
    where: { email: data.email, NOT: { id: idParam(id) } },
  });
  if (duplicate) throw httpError(409, "Ya existe un cliente con ese email");
  return prisma.cliente.update({ where: { id: idParam(id) }, data });
}

async function remove(id) {
  await getById(id);
  const [reservas, pedidos, ventas] = await Promise.all([
    prisma.reserva.count({ where: { clienteId: idParam(id) } }),
    prisma.pedido.count({ where: { clienteId: idParam(id) } }),
    prisma.venta.count({ where: { clienteId: idParam(id) } }),
  ]);
  if (reservas || pedidos || ventas) {
    throw httpError(409, "No se puede eliminar un cliente con registros relacionados");
  }
  return prisma.cliente.delete({ where: { id: idParam(id) } });
}

module.exports = { list, getById, create, update, remove };
