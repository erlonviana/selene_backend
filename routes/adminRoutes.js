const express = require('express');
const router = express.Router();
const AdminController = require('../controllers-mongodb/adminController');
const adminAuthMiddleware = require('../middleware/admin-auth-mongodb');

// POST /api/v1/admin/login - Login de administrador
router.post('/login', AdminController.login);

// POST /api/v1/admin/criar - Criar novo administrador (requer autenticação)
router.post('/criar', adminAuthMiddleware, AdminController.criarAdmin);

// GET /api/v1/admin/listar - Listar administradores (requer autenticação)
router.get('/listar', adminAuthMiddleware, AdminController.listarAdmins);

// GET /api/v1/admin/verificar - Verificar token admin (requer autenticação)
router.get('/verificar', adminAuthMiddleware, AdminController.verificarToken);

module.exports = router;