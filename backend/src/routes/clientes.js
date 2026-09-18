const express = require("express");
const asyncHandler = require("../middlewares/async-handler");
const controller = require("../controllers/clientes");

const router = express.Router();
router.get("/", asyncHandler(controller.list));
router.get("/:id", asyncHandler(controller.getById));
router.post("/", asyncHandler(controller.create));
router.put("/:id", asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.remove));

module.exports = router;
