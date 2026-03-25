const express = require('express');
const router = express.Router();
const AuthController = require('../controllers-mongodb/authController');
const authMiddleware = require('../middleware/auth-mongodb');
const adminAuthMiddleware = require('../middleware/admin-auth-mongodb');

// POST /api/v1/auth/registrar - Registrar novo usuário (requer autenticação admin)
router.post('/registrar', adminAuthMiddleware, AuthController.uploadFoto(), AuthController.registrar);

// POST /api/v1/auth/login - Login de usuário
router.post('/login', AuthController.login);

// POST /api/v1/auth/recuperar-senha - Recuperar senha via e-mail
router.post('/recuperar-senha', AuthController.recuperarSenha);

// GET /api/v1/auth/perfil - Obter perfil do usuário (requer autenticação)
router.get('/perfil', authMiddleware, AuthController.perfil);

// PUT /api/v1/auth/perfil - Atualizar perfil do usuário (requer autenticação)
router.put('/perfil', authMiddleware, AuthController.uploadFoto(), AuthController.atualizarPerfil);

// PUT /api/v1/auth/usuarios/:userId/status - Alterar status do usuário (requer admin)
router.put('/usuarios/:userId/status', adminAuthMiddleware, AuthController.alterarStatusUsuario);

module.exports = router;