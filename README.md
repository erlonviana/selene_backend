# 🌙 API Selene - Monitoramento com ESP32

API backend para sistema de monitoramento utilizando ESP32 com sensores e câmera, agora com **MongoDB** para melhor performance e flexibilidade.

## � Novidades com MongoDB

### ✅ **Vantagens da Migração:**
- **Flexibilidade no schema**: Dados dos sensores podem ter estrutura variável
- **Melhor performance**: Agregações nativas para dashboards e relatórios  
- **Escalabilidade**: Fácil escalonamento horizontal
- **Documentos embutidos**: Relacionamentos mais eficientes
- **Consulta flexível**: Consultas complexas com aggregation pipeline

### 📊 **Estrutura de Dados Otimizada:**
- Leituras de sensores como documentos flexíveis
- Índices otimizados para consultas de time-series
- Agregações nativas para métricas em tempo real

## �🔐 Sistema de Autenticação

### 👤 Cadastro de Usuários
```bash
POST /api/v1/auth/registrar
Content-Type: multipart/form-data

{
  "nome_completo": "João Silva",
  "email": "joao@email.com", 
  "senha": "senha123",
  "telefone": "(11) 99999-9999",
  "data_nascimento": "1990-01-01",
  "endereco": "Rua das Flores, 123"
  # foto_perfil: arquivo de imagem (opcional)
}
```

### 🔑 Login de Usuários
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "joao@email.com",
  "senha": "senha123"
}
```

**Resposta**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "507f1f77bcf86cd799439011",
    "nome_completo": "João Silva",
    "email": "joao@email.com"
  }
}
```

### 📋 Perfil do Usuário
```bash
GET /api/v1/auth/perfil
Authorization: Bearer <token>
```

## 🔒 Política de Segurança

### ✅ Autenticação Obrigatória
Todas as rotas de leitura e dashboard exigem autenticação JWT válida:
- `POST /api/v1/leituras/sensores` - Requer autenticação
- `POST /api/v1/leituras/camera` - Requer autenticação  
- `GET /api/v1/dashboard/*` - Requer autenticação
- `GET /api/v1/dispositivos` - Requer autenticação

### 👥 Filtro por Usuário
- Cada usuário só acessa seus próprios dispositivos e dados
- Dispositivos são automaticamente associados ao usuário autenticado
- Dashboard mostra apenas dados do usuário logado

### 🤖 Auto-cadastro com Associação
Quando um dispositivo ESP32 envia dados pela primeira vez:
- **Se autenticado**: Dispositivo é associado ao usuário atual
- **Se não autenticado**: Dispositivo fica sem usuário (`usuario_id: null`)
- Apenas administradores podem ver dispositivos sem usuário

## 🚀 Tecnologias
- **Node.js** + **Express** - Servidor API
- **MongoDB** + **Mongoose** - Banco de dados não-relacional
- **JWT** - Autenticação por tokens
- **Multer** - Upload de arquivos
- **ESP32** - Microcontroladores para sensores e câmera

## 📡 Sensores Suportados
- 🌡️ Temperatura ambiente
- 💧 Umidade relativa do ar  
- ☀️ Luminosidade (lux)
- ⚗️ pH da solução nutritiva
- ⚡ Condutividade elétrica (EC)
- 💧 Nível de água (sensor de bóia)
- 📷 Câmera para medição de altura das plantas
- 🔋 Nível de bateria
- 📶 Força do sinal WiFi (RSSI)

## 📟 Cadastro de Dispositivos

### 🔄 Auto-cadastro (ESP32 com Sensores)
Os dispositivos do tipo `ESP32_SENSORES` se cadastram automaticamente quando enviam dados pela primeira vez:
- **Nome automático**: `ESP32_<ÚLTIMOS_6_DÍGITOS_MAC>`
- **Tipo automático**: `ESP32_SENSORES`
- **Status**: Online automaticamente
- **Associação**: Automaticamente vinculado ao usuário autenticado

### ⚠️ Cadastro Manual (ESP32-CAM)
Dispositivos do tipo `ESP32_CAM` devem ser cadastrados manualmente antes de enviar dados:
```bash
POST /api/v1/dispositivos
Authorization: Bearer <token>
Content-Type: application/json

{
  "mac_address": "24:6F:28:8A:1B:C3",
  "nome": "Câmera Setor A",
  "tipo": "ESP32_CAM", 
  "localizacao": "Setor de Alface Hidropônico"
}
```

### 📋 Listar Dispositivos
```bash
GET /api/v1/dispositivos
Authorization: Bearer <token>
```

**Validações**:
- ✅ Formato MAC válido (`00:11:22:33:44:55`)
- ✅ MAC único (não pode repetir)
- ✅ Tipos válidos: `ESP32_SENSORES` ou `ESP32_CAM`

## 📁 Estrutura do Projeto

```
backend/
├── config/
│   └── mongodb.js          # Configuração MongoDB
├── controllers-mongodb/     # Controladores MongoDB
│   ├── authController.js
│   ├── dashboardController.js
│   ├── dispositivoController.js
│   ├── leituraController.js
│   ├── alertaController.js
│   └── plantaController.js
├── models-mongodb/         # Modelos MongoDB
│   ├── User.js
│   ├── Dispositivo.js
│   ├── Leitura.js
│   ├── Planta.js
│   └── Alerta.js
├── middleware/
│   ├── auth-mongodb.js     # Middleware JWT MongoDB
│   └── errorHandler.js
├── routes/                 # Rotas da API
├── scripts/
├── server.js              # Ponto de entrada
└── package.json
```

## 🛠️ Instalação

### 1. Clonar e instalar dependências
```bash
git clone [seu-repositorio]
cd fazenda-hidroponica/backend
npm install
```

### 2. Configurar ambiente
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

**Variáveis de ambiente necessárias:**
```env
MONGODB_URI=mongodb://localhost:27017/fazenda-hidroponica
JWT_SECRET=seu_jwt_secret_super_seguro
PORT=3000
API_PREFIX=/api/v1
```

### 3. Iniciar servidor
```bash
# Desenvolvimento com auto-reload
npm run dev

# Produção
npm start
```

## 📡 Endpoints da API

### Para ESP32
```bash
# Enviar leituras dos sensores (requer autenticação)
POST /api/v1/leituras/sensores
Authorization: Bearer <token>

# Enviar foto da câmera (requer autenticação)  
POST /api/v1/leituras/camera
Authorization: Bearer <token>
```

### Para Dashboard
```bash
# Dashboard principal
GET /api/v1/dashboard/principal
Authorization: Bearer <token>

# Dashboard específico do dispositivo
GET /api/v1/dashboard/dispositivo/:id
Authorization: Bearer <token>

# Dashboard de plantas
GET /api/v1/dashboard/plantas
Authorization: Bearer <token>

# Histórico de leituras
GET /api/v1/leituras/:dispositivo_id/historico
Authorization: Bearer <token>

# Dados para gráficos
GET /api/v1/leituras/:dispositivo_id/grafico
Authorization: Bearer <token>

# Métricas resumidas
GET /api/v1/leituras/:dispositivo_id/metricas
Authorization: Bearer <token>
```

### Gestão de Dispositivos
```bash
# Listar dispositivos do usuário
GET /api/v1/dispositivos
Authorization: Bearer <token>

# Criar dispositivo manualmente
POST /api/v1/dispositivos
Authorization: Bearer <token>

# Buscar dispositivo específico
GET /api/v1/dispositivos/:id
Authorization: Bearer <token>
```

### Gestão de Plantas
```bash
# Listar plantas do usuário
GET /api/v1/plantas
Authorization: Bearer <token>

# Criar nova planta
POST /api/v1/plantas
Authorization: Bearer <token>

# Buscar planta específica
GET /api/v1/plantas/:id
Authorization: Bearer <token>

# Atualizar planta
PUT /api/v1/plantas/:id
Authorization: Bearer <token>

# Registrar colheita
POST /api/v1/plantas/:id/colheita
Authorization: Bearer <token>

# Histórico de crescimento
GET /api/v1/plantas/:id/crescimento
Authorization: Bearer <token>
```

### Sistema de Alertas
```bash
# Listar alertas
GET /api/v1/alertas
Authorization: Bearer <token>

# Resolver alerta
PUT /api/v1/alertas/:id/resolver
Authorization: Bearer <token>

# Estatísticas de alertas
GET /api/v1/alertas/estatisticas
Authorization: Bearer <token>
```

## 🔌 Configuração do ESP32

### ESP32 com Sensores
```json
{
  "mac": "24:6F:28:8A:1B:C2",
  "temp": 24.5,
  "umid": 65.2,
  "lux": 1250,
  "ph": 6.1,
  "cond": 1450.5,
  "nivel": 1,
  "bat": 85.5,
  "rssi": -65
}
```

### ESP32-CAM
```json
{
  "mac": "24:6F:28:8A:1B:C3",
  "altura_planta": 15.3,
  "foto_path": "fotos/setor_a/2024-01-14_10-30-45.jpg"
}
```

**Headers obrigatórios para ESP32:**
```
Content-Type: application/json
Authorization: Bearer <token_jwt_do_usuario>
```

## 🧪 Testando a API

### Testes automatizados
```bash
# Testar todos os endpoints
npm run test:api

# Testar conexão com MongoDB
GET http://localhost:3000/api/v1/test-db

# Health check
GET http://localhost:3000/api/v1/health
```

### Testes manuais com Thunder Client/Postman
1. **Registrar usuário**: `POST /api/v1/auth/registrar`
2. **Fazer login**: `POST /api/v1/auth/login` (salvar o token)
3. **Testar endpoints** usando o token no header `Authorization: Bearer <token>`

## 📊 Dashboard

Acesse o dashboard em: http://localhost:3000/api/v1/dashboard/principal

**Funcionalidades do dashboard:**
- 📈 Métricas em tempo real de todos os sensores
- 📊 Gráficos históricos com agregações MongoDB
- 🌱 Monitoramento de crescimento das plantas
- ⚠️ Sistema de alertas inteligentes
- 📱 Interface responsiva para mobile

## 🔧 Comandos Disponíveis

```bash
npm run dev          # Iniciar em desenvolvimento com nodemon
npm start            # Iniciar em produção
npm run test:api     # Testar endpoints da API
npm run lint         # Verificar qualidade do código
npm run format       # Formatar código automaticamente
```

## 🚀 Deploy para Produção

### 1. Configurar MongoDB em produção
```env
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/fazenda-hidroponica
```

### 2. Otimizações para produção
- Habilitar compression middleware
- Configurar CORS para domínios específicos
- Usar variáveis de ambiente para configurações sensíveis
- Configurar cluster mode para Node.js

### 3. Monitoramento
- MongoDB Atlas para monitoramento do banco
- PM2 para gerenciamento de processos
- Logging estruturado com Winston

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 🐛 Reportar Problemas

Use a [seção de issues] para reportar bugs ou sugerir novas features.

---

**Desenvolvido com ❤️ para a agricultura sustentável do futuro!** 