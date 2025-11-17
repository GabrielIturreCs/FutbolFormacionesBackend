const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Usar la variable de entorno MONGODB_URI
    let mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    // IMPORTANTE: Asegurar que la URI usa el nombre correcto de la BD
    // MongoDB Atlas tiene la BD como "futbolFormaciones" (camelCase)
    // Reemplazar "futbolformaciones" por "futbolFormaciones" si es necesario
    mongoURI = mongoURI.replace('/futbolformaciones?', '/futbolFormaciones?');
    mongoURI = mongoURI.replace('/futbolformaciones&', '/futbolFormaciones&');
    
    console.log('🔐 Conectando a MongoDB...');
    console.log('📁 BD:', mongoURI.includes('futbolFormaciones') ? '✅ futbolFormaciones' : '❌ futbolformaciones');

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