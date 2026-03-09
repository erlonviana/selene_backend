const Dispositivo = require('../models-mongodb/Dispositivo');
const Leitura = require('../models-mongodb/Leitura');
const fs = require('fs');
const path = require('path');

class LeituraController {
  // Função para salvar imagem como arquivo
  static async salvarImagemArquivo(equipamento, usuarioId, fotoBase64, timestamp, mac) {
    try {
      // Criar estrutura de pastas: fotos_cogumelos/{usuarioId}/{mac}/
      const basePath = path.join(__dirname, '..', '..', 'fotos_cogumelos');
      const userPath = path.join(basePath, usuarioId.toString());
      const devicePath = path.join(userPath, mac.replace(/[:]/g, '-'));
      
      // Criar diretórios se não existirem
      if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });
      if (!fs.existsSync(userPath)) fs.mkdirSync(userPath, { recursive: true });
      if (!fs.existsSync(devicePath)) fs.mkdirSync(devicePath, { recursive: true });
      
      // Nome do arquivo: {equipamento}_{timestamp}.jpg
      const filename = `${equipamento.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.jpg`;
      const filePath = path.join(devicePath, filename);
      
      // Converter base64 para buffer e salvar
      const base64Data = fotoBase64.replace(/^data:image\/jpeg;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      fs.writeFileSync(filePath, buffer);
      
      return `/fotos_cogumelos/${usuarioId}/${mac.replace(/[:]/g, '-')}/${filename}`;
      
    } catch (error) {
      console.error('Erro ao salvar imagem como arquivo:', error);
      return null;
    }
  }
  // Receber leitura do ESP32 com sensores
  static async receberSensores(req, res) {
    try {
      const { mac, temp, umid, lux, ph, cond, nivel, bat, rssi } = req.body;
      
      if (!mac) {
        return res.status(400).json({
          success: false,
          message: 'MAC address é obrigatório'
        });
      }
      
      // Buscar ou criar dispositivo
      let dispositivo = await Dispositivo.findOneAndUpdate(
        { mac_address: mac },
        {
          $set: {
            online: true,
            ultima_comunicacao: new Date()
          }
        },
        { new: true, upsert: true }
      );
      
      // Se foi criado novo dispositivo, atualizar com nome padrão
      if (dispositivo.__v === 0) { // Novo documento
        dispositivo.nome = `ESP32_${mac.slice(-6)}`;
        dispositivo.tipo = 'ESP32_SENSORES';
        dispositivo.usuario = req.userId || null;
        await dispositivo.save();
      }
      
      // Criar leitura com estrutura flexível
      const leitura = await Leitura.create({
        dispositivo: dispositivo._id,
        tipo_leitura: 'SENSORES',
        dados: {
          temperatura: temp,
          umidade: umid,
          luminosidade: lux,
          ph: ph,
          condutividade: cond,
          nivel_agua: nivel !== undefined ? Boolean(nivel) : null,
          bateria: bat,
          rssi: rssi
        },
        timestamp: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'Leitura recebida com sucesso',
        data: {
          dispositivo: {
            id: dispositivo._id,
            nome: dispositivo.nome,
            mac: dispositivo.mac_address
          },
          leitura: leitura.toBasicJSON()
        }
      });
      
    } catch (error) {
      console.error('Erro ao receber leitura:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  // Receber foto da câmera
  static async receberCamera(req, res) {
    try {
      const { mac, altura, foto_path } = req.body;
      
      if (!mac) {
        return res.status(400).json({
          success: false,
          message: 'MAC address é obrigatório'
        });
      }
      
      // Buscar ou criar dispositivo
      let dispositivo = await Dispositivo.findOneAndUpdate(
        { mac_address: mac },
        {
          $set: {
            online: true,
            ultima_comunicacao: new Date()
          }
        },
        { new: true, upsert: true }
      );
      
      // Se foi criado novo dispositivo, atualizar com nome padrão
      if (dispositivo.__v === 0) { // Novo documento
        dispositivo.nome = `ESP32-CAM_${mac.slice(-6)}`;
        dispositivo.tipo = 'ESP32_CAM';
        dispositivo.usuario = req.userId || null;
        await dispositivo.save();
      }
      
      // Criar leitura da câmera
      const leitura = await Leitura.create({
        dispositivo: dispositivo._id,
        tipo_leitura: 'CAMERA',
        dados: {
          altura: altura,
          foto_path: foto_path
        },
        timestamp: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'Foto recebida com sucesso',
        data: {
          dispositivo: {
            id: dispositivo._id,
            nome: dispositivo.nome,
            mac: dispositivo.mac_address
          },
          leitura: {
            id: leitura._id,
            altura: leitura.dados.altura,
            foto_path: leitura.dados.foto_path,
            timestamp: leitura.timestamp
          }
        }
      });
      
    } catch (error) {
      console.error('Erro ao receber foto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  // Histórico de leituras
  static async historico(req, res) {
    try {
      const { dispositivo_id } = req.params;
      const { limit = 100, page = 1 } = req.query;
      
      const leituras = await Leitura.find({ dispositivo: dispositivo_id })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('dispositivo', 'nome mac_address');
      
      res.json({
        success: true,
        data: leituras,
        total: leituras.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async grafico(req, res) {
    try {
      const { dispositivo_id } = req.params;
      const { 
        sensor = 'temperatura',
        periodo = '24h',
        agrupamento = 'auto'
      } = req.query;
      
      // Sensores permitidos
      const sensoresPermitidos = [
        'temperatura', 'umidade', 'ph', 
        'condutividade', 'luminosidade', 'altura_planta'
      ];
      
      if (!sensoresPermitidos.includes(sensor)) {
        return res.status(400).json({
          success: false,
          message: 'Sensor não suportado'
        });
      }
      
      // Determinar intervalo em horas
      let horas;
      switch (periodo) {
        case '1h': horas = 1; break;
        case '6h': horas = 6; break;
        case '24h': horas = 24; break;
        case '7d': horas = 168; break;
        case '30d': horas = 720; break;
        default: horas = 24;
      }
      
      // Determinar agrupamento
      let groupBy;
      if (agrupamento === 'auto') {
        if (periodo === '1h') groupBy = 'minute';
        else if (periodo === '6h' || periodo === '24h') groupBy = 'hour';
        else groupBy = 'day';
      } else {
        groupBy = agrupamento.toLowerCase();
      }
      
      // Calcular data limite
      const dataLimite = new Date();
      dataLimite.setHours(dataLimite.getHours() - horas);
      
      // Pipeline de agregação para MongoDB
      const pipeline = [
        {
          $match: {
            dispositivo: dispositivo_id,
            [`dados.${sensor}`]: { $exists: true, $ne: null },
            timestamp: { $gte: dataLimite }
          }
        },
        {
          $project: {
            periodo: {
              $dateToString: {
                format: '%Y-%m-%d %H:00',
                date: '$timestamp'
              }
            },
            valor: `$dados.${sensor}`,
            timestamp: 1
          }
        },
        {
          $group: {
            _id: '$periodo',
            valor_medio: { $avg: '$valor' },
            valor_min: { $min: '$valor' },
            valor_max: { $max: '$valor' },
            total_leituras: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        },
        {
          $project: {
            periodo: '$_id',
            valor_medio: { $round: ['$valor_medio', 2] },
            valor_min: { $round: ['$valor_min', 2] },
            valor_max: { $round: ['$valor_max', 2] },
            total_leituras: 1,
            _id: 0
          }
        }
      ];
      
      const dados = await Leitura.aggregate(pipeline);
      
      res.json({
        success: true,
        sensor,
        periodo,
        agrupamento: groupBy,
        dados: dados || [],
        total_pontos: dados.length
      });
      
    } catch (error) {
      console.error('Erro ao buscar dados para gráfico:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  static async metricas(req, res) {
    try {
      const { dispositivo_id } = req.params;
      const { periodo = '24h' } = req.query;
      
      // Determinar intervalo em horas
      let horas;
      switch (periodo) {
        case '1h': horas = 1; break;
        case '6h': horas = 6; break;
        case '24h': horas = 24; break;
        case '7d': horas = 168; break;
        case '30d': horas = 720; break;
        default: horas = 24;
      }
      
      // Calcular data limite
      const dataLimite = new Date();
      dataLimite.setHours(dataLimite.getHours() - horas);
      
      // Pipeline de agregação para métricas
      const pipeline = [
        {
          $match: {
            dispositivo: dispositivo_id,
            timestamp: { $gte: dataLimite }
          }
        },
        {
          $group: {
            _id: null,
            total_leituras: { $sum: 1 },
            temperatura_media: { $avg: '$dados.temperatura' },
            temperatura_min: { $min: '$dados.temperatura' },
            temperatura_max: { $max: '$dados.temperatura' },
            umidade_media: { $avg: '$dados.umidade' },
            umidade_min: { $min: '$dados.umidade' },
            umidade_max: { $max: '$dados.umidade' },
            ph_media: { $avg: '$dados.ph' },
            ph_min: { $min: '$dados.ph' },
            ph_max: { $max: '$dados.ph' },
            luminosidade_media: { $avg: '$dados.luminosidade' },
            ultima_leitura: { $max: '$timestamp' }
          }
        },
        {
          $project: {
            _id: 0,
            total_leituras: 1,
            temperatura: {
              media: { $round: ['$temperatura_media', 2] },
              min: { $round: ['$temperatura_min', 2] },
              max: { $round: ['$temperatura_max', 2] }
            },
            umidade: {
              media: { $round: ['$umidade_media', 2] },
              min: { $round: ['$umidade_min', 2] },
              max: { $round: ['$umidade_max', 2] }
            },
            ph: {
              media: { $round: ['$ph_media', 2] },
              min: { $round: ['$ph_min', 2] },
              max: { $round: ['$ph_max', 2] }
            },
            luminosidade: {
              media: { $round: ['$luminosidade_media', 2] },
              min: { $min: '$dados.luminosidade' },
              max: { $max: '$dados.luminosidade' }
            },
            ultima_leitura: 1
          }
        }
      ];
      
      const [metricas] = await Leitura.aggregate(pipeline);
      
      res.json({
        success: true,
        periodo,
        metricas: metricas || {
          total_leituras: 0,
          ultima_leitura: null
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Receber leitura do ESP32 sem autenticação (pública)
  static async receberSensoresPublico(req, res) {
    try {
      const { mac, temp, umid, lux, ph, cond, nivel, bat, rssi } = req.body;
      
      if (!mac) {
        return res.status(400).json({
          success: false,
          message: 'MAC address é obrigatório'
        });
      }
      
      // Buscar dispositivo pelo MAC (sem criar novo se não existir)
      const dispositivo = await Dispositivo.findOne({ mac_address: mac });
      
      if (!dispositivo) {
        return res.status(404).json({
          success: false,
          message: 'Dispositivo não cadastrado. Cadastre primeiro no sistema.'
        });
      }
      
      // Atualizar status do dispositivo
      dispositivo.online = true;
      dispositivo.ultima_comunicacao = new Date();
      await dispositivo.save();
      
      // Criar leitura com estrutura flexível
      const leitura = await Leitura.create({
        dispositivo: dispositivo._id,
        tipo_leitura: 'SENSORES',
        dados: {
          temperatura: temp,
          umidade: umid,
          luminosidade: lux,
          ph: ph,
          condutividade: cond,
          nivel_agua: nivel !== undefined ? Boolean(nivel) : null,
          bateria: bat,
          rssi: rssi
        },
        timestamp: new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'Leitura recebida com sucesso',
        data: {
          dispositivo: {
            id: dispositivo._id,
            nome: dispositivo.nome,
            mac: dispositivo.mac_address
          },
          leitura: leitura.toBasicJSON()
        }
      });
      
    } catch (error) {
      console.error('Erro ao receber leitura pública:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Receber foto da câmera sem autenticação (pública)
  static async receberCameraPublico(req, res) {
    try {
      const { equipamento, foto, tamanho, timestamp, client_ip } = req.body;
      
      if (!equipamento || !foto || !req.body.mac) {
        return res.status(400).json({
          success: false,
          message: 'Equipamento, foto e MAC são obrigatórios'
        });
      }
      
      // Buscar dispositivo pelo MAC (sem criar novo se não existir)
      const dispositivo = await Dispositivo.findOne({ 
        mac_address: req.body.mac
      });
      
      if (!dispositivo) {
        return res.status(404).json({
          success: false,
          message: 'Dispositivo não cadastrado. Cadastre primeiro no sistema.'
        });
      }
      
      // Atualizar status do dispositivo
      dispositivo.online = true;
      dispositivo.ultima_comunicacao = new Date();
      await dispositivo.save();
      
      // Salvar imagem como arquivo
      const fotoPath = await LeituraController.salvarImagemArquivo(
        equipamento,
        dispositivo.usuario.toString(),
        foto,
        timestamp,
        req.body.mac
      );
      
      // Criar leitura da câmera
      const leitura = await Leitura.create({
        dispositivo: dispositivo._id,
        tipo_leitura: 'CAMERA',
        dados: {
          foto_base64: foto,          // Base64 no MongoDB
          foto_path: fotoPath,        // Caminho do arquivo
          tamanho_arquivo: tamanho,
          client_ip: client_ip,
          altura: req.body.altura || null
        },
        timestamp: timestamp ? new Date(timestamp * 1000) : new Date()
      });
      
      res.status(201).json({
        success: true,
        message: 'Foto recebida com sucesso',
        data: {
          dispositivo: {
            id: dispositivo._id,
            nome: dispositivo.nome,
            mac: dispositivo.mac_address
          },
          leitura: {
            id: leitura._id,
            tamanho: leitura.dados.tamanho_arquivo,
            timestamp: leitura.timestamp
          }
        }
      });
      
    } catch (error) {
      console.error('Erro ao receber foto pública:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = LeituraController;