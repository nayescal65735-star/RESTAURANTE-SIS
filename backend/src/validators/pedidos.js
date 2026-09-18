const { httpError } = require("../lib/errors");
const { optionalId, positiveInteger, idParam } = require("./common");

function validateOrderInput(body) {
  if (!Array.isArray(body.detalles) || body.detalles.length === 0) {
    throw httpError(400, "El pedido debe contener al menos un plato");
  }

  const detalles = body.detalles.map((detalle, index) => ({
    platoId: idParam(detalle.platoId, `detalles[${index}].platoId`),
    cantidad: positiveInteger(detalle.cantidad, `detalles[${index}].cantidad`),
  }));

  return {
    mesaId: optionalId(body.mesaId, "mesaId"),
    clienteId: optionalId(body.clienteId, "clienteId"),
    usuarioId: optionalId(body.usuarioId, "usuarioId"),
    observacion: body.observacion ? String(body.observacion).trim() : null,
    detalles,
  };
}

module.exports = { validateOrderInput };
