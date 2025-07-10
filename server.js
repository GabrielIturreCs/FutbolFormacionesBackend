require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const path = require('path');

// Conectar a la base de datos
connectDB();

const app = express();

// Permitir que Express confíe en el proxy de Render para obtener la IP real del usuario
app.set('trust proxy', 1);

// CORS seguro y flexible para producción y desarrollo
const allowedOrigins = [
  'https://futbolformacionesfrontend.onrender.com',
  'http://localhost:4200'
];
app.use(require('cors')({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Middleware de seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: {
    success: false,
    error: 'Demasiadas requests desde esta IP, intenta de nuevo en 15 minutos'
  }
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rutas
app.use('/api/jugadores', require('./routes/jugadores'));
app.use('/api/partidos', require('./routes/partidos'));
app.use('/api/formaciones', require('./routes/formaciones'));

// CORS para imágenes en /uploads
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://futbolformacionesfrontend.onrender.com');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Servir archivos estáticos del build de Angular
app.use(express.static(path.join(__dirname, '../dist/futbol-equipos-app')));

// Redirección para rutas de SPA (Angular)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/futbol-equipos-app/index.html'));
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '⚽ API de Fútbol Formaciones - Backend funcionando correctamente',
    version: '1.0.0',
    endpoints: {
      jugadores: '/api/jugadores',
      partidos: '/api/partidos',
      formaciones: '/api/formaciones',
      topGoleadores: '/api/jugadores/top-goleadores'
    }
  });
});

// Ruta para verificar estado de la API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`⚽ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 API disponible en: http://localhost:${PORT}`);
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;