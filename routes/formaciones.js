const express = require('express');
const router = express.Router();
const {
  obtenerFormaciones,
  obtenerFormacion,
  crearFormacion,
  actualizarFormacion,
  eliminarFormacion,
  agregarJugador,
  removerJugador,
  actualizarPosicionJugador,
  obtenerJugadoresDisponibles
} = require('../controllers/formacionController');

const {
  crearPartidoConEstadisticas,
  actualizarPartidoConEstadisticas,
  calificarJugador,
  realizarSustitucion
} = require('../controllers/partidoExtendedController');

// Rutas para formaciones/partidos
router.route('/')
  .get(obtenerFormaciones)
  .post(crearPartidoConEstadisticas);

router.route('/jugadores-disponibles')
  .get(obtenerJugadoresDisponibles);

router.route('/:id')
  .get(obtenerFormacion)
  .put(actualizarPartidoConEstadisticas)
  .delete(eliminarFormacion);

// Rutas para jugadores en formaciones
router.route('/:id/jugadores')
  .post(agregarJugador);

router.route('/:id/jugadores/:jugadorId')
  .delete(removerJugador);

router.route('/:id/jugadores/:jugadorId/posicion')
  .put(actualizarPosicionJugador);

// Rutas específicas de partido
router.route('/:id/calificar')
  .post(calificarJugador);

router.route('/:id/sustitucion')
  .post(realizarSustitucion);

module.exports = router; 