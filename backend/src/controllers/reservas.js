const service = require("../services/reservas");
const { validateReservationInput } = require("../validators/reservas");

async function list(req, res) {
  res.json(await service.list());
}

async function getById(req, res) {
  res.json(await service.getById(req.params.id));
}

async function create(req, res) {
  res.status(201).json(await service.create(validateReservationInput(req.body)));
}

async function update(req, res) {
  res.json(await service.update(req.params.id, validateReservationInput(req.body)));
}

async function remove(req, res) {
  await service.remove(req.params.id);
  res.status(204).send();
}

module.exports = { list, getById, create, update, remove };
