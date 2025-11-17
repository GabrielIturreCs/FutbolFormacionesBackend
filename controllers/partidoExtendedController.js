const Formacion = require('../models/Formacion');
const Jugador = require('../models/Jugador');

// @desc    Crear partido con estadísticas
// @route   POST /api/formaciones
// @access  Public
const crearPartidoConEstadisticas = async (req, res) => {
  try {
    const { nombre, descripcion, fecha, hora, lugar, equipos } = req.body;

    if (!nombre || !fecha || !hora || !equipos || !equipos.local || !equipos.visitante) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, fecha, hora y equipos son obligatorios'
      });
    }

    // Crear el partido
    const partido = await Formacion.create({
      nombre,
      descripcion,
      fecha,
      hora,
      lugar,
      equipos,
      estado: 'finalizado' // Asumimos que el partido ya se jugó si tiene estadísticas
    });

    // Si el partido tiene estadísticas de jugadores, actualizar los totales de cada jugador
    if (equipos.local && equipos.local.jugadores) {
      for (const jugadorPartido of equipos.local.jugadores) {
        if (jugadorPartido.estadisticas && jugadorPartido.jugadorId) {
          await actualizarEstadisticasJugador(
            jugadorPartido.jugadorId,
            jugadorPartido.estadisticas
          );
        }
      }
    }

    if (equipos.visitante && equipos.visitante.jugadores) {
      for (const jugadorPartido of equipos.visitante.jugadores) {
        if (jugadorPartido.estadisticas && jugadorPartido.jugadorId) {
          await actualizarEstadisticasJugador(
            jugadorPartido.jugadorId,
            jugadorPartido.estadisticas
          );
        }
      }
    }

    const partidoPopulado = await Formacion.findById(partido._id)
      .populate('equipos.local.jugadores.jugadorId', 'nombre numero goles asistencias tarjetasAmarillas tarjetasRojas equipo fotoUrl')
      .populate('equipos.visitante.jugadores.jugadorId', 'nombre numero goles asistencias tarjetasAmarillas tarjetasRojas equipo fotoUrl');

    res.status(201).json({
      success: true,
      data: partidoPopulado
    });
  } catch (error) {
    console.error('Error creando partido:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor al crear partido',
      details: error.message
    });
  }
};

// @desc    Actualizar partido con estadísticas
// @route   PUT /api/formaciones/:id
// @access  Public
const actualizarPartidoConEstadisticas = async (req, res) => {
  try {
    const partidoAnterior = await Formacion.findById(req.params.id);
    
    if (!partidoAnterior) {
      return res.status(404).json({
        success: false,
        error: 'Partido no encontrado'
      });
    }

    // Actualizar el partido
    const partido = await Formacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Actualizar estadísticas de jugadores si hay cambios
    const { equipos } = req.body;
    
    if (equipos && equipos.local && equipos.local.jugadores) {
      for (const jugadorPartido of equipos.local.jugadores) {
        if (jugadorPartido.estadisticas && jugadorPartido.jugadorId) {
          // Encontrar las estadísticas anteriores
          const jugadorAnterior = partidoAnterior.equipos.local.jugadores.find(
            j => j.jugadorId.toString() === jugadorPartido.jugadorId.toString()
          );
          
          // Calcular la diferencia
          const diferencia = calcularDiferenciaEstadisticas(
            jugadorAnterior?.estadisticas,
            jugadorPartido.estadisticas
          );
          
          // Solo actualizar si hay diferencia
          if (tieneDiferencia(diferencia)) {
            await actualizarEstadisticasJugador(jugadorPartido.jugadorId, diferencia);
          }
        }
      }
    }

    if (equipos && equipos.visitante && equipos.visitante.jugadores) {
      for (const jugadorPartido of equipos.visitante.jugadores) {
        if (jugadorPartido.estadisticas && jugadorPartido.jugadorId) {
          const jugadorAnterior = partidoAnterior.equipos.visitante.jugadores.find(
            j => j.jugadorId.toString() === jugadorPartido.jugadorId.toString()
          );
          
          const diferencia = calcularDiferenciaEstadisticas(
            jugadorAnterior?.estadisticas,
            jugadorPartido.estadisticas
          );
          
          if (tieneDiferencia(diferencia)) {
            await actualizarEstadisticasJugador(jugadorPartido.jugadorId, diferencia);
          }
        }
      }
    }

    const partidoPopulado = await Formacion.findById(partido._id)
      .populate('equipos.local.jugadores.jugadorId', 'nombre numero goles asistencias tarjetasAmarillas tarjetasRojas equipo fotoUrl')
      .populate('equipos.visitante.jugadores.jugadorId', 'nombre numero goles asistencias tarjetasAmarillas tarjetasRojas equipo fotoUrl');

    res.status(200).json({
      success: true,
      data: partidoPopulado
    });
  } catch (error) {
    console.error('Error actualizando partido:', error);
    res.status(500).json({
      success: false,
      error: 'Error del servidor al actualizar partido',
      details: error.message
    });
  }
};

// Función auxiliar para actualizar estadísticas del jugador
async function actualizarEstadisticasJugador(jugadorId, estadisticas) {
  try {
    const jugador = await Jugador.findById(jugadorId);
    
    if (!jugador) {
      console.error(`Jugador ${jugadorId} no encontrado`);
      return;
    }

    // Sumar las estadísticas del partido a los totales del jugador
    jugador.goles = (jugador.goles || 0) + (estadisticas.goles || 0);
    jugador.asistencias = (jugador.asistencias || 0) + (estadisticas.asistencias || 0);
    jugador.tarjetasAmarillas = (jugador.tarjetasAmarillas || 0) + (estadisticas.tarjetasAmarillas || 0);
    jugador.tarjetasRojas = (jugador.tarjetasRojas || 0) + (estadisticas.tarjetasRojas || 0);
    jugador.partidosJugados = (jugador.partidosJugados || 0) + 1;

    await jugador.save();
    console.log(`Estadísticas actualizadas para jugador ${jugador.nombre}: +1 partido jugado`);
  } catch (error) {
    console.error('Error actualizando estadísticas del jugador:', error);
    throw error;
  }
}

// Función auxiliar para calcular diferencia entre estadísticas
function calcularDiferenciaEstadisticas(anterior, actual) {
  const estadisticasAnteriores = anterior || {
    goles: 0,
    asistencias: 0,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0
  };
  
  const estadisticasActuales = actual || {
    goles: 0,
    asistencias: 0,
    tarjetasAmarillas: 0,
    tarjetasRojas: 0
  };
  
  return {
    goles: (estadisticasActuales.goles || 0) - (estadisticasAnteriores.goles || 0),
    asistencias: (estadisticasActuales.asistencias || 0) - (estadisticasAnteriores.asistencias || 0),
    tarjetasAmarillas: (estadisticasActuales.tarjetasAmarillas || 0) - (estadisticasAnteriores.tarjetasAmarillas || 0),
    tarjetasRojas: (estadisticasActuales.tarjetasRojas || 0) - (estadisticasAnteriores.tarjetasRojas || 0)
  };
}

// Función auxiliar para verificar si hay diferencia
function tieneDiferencia(diferencia) {
  return diferencia.goles !== 0 ||
         diferencia.asistencias !== 0 ||
         diferencia.tarjetasAmarillas !== 0 ||
         diferencia.tarjetasRojas !== 0;
}

// @desc    Agregar calificación a jugador en partido
// @route   POST /api/formaciones/:id/calificar
// @access  Public
const calificarJugador = async (req, res) => {
  try {
    const { equipoTipo, jugadorId, usuarioId, usuarioNombre, puntuacion } = req.body;

    if (!equipoTipo || !jugadorId || !usuarioId || !usuarioNombre || !puntuacion) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son obligatorios'
      });
    }

    if (puntuacion < 1 || puntuacion > 10) {
      return res.status(400).json({
        success: false,
        error: 'La puntuación debe estar entre 1 y 10'
      });
    }

    const partido = await Formacion.findById(req.params.id);
    
    if (!partido) {
      return res.status(404).json({
        success: false,
        error: 'Partido no encontrado'
      });
    }

    await partido.agregarCalificacion(equipoTipo, jugadorId, usuarioId, usuarioNombre, puntuacion);
    
    // Recalcular MVP
    await partido.calcularMVP();

    const partidoActualizado = await Formacion.findById(req.params.id)
      .populate('equipos.local.jugadores.jugadorId', 'nombre numero equipo fotoUrl')
      .populate('equipos.visitante.jugadores.jugadorId', 'nombre numero equipo fotoUrl')
      .populate('mvp.jugadorId', 'nombre numero equipo fotoUrl');

    res.status(200).json({
      success: true,
      data: partidoActualizado
    });
  } catch (error) {
    console.error('Error calificando jugador:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error del servidor'
    });
  }
};

// @desc    Realizar sustitución en partido
// @route   POST /api/formaciones/:id/sustitucion
// @access  Public
const realizarSustitucion = async (req, res) => {
  try {
    const { equipoTipo, jugadorSaleId, jugadorEntraId, minuto, motivo } = req.body;

    if (!equipoTipo || !jugadorSaleId || !jugadorEntraId || minuto === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Equipo, jugadores y minuto son obligatorios'
      });
    }

    const partido = await Formacion.findById(req.params.id);
    
    if (!partido) {
      return res.status(404).json({
        success: false,
        error: 'Partido no encontrado'
      });
    }

    await partido.realizarSustitucion(equipoTipo, jugadorSaleId, jugadorEntraId, minuto, motivo);

    const partidoActualizado = await Formacion.findById(req.params.id)
      .populate('equipos.local.jugadores.jugadorId', 'nombre numero equipo fotoUrl')
      .populate('equipos.visitante.jugadores.jugadorId', 'nombre numero equipo fotoUrl');

    res.status(200).json({
      success: true,
      data: partidoActualizado
    });
  } catch (error) {
    console.error('Error realizando sustitución:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error del servidor'
    });
  }
};

module.exports = {
  crearPartidoConEstadisticas,
  actualizarPartidoConEstadisticas,
  calificarJugador,
  realizarSustitucion
};
