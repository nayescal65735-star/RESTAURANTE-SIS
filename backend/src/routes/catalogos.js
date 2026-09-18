const express = require("express");
const asyncHandler = require("../middlewares/async-handler");
const controller = require("../controllers/catalogos");

const router = express.Router();
router.get("/mesas", asyncHandler(controller.mesas));
router.get("/platos", asyncHandler(controller.platos));

module.exports = router;
