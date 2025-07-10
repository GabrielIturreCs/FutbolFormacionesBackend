const Partido = require('../models/Partido');
const Jugador = require('../models/Jugador');

// @desc    Obtener todos los partidos
// @route   GET /api/partidos
// @access  Public
const obtenerPartidos = async (req, res) => {
  try {
    const { estado, limit = 20 } = req.query;
    
    let query = {};
    if (estado) {
      query.estado = estado;
    }

    const partidos = await Partido.find(query)
      .populate('formacionLocal.jugadores.jugadorId', 'nombre numero')
      .populate('formacionVisitante.jugadores.jugadorId', 'nombre numero')
      .populate('golesDetalle.jugadorId', 'nombre numero')
      .populate('asistenciasDetalle.jugadorId', 'nombre numero')
      .sort({ fecha: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: partidos.length,
      data: partidos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Obtener partido por ID
// @route   GET /api/partidos/:id
// @access  Public
const obtenerPartido = async (req, res) => {
  try {
    const { id } = req.params;

    const partido = await Partido.findById(id)
      .populate('formacionLocal.jugadores.jugadorId', 'nombre numero equipo')
      .populate('formacionVisitante.jugadores.jugadorId', 'nombre numero equipo')
      .populate('golesDetalle.jugadorId', 'nombre numero equipo')
      .populate('asistenciasDetalle.jugadorId', 'nombre numero equipo');

    if (!partido) {
      return res.status(404).json({
        success: false,
        error: 'Partido no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: partido
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Crear nuevo partido
// @route   POST /api/partidos
// @access  Public
const crearPartido = async (req, res) => {
  try {
    const { 
      nombreEquipoLocal, 
      nombreEquipoVisitante, 
      formacionLocal, 
      formacionVisitante 
    } = req.body;

    const partido = await Partido.create({
      nombreEquipoLocal,
      nombreEquipoVisitante,
      formacionLocal,
      formacionVisitante
    });

    const partidoPopulado = await Partido.findById(partido._id)
      .populate('formacionLocal.jugadores.jugadorId', 'nombre numero equipo')
      .populate('formacionVisitante.jugadores.jugadorId', 'nombre numero equipo');

    res.status(201).json({
      success: true,
      data: partidoPopulado
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: mensajes.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Actualizar resultado del partido
// @route   PUT /api/partidos/:id/resultado
// @access  Public
const actualizarResultado = async (req, res) => {
  try {
    const { id } = req.params;
    const { golesLocal, golesVisitante } = req.body;

    const partido = await Partido.findById(id);

    if (!partido) {
      return res.status(404).json({
        success: false,
        error: 'Partido no encontrado'
      });
    }

    await partido.actualizarResultado(golesLocal, golesVisitante);

    res.status(200).json({
      success: true,
      data: partido
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Agregar gol al partido
// @route   POST /api/partidos/:id/goles
// @access  Public
const agregarGol = async (req, res) => {
  try {
    const { id } = req.params;
    const { jugadorId, minuto, tipo = 'gol' } = req.body;

    const partido = await Partido.findById(id);
    const jugador = await Jugador.findById(jugadorId);

    if (!partido) {
      return res.status(404).json({
        success: false,
        error: 'Partido no encontrado'
      });
    }

    if (!jugador) {
      return res.status(404).json({
        success: false,
        error: 'Jugador no encontrado'
      });
    }

    // Agregar gol al partido
    await partido.agregarGol(jugadorId, minuto, tipo);

    // Actualizar goles del jugador
    await jugador.agregarGoles(1);

    const partidoActualizado = await Partido.findById(id)
      .populate('golesDetalle.jugadorId', 'nombre numero equipo');

    res.status(200).json({
      success: true,
      data: partidoActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Agregar asistencia al partido
// @route   POST /api/partidos/:id/asistencias
// @access  Public
const agregarAsistencia = async (req, res) => {
  try {
    const { id } = req.params;
    const { jugadorId, minuto } = req.body;

    const partido = await Partido.findById(id);
    const jugador = await Jugador.findById(jugadorId);

    if (!partido) {
      return res.status(404).json({
        success: false,
        error: 'Partido no encontrado'
      });
    }

    if (!jugador) {
      return res.status(404).json({
        success: false,
        error: 'Jugador no encontrado'
      });
    }

    // Agregar asistencia al partido
    await partido.agregarAsistencia(jugadorId, minuto);

    // Actualizar asistencias del jugador
    await jugador.agregarAsistencias(1);

    const partidoActualizado = await Partido.findById(id)
      .populate('asistenciasDetalle.jugadorId', 'nombre numero equipo');

    res.status(200).json({
      success: true,
      data: partidoActualizado
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Actualizar estado del partido
// @route   PUT /api/partidos/:id/estado
// @access  Public
const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['programado', 'en_curso', 'finalizado', 'cancelado'].includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido'
      });
    }

    const partido = await Partido.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    );

    if (!partido) {
      return res.status(404).json({
        success: false,
        error: 'Partido no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: partido
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Eliminar partido
// @route   DELETE /api/partidos/:id
// @access  Public
const eliminarPartido = async (req, res) => {
  try {
    const { id } = req.params;

    const partido = await Partido.findByIdAndDelete(id);

    if (!partido) {
      return res.status(404).json({
        success: false,
        error: 'Partido no encontrado'
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

module.exports = {
  obtenerPartidos,
  obtenerPartido,
  crearPartido,
  actualizarResultado,
  agregarGol,
  agregarAsistencia,
  actualizarEstado,
  eliminarPartido
}; 