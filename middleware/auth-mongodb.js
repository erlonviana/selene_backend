const jwt = require('jsonwebtoken');
const User = require('../models-mongodb/User');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer '
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }
    
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback');
    
    // Buscar usuário
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }
    
    if (!user.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário desativado'
      });
    }
    
    // Adicionar usuário à requisição
    req.userId = user._id;
    req.user = user;
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = authMiddleware;