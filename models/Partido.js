const mongoose = require('mongoose');

const partidoSchema = new mongoose.Schema({
  nombreEquipoLocal: {
    type: String,
    required: [true, 'El nombre del equipo local es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  nombreEquipoVisitante: {
    type: String,
    required: [true, 'El nombre del equipo visitante es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  golesLocal: {
    type: Number,
    default: 0,
    min: 0
  },
  golesVisitante: {
    type: Number,
    default: 0,
    min: 0
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  estado: {
    type: String,
    enum: ['programado', 'en_curso', 'finalizado', 'cancelado'],
    default: 'programado'
  },
  formacionLocal: {
    jugadores: [{
      jugadorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jugador'
      },
      posicion: {
        x: Number,
        y: Number
      }
    }]
  },
  formacionVisitante: {
    jugadores: [{
      jugadorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Jugador'
      },
      posicion: {
        x: Number,
        y: Number
      }
    }]
  },
  golesDetalle: [{
    jugadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Jugador'
    },
    minuto: Number,
    tipo: {
      type: String,
      enum: ['gol', 'autogol'],
      default: 'gol'
    }
  }],
  asistenciasDetalle: [{
    jugadorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Jugador'
    },
    minuto: Number
  }]
}, {
  timestamps: true
});

// Índices
partidoSchema.index({ fecha: -1 });
partidoSchema.index({ estado: 1 });

// Método para actualizar resultado
partidoSchema.methods.actualizarResultado = function(golesLocal, golesVisitante) {
  this.golesLocal = golesLocal;
  this.golesVisitante = golesVisitante;
  return this.save();
};

// Método para agregar gol
partidoSchema.methods.agregarGol = function(jugadorId, minuto, tipo = 'gol') {
  this.golesDetalle.push({
    jugadorId,
    minuto,
    tipo
  });
  
  // Actualizar contador de goles del jugador
  return this.save();
};

// Método para agregar asistencia
partidoSchema.methods.agregarAsistencia = function(jugadorId, minuto) {
  this.asistenciasDetalle.push({
    jugadorId,
    minuto
  });
  
  return this.save();
};

module.exports = mongoose.model('Partido', partidoSchema, 'partidos'); 