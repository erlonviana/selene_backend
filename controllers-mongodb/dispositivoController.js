const Dispositivo = require('../models-mongodb/Dispositivo');
const Planta = require('../models-mongodb/Planta');

class DispositivoController {
  static async listar(req, res) {
    try {
      const usuarioId = req.userId;
      const { incluir_inativos } = req.query; // Parâmetro opcional para incluir dispositivos inativos
      
      // Por padrão, mostra apenas ativos. Se incluir_inativos=true, mostra todos
      const filtro = { usuario: usuarioId };
      if (incluir_inativos !== 'true') {
        filtro.ativo = true;
      }
      
      const dispositivos = await Dispositivo.find(filtro)
        .populate('planta', 'especie status')
        .sort({ nome: 1 });
      
      res.json({
        success: true,
        data: dispositivos,
        total: dispositivos.length,
        filtro_aplicado: incluir_inativos === 'true' ? 'todos' : 'apenas_ativos'
      });
      
    } catch (error) {
      console.error('Erro ao listar dispositivos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  static async buscar(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.userId;
      
      const dispositivo = await Dispositivo.findOne({
        _id: id,
        usuario: usuarioId
      }).populate('planta');
      
      if (!dispositivo) {
        return res.status(404).json({
          success: false,
          message: 'Dispositivo não encontrado ou acesso não autorizado'
        });
      }
      
      res.json({
        success: true,
        data: dispositivo
      });
      
    } catch (error) {
      console.error('Erro ao buscar dispositivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  static async criar(req, res) {
    try {
      const usuarioId = req.userId;
      const { mac_address, nome, tipo, localizacao, planta_id } = req.body;
      
      if (!mac_address) {
        return res.status(400).json({
          success: false,
          message: 'MAC address é obrigatório'
        });
      }
      
      // Verificar se MAC já existe
      const dispositivoExistente = await Dispositivo.findOne({ mac_address });
      if (dispositivoExistente) {
        return res.status(400).json({
          success: false,
          message: 'MAC address já cadastrado'
        });
      }
      
      // Verificar se planta pertence ao usuário
      let planta = null;
      if (planta_id) {
        planta = await Planta.findOne({ 
          _id: planta_id, 
          usuario: usuarioId 
        });
        
        if (!planta) {
          return res.status(400).json({
            success: false,
            message: 'Planta não encontrada ou acesso não autorizado'
          });
        }
      }
      
      const dispositivo = await Dispositivo.create({
        mac_address,
        nome: nome || `ESP32_${mac_address.slice(-6)}`,
        tipo: tipo || 'ESP32_SENSORES',
        localizacao,
        planta: planta_id || null,
        usuario: usuarioId,
        online: true,
        ultima_comunicacao: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'Dispositivo criado com sucesso',
        data: dispositivo
      });
      
    } catch (error) {
      console.error('Erro ao criar dispositivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  static async atualizar(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.userId;
      const { nome, tipo, localizacao, planta_id } = req.body;
      
      // Verificar se dispositivo pertence ao usuário
      const dispositivo = await Dispositivo.findOne({
        _id: id,
        usuario: usuarioId
      });
      
      if (!dispositivo) {
        return res.status(404).json({
          success: false,
          message: 'Dispositivo não encontrado'
        });
      }
      
      // Verificar se nova planta pertence ao usuário
      let planta = null;
      if (planta_id) {
        planta = await Planta.findOne({ 
          _id: planta_id, 
          usuario: usuarioId 
        });
        
        if (!planta) {
          return res.status(400).json({
            success: false,
            message: 'Planta não encontrada ou acesso não autorizado'
          });
        }
      }
      
      // Atualizar dispositivo
      const atualizado = await Dispositivo.findByIdAndUpdate(
        id,
        {
          nome,
          tipo,
          localizacao,
          planta: planta_id || null
        },
        { new: true, runValidators: true }
      );
      
      res.json({
        success: true,
        message: 'Dispositivo atualizado com sucesso',
        data: atualizado
      });
      
    } catch (error) {
      console.error('Erro ao atualizar dispositivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  static async atualizarStatus(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.userId;
      const { online } = req.body;
      
      // Verificar se dispositivo pertence ao usuário
      const dispositivo = await Dispositivo.findOne({
        _id: id,
        usuario: usuarioId
      });
      
      if (!dispositivo) {
        return res.status(404).json({
          success: false,
          message: 'Dispositivo não encontrado'
        });
      }
      
      // Atualizar status
      const atualizado = await Dispositivo.findByIdAndUpdate(
        id,
        {
          online,
          ultima_comunicacao: new Date()
        },
        { new: true }
      );
      
      res.json({
        success: true,
        message: `Dispositivo ${online ? 'online' : 'offline'}`, 
        data: atualizado
      });
      
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Ativar/Desativar dispositivo
  static async alterarStatusDispositivo(req, res) {
    try {
      const { id } = req.params;
      const usuarioId = req.userId;
      const { ativo } = req.body;

      // Verificar se dispositivo pertence ao usuário
      const dispositivo = await Dispositivo.findOne({
        _id: id,
        usuario: usuarioId
      });

      if (!dispositivo) {
        return res.status(404).json({
          success: false,
          message: 'Dispositivo não encontrado'
        });
      }

      // Atualizar status ativo
      const statusAnterior = dispositivo.ativo;
      dispositivo.ativo = ativo === true ? true : false;
      await dispositivo.save();

      res.json({
        success: true,
        message: `Dispositivo ${dispositivo.ativo ? 'ativado' : 'desativado'} com sucesso`,
        data: {
          id: dispositivo._id,
          nome: dispositivo.nome,
          mac_address: dispositivo.mac_address,
          ativo: dispositivo.ativo,
          status_anterior: statusAnterior
        }
      });

    } catch (error) {
      console.error('Erro ao alterar status do dispositivo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = DispositivoController;