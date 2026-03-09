// Este arquivo PEGA a configuração correta e CRIA a conexão

const { Sequelize } = require('sequelize');

// 1. Lê: "Qual ambiente estou? development ou production?"
const config = require('./config.js')[process.env.NODE_ENV || 'development'];

// Criar conexão Sequelize
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    storage: config.storage,
    logging: config.logging,
    define: config.define,
    pool: config.pool
  }
);

// Testar conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida!');
    console.log(`📁 Database: ${config.dialect === 'sqlite' ? config.storage : config.database}`);
    return true;
  } catch (error) {
    console.error('❌ Não foi possível conectar ao banco de dados:', error.message);
    return false;
  }
}

module.exports = { sequelize, testConnection };