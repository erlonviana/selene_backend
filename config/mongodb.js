const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/selene';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);

    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erro ao conectar com MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };