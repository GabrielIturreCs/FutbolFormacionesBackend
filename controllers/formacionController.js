const Formacion = require('../models/Formacion');
const Jugador = require('../models/Jugador');

// @desc    Obtener todas las formaciones
// @route   GET /api/formaciones
// @access  Public
const obtenerFormaciones = async (req, res) => {
  try {
    const { activa, limit = 20, page = 1 } = req.query;
    
    let query = {};
    if (activa !== undefined) {
      query.activa = activa === 'true';
    }

    const formaciones = await Formacion.find(query)
      .populate('equipos.local.jugadores.jugadorId', 'nombre numero goles asistencias')
      .populate('equipos.visitante.jugadores.jugadorId', 'nombre numero goles asistencias')
      .sort({ fecha: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Formacion.countDocuments(query);

    res.status(200).json({
      success: true,
      count: formaciones.length,
      total,
      data: formaciones
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Obtener formación por ID
// @route   GET /api/formaciones/:id
// @access  Public
const obtenerFormacion = async (req, res) => {
  try {
    const formacion = await Formacion.findById(req.params.id)
      .populate('equipos.local.jugadores.jugadorId', 'nombre numero goles asistencias equipo')
      .populate('equipos.visitante.jugadores.jugadorId', 'nombre numero goles asistencias equipo');

    if (!formacion) {
      return res.status(404).json({
        success: false,
        error: 'Formación no encontrada'
      });
    }

    // Obtener estadísticas
    const estadisticas = await formacion.obtenerEstadisticas();

    res.status(200).json({
      success: true,
      data: {
        formacion,
        estadisticas
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Crear nueva formación
// @route   POST /api/formaciones
// @access  Public
const crearFormacion = async (req, res) => {
  try {
    const { nombre, descripcion, equipos } = req.body;

    if (!nombre || !equipos || !equipos.local || !equipos.visitante) {
      return res.status(400).json({
        success: false,
        error: 'Nombre y equipos son obligatorios'
      });
    }

    const formacion = await Formacion.create({
      nombre,
      descripcion,
      equipos,
      fecha: new Date()
    });

    const formacionPopulada = await Formacion.findById(formacion._id)
      .populate('equipos.local.jugadores.jugadorId', 'nombre numero goles asistencias')
      .populate('equipos.visitante.jugadores.jugadorId', 'nombre numero goles asistencias');

    res.status(201).json({
      success: true,
      data: formacionPopulada
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Actualizar formación
// @route   PUT /api/formaciones/:id
// @access  Public
const actualizarFormacion = async (req, res) => {
  try {
    const formacion = await Formacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('equipos.local.jugadores.jugadorId', 'nombre numero goles asistencias')
    .populate('equipos.visitante.jugadores.jugadorId', 'nombre numero goles asistencias');

    if (!formacion) {
      return res.status(404).json({
        success: false,
        error: 'Formación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: formacion
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Eliminar formación
// @route   DELETE /api/formaciones/:id
// @access  Public
const eliminarFormacion = async (req, res) => {
  try {
    const formacion = await Formacion.findByIdAndDelete(req.params.id);

    if (!formacion) {
      return res.status(404).json({
        success: false,
        error: 'Formación no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Agregar jugador a formación
// @route   POST /api/formaciones/:id/jugadores
// @access  Public
const agregarJugador = async (req, res) => {
  try {
    const { equipoTipo, jugadorId, posicion, numero } = req.body;

    if (!equipoTipo || !jugadorId || !posicion) {
      return res.status(400).json({
        success: false,
        error: 'Equipo, jugador y posición son obligatorios'
      });
    }

    const formacion = await Formacion.findById(req.params.id);
    if (!formacion) {
      return res.status(404).json({
        success: false,
        error: 'Formación no encontrada'
      });
    }

    await formacion.agregarJugador(equipoTipo, jugadorId, posicion, numero);

    const formacionActualizada = await Formacion.findById(req.params.id)
      .populate('equipos.local.jugadores.jugadorId', 'nombre numero goles asistencias')
      .populate('equipos.visitante.jugadores.jugadorId', 'nombre numero goles asistencias');

    res.status(200).json({
      success: true,
      data: formacionActualizada
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error del servidor'
    });
  }
};

// @desc    Remover jugador de formación
// @route   DELETE /api/formaciones/:id/jugadores/:jugadorId
// @access  Public
const removerJugador = async (req, res) => {
  try {
    const { equipoTipo } = req.query;
    const { jugadorId } = req.params;

    if (!equipoTipo) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de equipo es obligatorio'
      });
    }

    const formacion = await Formacion.findById(req.params.id);
    if (!formacion) {
      return res.status(404).json({
        success: false,
        error: 'Formación no encontrada'
      });
    }

    await formacion.removerJugador(equipoTipo, jugadorId);

    const formacionActualizada = await Formacion.findById(req.params.id)
      .populate('equipos.local.jugadores.jugadorId', 'nombre numero goles asistencias')
      .populate('equipos.visitante.jugadores.jugadorId', 'nombre numero goles asistencias');

    res.status(200).json({
      success: true,
      data: formacionActualizada
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error del servidor'
    });
  }
};

// @desc    Actualizar posición de jugador
// @route   PUT /api/formaciones/:id/jugadores/:jugadorId/posicion
// @access  Public
const actualizarPosicionJugador = async (req, res) => {
  try {
    const { equipoTipo, posicion } = req.body;

    if (!equipoTipo || !posicion) {
      return res.status(400).json({
        success: false,
        error: 'Equipo y posición son obligatorios'
      });
    }

    const formacion = await Formacion.findById(req.params.id);
    if (!formacion) {
      return res.status(404).json({
        success: false,
        error: 'Formación no encontrada'
      });
    }

    await formacion.actualizarPosicionJugador(equipoTipo, req.params.jugadorId, posicion);

    const formacionActualizada = await Formacion.findById(req.params.id)
      .populate('equipos.local.jugadores.jugadorId', 'nombre numero goles asistencias')
      .populate('equipos.visitante.jugadores.jugadorId', 'nombre numero goles asistencias');

    res.status(200).json({
      success: true,
      data: formacionActualizada
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error del servidor'
    });
  }
};

// @desc    Obtener jugadores disponibles para formación
// @route   GET /api/formaciones/jugadores-disponibles
// @access  Public
const obtenerJugadoresDisponibles = async (req, res) => {
  try {
    const jugadores = await Jugador.find({ activo: true })
      .select('nombre numero equipo goles asistencias')
      .sort({ nombre: 1 });

    res.status(200).json({
      success: true,
      count: jugadores.length,
      data: jugadores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

module.exports = {
  obtenerFormaciones,
  obtenerFormacion,
  crearFormacion,
  actualizarFormacion,
  eliminarFormacion,
  agregarJugador,
  removerJugador,
  actualizarPosicionJugador,
  obtenerJugadoresDisponibles
}; 