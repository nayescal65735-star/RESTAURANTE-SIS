const { httpError } = require("../lib/errors");

function requiredString(value, field) {
  if (typeof value !== "string" || value.trim() === "") {
    throw httpError(400, `${field} es obligatorio`);
  }
  return value.trim();
}

function positiveInteger(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw httpError(400, `${field} debe ser un entero positivo`);
  }
  return number;
}

function idParam(value, field = "id") {
  return positiveInteger(value, field);
}

function optionalId(value, field) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return positiveInteger(value, field);
}

module.exports = { requiredString, positiveInteger, idParam, optionalId };
