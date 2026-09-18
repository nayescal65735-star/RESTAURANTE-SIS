const { httpError } = require("../lib/errors");
const { requiredString } = require("./common");

function validateClientInput(body) {
  const nombre = requiredString(body.nombre, "El nombre");
  const telefono = requiredString(body.telefono, "El teléfono");
  const email = requiredString(body.email, "El email").toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError(400, "El email no es válido");
  }

  if (!/^[0-9+()\s-]{7,20}$/.test(telefono)) {
    throw httpError(400, "El teléfono no es válido");
  }

  return { nombre, telefono, email };
}

module.exports = { validateClientInput };
