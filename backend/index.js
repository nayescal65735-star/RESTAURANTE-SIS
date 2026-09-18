const express = require("express");
const cors = require("cors");
require("dotenv").config();

const prisma = require("./src/lib/prisma");
const asyncHandler = require("./src/middlewares/async-handler");
const errorHandler = require("./src/middlewares/error-handler");
const clientesRoutes = require("./src/routes/clientes");
const reservasRoutes = require("./src/routes/reservas");
const pedidosRoutes = require("./src/routes/pedidos");
const catalogosRoutes = require("./src/routes/catalogos");

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5174",
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API RESTAURANTE-SIS funcionando", status: "ok" });
});

app.get("/health", asyncHandler(async (req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ status: "ok", service: "backend", database: "ok" });
}));

app.use("/api/clientes", clientesRoutes);
app.use("/api/reservas", reservasRoutes);
app.use("/api/pedidos", pedidosRoutes);
app.use("/api", catalogosRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend RESTAURANTE-SIS ejecutándose en el puerto ${PORT}`);
  });
}

module.exports = app;
