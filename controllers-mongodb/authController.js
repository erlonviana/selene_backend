const User = require('../models-mongodb/User');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', '..', 'fotos_perfil');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'perfil-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

class AuthController {
  // Upload middleware
  static uploadMiddleware() {
    return upload.single('foto_perfil');
  }

  // Cadastro de usuário
  static async registrar(req, res) {
    try {
      const { nome_completo, email, senha, telefone, endereco, data_nascimento } = req.body;
      
      // Verificar se usuário já existe
      const usuarioExistente = await User.findOne({ email: email.toLowerCase() });
      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }
      
      // Criar usuário
      const usuarioData = {
        nome_completo,
        email: email.toLowerCase(),
        senha,
        telefone,
        endereco,
        data_nascimento: data_nascimento ? new Date(data_nascimento) : null
      };
      
      // Adicionar foto se enviada
      if (req.file) {
        usuarioData.foto_perfil = `/fotos_perfil/${req.file.filename}`;
      }
      
      const usuario = await User.create(usuarioData);
      
      // Gerar token JWT
      const token = jwt.sign(
        { userId: usuario._id, email: usuario.email },
        process.env.JWT_SECRET || 'secret_fallback',
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          token,
          usuario: usuario.toJSON()
        }
      });
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Login de usuário
  static async login(req, res) {
    try {
      const { email, senha } = req.body;
      
      if (!email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }
      
      // Buscar usuário com senha (select: false no schema)
      const usuario = await User.findOne({ email: email.toLowerCase() }).select('+senha');
      
      if (!usuario || !(await usuario.verificarSenha(senha))) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha inválidos'
        });
      }
      
      if (!usuario.ativo) {
        return res.status(401).json({
          success: false,
          message: 'Usuário desativado'
        });
      }
      
      // Atualizar último login
      usuario.ultimo_login = new Date();
      await usuario.save();
      
      // Gerar token JWT
      const token = jwt.sign(
        { userId: usuario._id, email: usuario.email },
        process.env.JWT_SECRET || 'secret_fallback',
        { expiresIn: '7d' }
      );
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          usuario: usuario.toJSON()
        }
      });
      
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Perfil do usuário
  static async perfil(req, res) {
    try {
      const usuario = await User.findById(req.userId).select('-senha');
      
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      res.json({
        success: true,
        data: usuario
      });
      
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async atualizarPerfil(req, res) {
    try {
      const { nome_completo, telefone, endereco, data_nascimento } = req.body;

      const usuario = await User.findById(req.userId);
      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      usuario.nome_completo = nome_completo || usuario.nome_completo;
      usuario.telefone = telefone || usuario.telefone;
      usuario.endereco = endereco || usuario.endereco;
      usuario.data_nascimento = data_nascimento || usuario.data_nascimento;
      
      if (req.file) {
        usuario.foto_perfil = `/fotos_usuarios/${req.file.filename}`;
      }

      await usuario.save();

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: {
          id: usuario._id,
          nome_completo: usuario.nome_completo,
          email: usuario.email,
          telefone: usuario.telefone,
          endereco: usuario.endereco,
          foto_perfil: usuario.foto_perfil
        }
      });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static uploadFoto() {
    const multer = require('multer');
    const path = require('path');
    
    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', '..', 'fotos_usuarios'));
      },
      filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'usuario-' + uniqueSuffix + path.extname(file.originalname));
      }
    });
    
    const upload = multer({ 
      storage: storage,
      limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
      },
      fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Apenas imagens são permitidas'), false);
        }
      }
    });
    
    return upload.single('foto_perfil');
  }
}

module.exports = AuthController;