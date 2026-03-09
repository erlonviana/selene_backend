const express = require('express');
const router = express.Router();
const AlertaController = require('../controllers-mongodb/alertaController');

// GET /api/v1/alertas/estatisticas - Estatísticas de alertas (DEVE VIR ANTES de /:id)
router.get('/estatisticas', AlertaController.estatisticas);

// GET /api/v1/alertas - Listar alertas
router.get('/', AlertaController.listar);

// PATCH /api/v1/alertas/:id/resolver - Marcar alerta como resolvido
router.patch('/:id/resolver', AlertaController.resolver);

module.exports = router;