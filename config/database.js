const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://gabriel13iturre:uKRUhuKVkED3kdXl@futbolformacionestopbd.xtuajuh.mongodb.net/?retryWrites=true&w=majority&appName=FutbolFormacionesTopBd', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error conectando a MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 