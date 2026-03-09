//(arquivo principal de rotas)
const express = require('express');
const router = express.Router();

// Importar todas as rotas
const dispositivoRoutes = require('./dispositivoRoutes');
const leituraRoutes = require('./leituraRoutes');
const plantaRoutes = require('./plantaRoutes');
const alertaRoutes = require('./alertaRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const configuracaoAlertaRoutes = require('./configuracaoAlertaRoutes');

// Configurar rotas com prefixo
router.use('/dispositivos', dispositivoRoutes);
router.use('/leituras', leituraRoutes);
router.use('/plantas', plantaRoutes);
router.use('/alertas', alertaRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/configuracoes-alerta', configuracaoAlertaRoutes);

// Health Check - Verificar se API está funcionando
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API da SELENE está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota de teste para verificar banco de dados MongoDB
router.get('/test-db', async (req, res) => {
  try {
    const { mongoose } = require('../config/mongodb');
    const state = mongoose.connection.readyState;
    
    const states = {
      0: 'Desconectado',
      1: 'Conectado',
      2: 'Conectando',
      3: 'Desconectando'
    };
    
    res.json({
      success: true,
      message: 'Conexão com MongoDB verificada!',
      status: states[state],
      host: mongoose.connection.host,
      database: mongoose.connection.name
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro na conexão com banco de dados',
      error: error.message
    });
  }
});

// 404 - Rota não encontrada
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
    path: req.originalUrl
  });
});

module.exports = router;