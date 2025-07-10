const express = require('express');
const jugadorController = require('../controllers/jugadorController');

const router = express.Router();
const {
  obtenerJugadores,
  obtenerJugadoresPorEquipo,
  obtenerTopGoleadores,
  crearJugador,
  actualizarJugador,
  eliminarJugador,
  agregarGoles,
  agregarAsistencias
} = require('../controllers/jugadorController');

// Rutas para jugadores
router.route('/')
  .get(obtenerJugadores)
  .post(crearJugador);

router.route('/equipo/:equipo')
  .get(obtenerJugadoresPorEquipo);

router.route('/top-goleadores')
  .get(obtenerTopGoleadores);

router.route('/:id')
  .put(actualizarJugador)
  .delete(eliminarJugador);

router.route('/:id/goles')
  .put(agregarGoles);

router.route('/:id/asistencias')
  .put(agregarAsistencias);

// Ruta para subir foto de jugador
router.post('/upload-foto', jugadorController.uploadFotoJugador);

module.exports = router; 