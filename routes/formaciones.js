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

// Rutas para formaciones
router.route('/')
  .get(obtenerFormaciones)
  .post(crearFormacion);

router.route('/jugadores-disponibles')
  .get(obtenerJugadoresDisponibles);

router.route('/:id')
  .get(obtenerFormacion)
  .put(actualizarFormacion)
  .delete(eliminarFormacion);

// Rutas para jugadores en formaciones
router.route('/:id/jugadores')
  .post(agregarJugador);

router.route('/:id/jugadores/:jugadorId')
  .delete(removerJugador);

router.route('/:id/jugadores/:jugadorId/posicion')
  .put(actualizarPosicionJugador);

module.exports = router; 