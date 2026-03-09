const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers-mongodb/dashboardController');
const authMiddleware = require('../middleware/auth-mongodb');

// GET /api/v1/dashboard/principal - Dashboard principal
router.get('/principal', authMiddleware, DashboardController.principal);

// GET /api/v1/dashboard/dispositivo/:id - Dashboard específico do dispositivo
router.get('/dispositivo/:id', authMiddleware, DashboardController.dispositivo);

// GET /api/v1/dashboard/plantas - Dashboard de plantas
router.get('/plantas', authMiddleware, DashboardController.plantas);

module.exports = router;