const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  usuario: {
    type: String,
    required: [true, 'Usuário admin é obrigatório'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  senha: {
    type: String,
    required: [true, 'Senha admin é obrigatória'],
    minlength: 6,
    select: false
  },
  nome_completo: {
    type: String,
    required: [true, 'Nome completo é obrigatório'],
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Por favor, use um email válido']
  },
  ativo: {
    type: Boolean,
    default: true
  },
  nivel_acesso: {
    type: String,
    enum: ['admin', 'superadmin'],
    default: 'admin'
  },
  ultimo_login: {
    type: Date
  }
}, {
  timestamps: {
    createdAt: 'criado_em',
    updatedAt: 'atualizado_em'
  }
});

// Hash da senha antes de salvar
adminSchema.pre('save', async function() {
  if (!this.isModified('senha')) return;
  this.senha = await bcrypt.hash(this.senha, 12);
});

// Método para verificar senha
adminSchema.methods.verificarSenha = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

// Remover senha do output
adminSchema.methods.toJSON = function() {
  const admin = this.toObject();
  delete admin.senha;
  return admin;
};

module.exports = mongoose.model('Admin', adminSchema);