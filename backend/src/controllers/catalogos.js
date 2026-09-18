const service = require("../services/catalogos");

async function mesas(req, res) {
  res.json(await service.mesas());
}

async function platos(req, res) {
  res.json(await service.platos());
}

module.exports = { mesas, platos };
