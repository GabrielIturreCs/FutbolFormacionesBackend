const Jugador = require('../models/Jugador');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'jugadores',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const multer = require('multer');
const upload = multer({ storage: storage });

// @desc    Obtener todos los jugadores
// @route   GET /api/jugadores
// @access  Public
const obtenerJugadores = async (req, res) => {
  try {
    const jugadores = await Jugador.find({ activo: true }).sort({ nombre: 1 });
    
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

// @desc    Obtener jugadores por equipo
// @route   GET /api/jugadores/equipo/:equipo
// @access  Public
const obtenerJugadoresPorEquipo = async (req, res) => {
  try {
    const { equipo } = req.params;
    
    if (!['rojo', 'azul'].includes(equipo)) {
      return res.status(400).json({
        success: false,
        error: 'Equipo debe ser "rojo" o "azul"'
      });
    }

    const jugadores = await Jugador.find({ 
      equipo, 
      activo: true 
    }).sort({ nombre: 1 });

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

// @desc    Obtener top goleadores
// @route   GET /api/jugadores/top-goleadores
// @access  Public
const obtenerTopGoleadores = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const goleadores = await Jugador.find({ 
      activo: true,
      goles: { $gt: 0 }
    })
    .sort({ goles: -1, nombre: 1 })
    .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: goleadores.length,
      data: goleadores
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Crear nuevo jugador
// @route   POST /api/jugadores
// @access  Public
const crearJugador = async (req, res) => {
  try {
    const { nombre, numero, equipo, posicion, fotoUrl, goles, asistencias, partidosJugados } = req.body;

    console.log('📥 Datos recibidos para crear jugador:', {
      nombre,
      numero,
      equipo,
      posicion,
      fotoUrl,
      goles,
      asistencias,
      partidosJugados
    });

    // Validar que el número no esté ocupado en el equipo
    if (numero) {
      const jugadorExistente = await Jugador.findOne({ 
        numero, 
        equipo, 
        activo: true 
      });
      
      if (jugadorExistente) {
        console.log('❌ Número ya ocupado:', numero, 'en equipo:', equipo);
        return res.status(400).json({
          success: false,
          error: 'El número ya está ocupado en este equipo'
        });
      }
    }

    const jugador = await Jugador.create({
      nombre,
      numero,
      equipo,
      posicion,
      fotoUrl, // guardar la url si viene
      goles: goles || 0,
      asistencias: asistencias || 0,
      partidosJugados: partidosJugados || 0
    });

    console.log('✅ Jugador creado exitosamente:', jugador._id);

    res.status(201).json({
      success: true,
      data: jugador
    });
  } catch (error) {
    console.error('❌ Error creando jugador:', error);
    console.error('❌ Detalles del error:', error.message);
    if (error.name === 'ValidationError') {
      const mensajes = Object.values(error.errors).map(err => err.message);
      console.error('❌ Errores de validación:', mensajes);
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

// @desc    Actualizar jugador
// @route   PUT /api/jugadores/:id
// @access  Public
const actualizarJugador = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, numero, equipo, posicion, goles, asistencias, partidosJugados, fotoUrl } = req.body;

    let jugador = await Jugador.findById(id);

    if (!jugador) {
      return res.status(404).json({
        success: false,
        error: 'Jugador no encontrado'
      });
    }

    // Validar número si se está cambiando
    if (numero && numero !== jugador.numero) {
      const jugadorExistente = await Jugador.findOne({ 
        numero, 
        equipo: equipo || jugador.equipo, 
        activo: true,
        _id: { $ne: id }
      });
      
      if (jugadorExistente) {
        return res.status(400).json({
          success: false,
          error: 'El número ya está ocupado en este equipo'
        });
      }
    }

    jugador = await Jugador.findByIdAndUpdate(
      id,
      { nombre, numero, equipo, posicion, goles, asistencias, partidosJugados, fotoUrl },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: jugador
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

// @desc    Eliminar jugador (soft delete)
// @route   DELETE /api/jugadores/:id
// @access  Public
const eliminarJugador = async (req, res) => {
  try {
    const { id } = req.params;

    const jugador = await Jugador.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!jugador) {
      return res.status(404).json({
        success: false,
        error: 'Jugador no encontrado'
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

// @desc    Agregar goles a jugador
// @route   PUT /api/jugadores/:id/goles
// @access  Public
const agregarGoles = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    const jugador = await Jugador.findById(id);

    if (!jugador) {
      return res.status(404).json({
        success: false,
        error: 'Jugador no encontrado'
      });
    }

    await jugador.agregarGoles(cantidad);

    res.status(200).json({
      success: true,
      data: jugador
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// @desc    Agregar asistencias a jugador
// @route   PUT /api/jugadores/:id/asistencias
// @access  Public
const agregarAsistencias = async (req, res) => {
  try {
    const { id } = req.params;
    const { cantidad } = req.body;

    const jugador = await Jugador.findById(id);

    if (!jugador) {
      return res.status(404).json({
        success: false,
        error: 'Jugador no encontrado'
      });
    }

    await jugador.agregarAsistencias(cantidad);

    res.status(200).json({
      success: true,
      data: jugador
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error del servidor'
    });
  }
};

// Definir la función antes de exportar
const uploadFotoJugador = (req, res) => {
  upload.single('foto')(req, res, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }
    // La URL pública de Cloudinary
    const fotoUrl = req.file.path;
    res.json({ url: fotoUrl });
  });
};

module.exports = {
  obtenerJugadores,
  obtenerJugadoresPorEquipo,
  obtenerTopGoleadores,
  crearJugador,
  actualizarJugador,
  eliminarJugador,
  agregarGoles,
  agregarAsistencias,
  uploadFotoJugador
};