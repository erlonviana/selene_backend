const jwt = require('jsonwebtoken');
const Admin = require('../models-mongodb/Admin');

const adminAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de administrador não fornecido'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de administrador não fornecido'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');
    
    // Buscar admin
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Administrador não encontrado'
      });
    }
    
    if (!admin.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Administrador desativado'
      });
    }
    
    // Adicionar admin à requisição
    req.adminId = admin._id;
    req.admin = admin;
    
    next();
  } catch (error) {
    console.error('Erro na autenticação admin:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token de administrador inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token de administrador expirado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = adminAuthMiddleware;