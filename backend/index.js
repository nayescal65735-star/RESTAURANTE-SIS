const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());

// Logging middleware simple para desarrollo
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Root & Healthcheck
app.get('/', (req, res) => {
  res.json({
    message: 'API RESTAURANTE-SIS funcionando',
    status: 'ok',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
  });
});

// Rutas de la API REST
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/dashboard', require('./src/routes/dashboard.routes'));
app.use('/api/usuarios', require('./src/routes/usuarios.routes'));
app.use('/api/clientes', require('./src/routes/clientes.routes'));
app.use('/api/mesas', require('./src/routes/mesas.routes'));
app.use('/api/categorias', require('./src/routes/categorias.routes'));
app.use('/api/platos', require('./src/routes/platos.routes'));
app.use('/api/pedidos', require('./src/routes/pedidos.routes'));
app.use('/api/ventas', require('./src/routes/ventas.routes'));
app.use('/api/reservas', require('./src/routes/reservas.routes'));
app.use('/api/inventario', require('./src/routes/inventario.routes'));
app.use('/api/proveedores', require('./src/routes/proveedores.routes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Error handling middleware global
app.use((err, req, res, next) => {
  console.error('Error en API:', err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Error interno del servidor',
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Backend RESTAURANTE-SIS ejecutándose en http://0.0.0.0:${PORT}`);
});
