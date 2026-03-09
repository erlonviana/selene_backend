// Middleware para tratamento de erros
const errorHandler = (err, req, res, next) => {
  console.error('❌ Erro:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Erros do Sequelize
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }
  
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Registro duplicado',
      field: err.errors[0].path
    });
  }
  
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Erro de referência externa'
    });
  }
  
  // Erro padrão
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;