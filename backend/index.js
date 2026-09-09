const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API RESTAURANTE-SIS funcionando",
    status: "ok"
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "backend"
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend RESTAURANTE-SIS ejecutándose en el puerto ${PORT}`);
});
