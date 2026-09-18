const { httpError } = require("../lib/errors");
const { idParam, positiveInteger, requiredString } = require("./common");

function parseReservationDate(body) {
  if (body.fecha && body.hora) {
    const fecha = requiredString(body.fecha, "La fecha");
    const hora = requiredString(body.hora, "La hora");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || !/^\d{2}:\d{2}$/.test(hora)) {
      throw httpError(400, "La fecha o la hora no tienen un formato válido");
    }
    const date = new Date(`${fecha}T${hora}:00`);
    if (Number.isNaN(date.getTime())) {
      throw httpError(400, "La fecha o la hora no son válidas");
    }
    return date;
  }

  if (body.fecha) {
    const date = new Date(body.fecha);
    if (Number.isNaN(date.getTime())) {
      throw httpError(400, "La fecha no es válida");
    }
    return date;
  }

  throw httpError(400, "La fecha y la hora son obligatorias");
}

function validateReservationInput(body) {
  return {
    clienteId: idParam(body.clienteId, "clienteId"),
    mesaId: idParam(body.mesaId, "mesaId"),
    fecha: parseReservationDate(body),
    cantidad: positiveInteger(body.cantidad, "La cantidad de personas"),
    observacion: body.observacion ? String(body.observacion).trim() : null,
  };
}

module.exports = { validateReservationInput };
