const prisma = require("../lib/prisma");

async function mesas() {
  return prisma.mesa.findMany({ orderBy: { numero: "asc" } });
}

async function platos() {
  return prisma.plato.findMany({
    where: { disponible: true },
    include: { categoria: true },
    orderBy: { nombre: "asc" },
  });
}

module.exports = { mesas, platos };
