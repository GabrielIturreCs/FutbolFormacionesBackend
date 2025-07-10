require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Probando conexión a MongoDB...');
console.log('📋 Variables de entorno:');
console.log('- MONGODB_URI:', process.env.MONGODB_URI ? '✅ Definida' : '❌ No definida');
console.log('- PORT:', process.env.PORT || '3000 (por defecto)');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'development');

async function testConnection() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    console.log('\n🔗 Intentando conectar a MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Conexión exitosa!');
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`🗄️  Base de datos: ${conn.connection.name}`);
    console.log(`🔌 Puerto: ${conn.connection.port}`);
    console.log(`👤 Usuario: ${conn.connection.user}`);

    // Cerrar la conexión
    await mongoose.connection.close();
    console.log('\n✅ Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('\n❌ Error en la conexión:');
    console.error('Mensaje:', error.message);
    console.error('Código:', error.code);
    
    if (error.message.includes('bad auth')) {
      console.log('\n💡 Solución:');
      console.log('1. Ve a MongoDB Atlas > Database Access');
      console.log('2. Edita tu usuario y resetea la contraseña');
      console.log('3. Actualiza MONGODB_URI con la nueva contraseña');
    }
    
    process.exit(1);
  }
}

testConnection(); 