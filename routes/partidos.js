const express = require('express');
const router = express.Router();
const {
  obtenerPartidos,
  obtenerPartido,
  crearPartido,
  actualizarResultado,
  agregarGol,
  agregarAsistencia,
  actualizarEstado,
  eliminarPartido
} = require('../controllers/partidoController');

// Rutas para partidos
router.route('/')
  .get(obtenerPartidos)
  .post(crearPartido);

router.route('/:id')
  .get(obtenerPartido)
  .delete(eliminarPartido);

router.route('/:id/resultado')
  .put(actualizarResultado);

router.route('/:id/estado')
  .put(actualizarEstado);

router.route('/:id/goles')
  .post(agregarGol);

router.route('/:id/asistencias')
  .post(agregarAsistencia);

module.exports = router; 