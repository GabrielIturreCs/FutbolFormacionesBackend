const mongoose = require('mongoose');

const jugadorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del jugador es obligatorio'],
    trim: true,
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  numero: {
    type: Number,
    min: [1, 'El número debe ser mayor a 0'],
    max: [99, 'El número no puede ser mayor a 99']
  },
  equipo: {
    type: String,
    enum: ['rojo', 'azul'],
    required: [true, 'El equipo es obligatorio']
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
  partidosJugados: {
    type: Number,
    default: 0,
    min: 0
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
jugadorSchema.index({ nombre: 1 });
jugadorSchema.index({ equipo: 1 });
jugadorSchema.index({ goles: -1 });

// Método para agregar goles
jugadorSchema.methods.agregarGoles = function(cantidad) {
  this.goles += cantidad;
  return this.save();
};

// Método para agregar asistencias
jugadorSchema.methods.agregarAsistencias = function(cantidad) {
  this.asistencias += cantidad;
  return this.save();
};

// Método para actualizar posición
jugadorSchema.methods.actualizarPosicion = function(x, y) {
  this.posicion = { x, y };
  return this.save();
};

module.exports = mongoose.model('Jugador', jugadorSchema); 