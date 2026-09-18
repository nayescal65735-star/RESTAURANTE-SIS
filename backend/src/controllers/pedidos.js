const service = require("../services/pedidos");
const { validateOrderInput } = require("../validators/pedidos");

async function list(req, res) {
  res.json(await service.list());
}

async function getById(req, res) {
  res.json(await service.getById(req.params.id));
}

async function create(req, res) {
  res.status(201).json(await service.create(validateOrderInput(req.body)));
}

async function update(req, res) {
  const { estado } = req.body;
  res.json(await service.updateStatus(req.params.id, estado));
}

module.exports = { list, getById, create, update };
