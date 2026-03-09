const express = require('express');
const router = express.Router();
const DispositivoController = require('../controllers-mongodb/dispositivoController');
const authMiddleware = require('../middleware/auth-mongodb');

// GET /api/v1/dispositivos - Listar todos dispositivos
router.get('/', authMiddleware, DispositivoController.listar);

// GET /api/v1/dispositivos/:id - Buscar dispositivo específico
router.get('/:id', authMiddleware, DispositivoController.buscar);

// POST /api/v1/dispositivos - Criar novo dispositivo
router.post('/', authMiddleware, DispositivoController.criar);

// PUT /api/v1/dispositivos/:id - Atualizar dispositivo
router.put('/:id', DispositivoController.atualizar);

// PATCH /api/v1/dispositivos/:id/status - Atualizar status online/offline
router.patch('/:id/status', DispositivoController.atualizarStatus);

module.exports = router;