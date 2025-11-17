const mongoose = require('mongoose');

// Schema para calificaciones de usuarios
const calificacionSchema = new mongoose.Schema({
  usuarioId: {
    type: String,
    required: true
  },
  usuarioNombre: {
    type: String,
    required: true,
    trim: true
  },
  puntuacion: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  fecha: {
    type: Date,
    default: Date.now
  }
});

// Schema para estadísticas del jugador en el partido
const estadisticasPartidoSchema = new mongoose.Schema({
  goles: {
    type: Number,
    default: 0,
    min: 0
  },
  asistencias: {
    type: Number,
    default: 0,
    min: 0
  },
  tarjetasAmarillas: {
    type: Number,
    default: 0,
    min: 0,
    max: 2
  },
  tarjetasRojas: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  minutosJugados: {
    type: Number,
    default: 0,
    min: 0,
    max: 120
  }
});

// Schema para sustituciones
const sustitucionSchema = new mongoose.Schema({
  jugadorSale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador',
    required: true
  },
  jugadorEntra: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador',
    required: true
  },
  minuto: {
    type: Number,
    required: true,
    min: 0,
    max: 120
  },
  motivo: {
    type: String,
    trim: true,
    maxlength: [100, 'El motivo no puede tener más de 100 caracteres']
  }
});

// Schema para jugador en el partido (incluye calificaciones y estadísticas)
const jugadorPartidoSchema = new mongoose.Schema({
  jugadorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador',
    required: true
  },
  numero: {
    type: Number,
    min: 1,
    max: 99
  },
  posicion: {
    x: {
      type: Number,
      min: 0,
      max: 100
    },
    y: {
      type: Number,
      min: 0,
      max: 100
    }
  },
  esTitular: {
    type: Boolean,
    default: true
  },
  estadisticas: {
    type: estadisticasPartidoSchema,
    default: () => ({})
  },
  calificaciones: [calificacionSchema],
  promedioCalificacion: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  }
});

// Middleware para calcular promedio de calificaciones
jugadorPartidoSchema.pre('save', function(next) {
  if (this.calificaciones && this.calificaciones.length > 0) {
    const suma = this.calificaciones.reduce((acc, cal) => acc + cal.puntuacion, 0);
    this.promedioCalificacion = Number((suma / this.calificaciones.length).toFixed(2));
  } else {
    this.promedioCalificacion = 0;
  }
  next();
});

const equipoPartidoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del equipo es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  color: {
    type: String,
    required: [true, 'El color del equipo es obligatorio'],
    trim: true
  },
  jugadores: [jugadorPartidoSchema],
  sustitucionesRealizadas: [sustitucionSchema]
});

const formacionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del partido es obligatorio'],
    trim: true,
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha del partido es obligatoria'],
    default: Date.now
  },
  hora: {
    type: String,
    required: [true, 'La hora del partido es obligatoria'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:mm)']
  },
  lugar: {
    type: String,
    trim: true,
    maxlength: [100, 'El lugar no puede tener más de 100 caracteres']
  },
  equipos: {
    local: equipoPartidoSchema,
    visitante: equipoPartidoSchema
  },
  resultado: {
    local: {
      type: Number,
      min: 0,
      default: 0
    },
    visitante: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  mvp: {
    jugadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Jugador'
    },
    jugadorNombre: String,
    equipo: {
      type: String,
      enum: ['local', 'visitante']
    },
    promedioCalificacion: Number
  },
  estado: {
    type: String,
    enum: ['programado', 'en_curso', 'finalizado'],
    default: 'programado'
  },
  activa: {
    type: Boolean,
    default: true
  },
  creadaPor: {
    type: String,
    default: 'Sistema'
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
formacionSchema.index({ nombre: 1 });
formacionSchema.index({ fecha: -1 });
formacionSchema.index({ activa: 1 });

// Método para agregar jugador a un equipo
formacionSchema.methods.agregarJugador = function(equipoTipo, jugadorId, posicion, numero) {
  const equipo = this.equipos[equipoTipo];
  if (!equipo) {
    throw new Error(`Equipo ${equipoTipo} no encontrado`);
  }

  // Verificar si el jugador ya existe en el equipo
  const jugadorExistente = equipo.jugadores.find(j => j.jugadorId.toString() === jugadorId.toString());
  if (jugadorExistente) {
    throw new Error('El jugador ya está en este equipo');
  }

  equipo.jugadores.push({
    jugadorId,
    posicion,
    numero
  });

  return this.save();
};

// Método para remover jugador de un equipo
formacionSchema.methods.removerJugador = function(equipoTipo, jugadorId) {
  const equipo = this.equipos[equipoTipo];
  if (!equipo) {
    throw new Error(`Equipo ${equipoTipo} no encontrado`);
  }

  equipo.jugadores = equipo.jugadores.filter(j => j.jugadorId.toString() !== jugadorId.toString());
  return this.save();
};

// Método para actualizar posición de jugador
formacionSchema.methods.actualizarPosicionJugador = function(equipoTipo, jugadorId, nuevaPosicion) {
  const equipo = this.equipos[equipoTipo];
  if (!equipo) {
    throw new Error(`Equipo ${equipoTipo} no encontrado`);
  }

  const jugador = equipo.jugadores.find(j => j.jugadorId.toString() === jugadorId.toString());
  if (!jugador) {
    throw new Error('Jugador no encontrado en el equipo');
  }

  jugador.posicion = nuevaPosicion;
  return this.save();
};

// Método para obtener estadísticas de la formación
formacionSchema.methods.obtenerEstadisticas = async function() {
  const Jugador = mongoose.model('Jugador');
  
  const jugadoresLocal = await Jugador.find({
    _id: { $in: this.equipos.local.jugadores.map(j => j.jugadorId) }
  });
  
  const jugadoresVisitante = await Jugador.find({
    _id: { $in: this.equipos.visitante.jugadores.map(j => j.jugadorId) }
  });

  const totalGolesLocal = jugadoresLocal.reduce((total, jugador) => total + jugador.goles, 0);
  const totalGolesVisitante = jugadoresVisitante.reduce((total, jugador) => total + jugador.goles, 0);
  const totalAsistenciasLocal = jugadoresLocal.reduce((total, jugador) => total + jugador.asistencias, 0);
  const totalAsistenciasVisitante = jugadoresVisitante.reduce((total, jugador) => total + jugador.asistencias, 0);

  return {
    local: {
      jugadores: jugadoresLocal.length,
      goles: totalGolesLocal,
      asistencias: totalAsistenciasLocal
    },
    visitante: {
      jugadores: jugadoresVisitante.length,
      goles: totalGolesVisitante,
      asistencias: totalAsistenciasVisitante
    },
    total: {
      jugadores: jugadoresLocal.length + jugadoresVisitante.length,
      goles: totalGolesLocal + totalGolesVisitante,
      asistencias: totalAsistenciasLocal + totalAsistenciasVisitante
    }
  };
};

// Método para agregar calificación a un jugador
formacionSchema.methods.agregarCalificacion = function(equipoTipo, jugadorId, usuarioId, usuarioNombre, puntuacion) {
  const equipo = this.equipos[equipoTipo];
  if (!equipo) {
    throw new Error(`Equipo ${equipoTipo} no encontrado`);
  }

  const jugador = equipo.jugadores.find(j => j.jugadorId.toString() === jugadorId.toString());
  if (!jugador) {
    throw new Error('Jugador no encontrado en el equipo');
  }

  // Verificar si el usuario ya calificó a este jugador
  const calificacionExistente = jugador.calificaciones.findIndex(c => c.usuarioId === usuarioId);
  
  if (calificacionExistente !== -1) {
    // Actualizar calificación existente
    jugador.calificaciones[calificacionExistente].puntuacion = puntuacion;
    jugador.calificaciones[calificacionExistente].fecha = new Date();
  } else {
    // Agregar nueva calificación
    jugador.calificaciones.push({
      usuarioId,
      usuarioNombre,
      puntuacion,
      fecha: new Date()
    });
  }

  // Recalcular promedio
  const suma = jugador.calificaciones.reduce((acc, cal) => acc + cal.puntuacion, 0);
  jugador.promedioCalificacion = Number((suma / jugador.calificaciones.length).toFixed(2));

  return this.save();
};

// Método para calcular y actualizar el MVP del partido
formacionSchema.methods.calcularMVP = function() {
  let mejorJugador = null;
  let mejorPromedio = 0;
  let mejorEquipo = null;

  // Buscar en equipo local
  this.equipos.local.jugadores.forEach(jugador => {
    if (jugador.promedioCalificacion > mejorPromedio && jugador.calificaciones.length >= 3) {
      mejorPromedio = jugador.promedioCalificacion;
      mejorJugador = jugador;
      mejorEquipo = 'local';
    }
  });

  // Buscar en equipo visitante
  this.equipos.visitante.jugadores.forEach(jugador => {
    if (jugador.promedioCalificacion > mejorPromedio && jugador.calificaciones.length >= 3) {
      mejorPromedio = jugador.promedioCalificacion;
      mejorJugador = jugador;
      mejorEquipo = 'visitante';
    }
  });

  if (mejorJugador && mejorEquipo) {
    this.mvp = {
      jugadorId: mejorJugador.jugadorId,
      equipo: mejorEquipo,
      promedioCalificacion: mejorPromedio
    };
  }

  return this.save();
};

// Método para realizar una sustitución
formacionSchema.methods.realizarSustitucion = function(equipoTipo, jugadorSaleId, jugadorEntraId, minuto, motivo) {
  const equipo = this.equipos[equipoTipo];
  if (!equipo) {
    throw new Error(`Equipo ${equipoTipo} no encontrado`);
  }

  const jugadorSale = equipo.jugadores.find(j => j.jugadorId.toString() === jugadorSaleId.toString());
  const jugadorEntra = equipo.jugadores.find(j => j.jugadorId.toString() === jugadorEntraId.toString());

  if (!jugadorSale) {
    throw new Error('Jugador que sale no encontrado');
  }
  if (!jugadorEntra) {
    throw new Error('Jugador que entra no encontrado');
  }

  // Intercambiar estado de titular
  jugadorSale.esTitular = false;
  jugadorEntra.esTitular = true;

  // Si el jugador que entra no tiene posición, tomar la del que sale
  if (!jugadorEntra.posicion || !jugadorEntra.posicion.x) {
    jugadorEntra.posicion = { ...jugadorSale.posicion };
  }

  // Registrar sustitución
  equipo.sustitucionesRealizadas.push({
    jugadorSale: jugadorSaleId,
    jugadorEntra: jugadorEntraId,
    minuto,
    motivo
  });

  return this.save();
};

// Método para actualizar estadísticas de un jugador
formacionSchema.methods.actualizarEstadisticasJugador = function(equipoTipo, jugadorId, estadisticas) {
  const equipo = this.equipos[equipoTipo];
  if (!equipo) {
    throw new Error(`Equipo ${equipoTipo} no encontrado`);
  }

  const jugador = equipo.jugadores.find(j => j.jugadorId.toString() === jugadorId.toString());
  if (!jugador) {
    throw new Error('Jugador no encontrado en el equipo');
  }

  jugador.estadisticas = {
    ...jugador.estadisticas,
    ...estadisticas
  };

  return this.save();
};

module.exports = mongoose.model('Formacion', formacionSchema, 'formaciones'); 