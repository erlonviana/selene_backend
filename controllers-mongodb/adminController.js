const Admin = require('../models-mongodb/Admin');
const jwt = require('jsonwebtoken');

class AdminController {
  // Login de administrador
  static async login(req, res) {
    try {
      const { usuario, senha } = req.body;
      
      if (!usuario || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Usuário e senha são obrigatórios'
        });
      }
      
      // Buscar admin com senha (select: false no schema)
      const admin = await Admin.findOne({ usuario }).select('+senha');
      
      if (!admin || !(await admin.verificarSenha(senha))) {
        return res.status(401).json({
          success: false,
          message: 'Usuário ou senha inválidos'
        });
      }
      
      if (!admin.ativo) {
        return res.status(401).json({
          success: false,
          message: 'Administrador desativado'
        });
      }
      
      // Atualizar último login
      admin.ultimo_login = new Date();
      await admin.save();
      
      // Gerar token JWT específico para admin
      const token = jwt.sign(
        { 
          adminId: admin._id, 
          usuario: admin.usuario,
          nivel: admin.nivel_acesso 
        },
        process.env.JWT_SECRET || 'secret_fallback',
        { expiresIn: '24h' }
      );
      
      res.json({
        success: true,
        message: 'Login de administrador realizado com sucesso',
        data: {
          token,
          admin: admin.toJSON()
        }
      });
      
    } catch (error) {
      console.error('Erro no login admin:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Criar novo administrador (apenas para superadmin)
  static async criarAdmin(req, res) {
    try {
      const { usuario, senha, nome_completo, email, nivel_acesso } = req.body;
      
      // Verificar se admin já existe
      const adminExistente = await Admin.findOne({ 
        $or: [{ usuario }, { email: email.toLowerCase() }] 
      });
      
      if (adminExistente) {
        return res.status(400).json({
          success: false,
          message: 'Usuário ou email já cadastrado'
        });
      }
      
      // Criar admin
      const admin = await Admin.create({
        usuario,
        senha,
        nome_completo,
        email: email.toLowerCase(),
        nivel_acesso: nivel_acesso || 'admin'
      });
      
      res.status(201).json({
        success: true,
        message: 'Administrador criado com sucesso',
        data: admin.toJSON()
      });
      
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Listar administradores
  static async listarAdmins(req, res) {
    try {
      const admins = await Admin.find().select('-senha');
      
      res.json({
        success: true,
        data: admins
      });
      
    } catch (error) {
      console.error('Erro ao listar admins:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Verificar token admin (health check)
  static async verificarToken(req, res) {
    try {
      const admin = await Admin.findById(req.adminId).select('-senha');
      
      res.json({
        success: true,
        data: admin
      });
      
    } catch (error) {
      console.error('Erro ao verificar token admin:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = AdminController;