const express = require('express');
const router = express.Router();
const AuthController = require('../controllers-mongodb/authController');
const authMiddleware = require('../middleware/auth-mongodb');
const adminAuthMiddleware = require('../middleware/admin-auth-mongodb');

// POST /api/v1/auth/registrar - Registrar novo usuário (requer autenticação admin)
router.post('/registrar', adminAuthMiddleware, AuthController.uploadFoto(), AuthController.registrar);

// POST /api/v1/auth/login - Login de usuário
router.post('/login', AuthController.login);

// GET /api/v1/auth/perfil - Obter perfil do usuário (requer autenticação)
router.get('/perfil', authMiddleware, AuthController.perfil);

// PUT /api/v1/auth/perfil - Atualizar perfil do usuário (requer autenticação)
router.put('/perfil', authMiddleware, AuthController.uploadFoto(), AuthController.atualizarPerfil);

module.exports = router;