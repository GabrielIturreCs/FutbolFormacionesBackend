const mongoose = require('mongoose');

const jugadorFormacionSchema = new mongoose.Schema({
  jugadorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Jugador',
    required: true
  },
  posicion: {
    x: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    y: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    }
  },
  numero: {
    type: Number,
    min: 1,
    max: 99
  }
});

const equipoSchema = new mongoose.Schema({
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
  jugadores: [jugadorFormacionSchema]
});

const formacionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la formación es obligatorio'],
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
    default: Date.now
  },
  equipos: {
    local: equipoSchema,
    visitante: equipoSchema
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

module.exports = mongoose.model('Formacion', formacionSchema); 