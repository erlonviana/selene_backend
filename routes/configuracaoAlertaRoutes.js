// backend/src/routes/configuracaoAlertaRoutes.js
const express = require('express');
const router = express.Router();
const ConfiguracaoAlertaController = require('../controllers-mongodb/configuracaoAlertaController');
const authMiddleware = require('../middleware/auth-mongodb');

// Todas as rotas de configuração precisam de autenticação
// router.use(authMiddleware);

// Configurações por dispositivo (DEVE VIR ANTES de /:id)
router.get('/dispositivo/:dispositivoId', ConfiguracaoAlertaController.porDispositivo);

// Configurações padrão do sistema (DEVE VIR ANTES de /:id)
router.post('/padrao/:tipo', ConfiguracaoAlertaController.criarPadrao);

// CRUD das configurações de alerta
router.post('/', ConfiguracaoAlertaController.criar);
router.get('/', ConfiguracaoAlertaController.listar);
router.get('/:id', ConfiguracaoAlertaController.buscar);
router.put('/:id', ConfiguracaoAlertaController.atualizar);
router.delete('/:id', ConfiguracaoAlertaController.deletar);

module.exports = router;