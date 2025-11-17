const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Usar la variable de entorno MONGODB_URI
    let mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    console.log('🔐 Conectando a MongoDB...');
    console.log('📍 Host:', mongoURI.substring(0, mongoURI.indexOf('@') + 30) + '...');

    // IMPORTANTE: Asegurar que la URI usa el nombre correcto de la BD
    // MongoDB Atlas tiene la BD como "futbolFormaciones" (camelCase)
    // Si la URI tiene "futbolformaciones" (minúsculas), reemplazarla
    const originalURI = mongoURI;
    mongoURI = mongoURI.replace(
      /\/futbolformaciones(\?|&|$)/gi,
      '/futbolFormaciones$1'
    );

    if (originalURI !== mongoURI) {
      console.log('⚠️  URI corregida: futbolformaciones → futbolFormaciones');
    }

    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    console.log(`📊 Base de datos: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 