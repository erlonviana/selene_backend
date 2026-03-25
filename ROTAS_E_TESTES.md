# 🚀 Documentação de Rotas e Testes - API Fazenda Hidropônica

## 📋 Índice
1. [Informações Gerais](#informações-gerais)
2. [Autenticação](#autenticação)
3. [Health Check](#health-check)
4. [Autenticação (Auth)](#rotas-de-autenticacao-auth)
5. [Administração (Admin)](#rotas-de-administração-admin)
6. [Plantas](#rotas-de-plantas)
7. [Dispositivos](#rotas-de-dispositivos)
8. [Leituras](#rotas-de-leituras)
9. [Alertas](#rotas-de-alertas)
10. [Configuração de Alertas](#rotas-de-configuração-de-alertas)
11. [Dashboard](#rotas-de-dashboard)

---

## 📌 Informações Gerais

### URL Base
```
http://localhost:3000/api/v1
```

### Variáveis de Ambiente
```env
PORT=3000
API_PREFIX=/api/v1
MONGODB_URI=mongodb://localhost:27017/selene
JWT_SECRET=sua_chave_secreta
ADMIN_JWT_SECRET=sua_chave_admin_secreta
```

### Headers Padrão
```
Content-Type: application/json
Authorization: Bearer <TOKEN>
```

---

## 🔐 Autenticação

### Tipos de Autenticação

#### 1. **Autenticação de Usuário**
- Realizada via Bearer Token JWT
- Token obtido no endpoint `/auth/login`
- Válido para usuários normais

#### 2. **Autenticação Admin**
- Realizada via Bearer Token JWT Admin
- Token obtido no endpoint `/admin/login`
- Válido apenas para administradores

#### 3. **Sem Autenticação**
- Endpoints públicos para receber dados de sensores e câmeras (ESP32)

### Como Usar o Token
```bash
# Header Authorization
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Health Check

### GET /api/v1/health
Verifica se a API está funcionando

**Método:** `GET`  
**Autenticação:** Não  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "API da Fazenda Hidropônica está funcionando!",
  "timestamp": "2026-03-09T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/health
```

#### Teste com Fetch
```javascript
const response = await fetch('http://localhost:3000/api/v1/health');
const data = await response.json();
console.log(data);
```

---

## GET /api/v1/test-db
Verifica conexão com MongoDB

**Método:** `GET`  
**Autenticação:** Não  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Conexão com MongoDB verificada!",
  "status": "Conectado",
  "host": "localhost",
  "database": "selene"
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/test-db
```

---

## 🔑 Rotas de Autenticação (Auth)

### POST /api/v1/auth/registrar
Registrar novo usuário (requer autenticação admin)

**Método:** `POST`  
**Autenticação:** Admin Token (Header: `Authorization: Bearer <ADMIN_TOKEN>`)  
**Status Code:** `201`

#### Body (form-data)
```
nome (text, obrigatório): "João Silva"
email (text, obrigatório): "joao@example.com"
senha (text, obrigatório): "senha123"
foto (file, opcional): arquivo de imagem
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "user": {
    "_id": "676b3c1d...",
    "nome": "João Silva",
    "email": "joao@example.com",
    "fotoPerfil": "/fotos_perfil/1234567890.jpg"
  }
}
```

#### Respostas de Erro
```json
// Email já existe
{
  "success": false,
  "message": "Email já registrado"
}

// Campo obrigatório faltando
{
  "success": false,
  "message": "Nome, email e senha são obrigatórios"
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/registrar \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "nome=João Silva" \
  -F "email=joao@example.com" \
  -F "senha=senha123" \
  -F "foto=@/path/to/foto.jpg"
```

#### Teste com Fetch
```javascript
const formData = new FormData();
formData.append('nome', 'João Silva');
formData.append('email', 'joao@example.com');
formData.append('senha', 'senha123');
formData.append('foto', fileInput.files[0]);

const response = await fetch('http://localhost:3000/api/v1/auth/registrar', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <ADMIN_TOKEN>'
  },
  body: formData
});
const data = await response.json();
console.log(data);
```

---

### POST /api/v1/auth/login
Login de usuário

**Método:** `POST`  
**Autenticação:** Não  
**Status Code:** `200`

#### Body (JSON)
```json
{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "676b3c1d...",
    "nome": "João Silva",
    "email": "joao@example.com"
  }
}
```

#### Respostas de Erro
```json
// Usuário não encontrado
{
  "success": false,
  "message": "Usuário não encontrado"
}

// Senha incorreta
{
  "success": false,
  "message": "Senha incorreta"
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

#### Teste com Fetch
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'joao@example.com',
    senha: 'senha123'
  })
});
const data = await response.json();
console.log('Token:', data.token);
localStorage.setItem('token', data.token);
```

---

### GET /api/v1/auth/perfil
Obter perfil do usuário logado

**Método:** `GET`  
**Autenticação:** User Token  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Perfil recuperado",
  "user": {
    "_id": "676b3c1d...",
    "nome": "João Silva",
    "email": "joao@example.com",
    "fotoPerfil": "/fotos_perfil/1234567890.jpg",
    "criadoEm": "2026-03-09T10:00:00.000Z"
  }
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/auth/perfil \
  -H "Authorization: Bearer <USER_TOKEN>"
```

#### Teste com Fetch
```javascript
const response = await fetch('http://localhost:3000/api/v1/auth/perfil', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
const data = await response.json();
console.log(data);
```

---

### PUT /api/v1/auth/perfil
Atualizar perfil do usuário

**Método:** `PUT`  
**Autenticação:** User Token  
**Status Code:** `200`

#### Body (form-data - tudo opcional)
```
nome (text): "João Silva Atualizado"
foto (file): arquivo de imagem
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Perfil atualizado com sucesso",
  "user": {
    "_id": "676b3c1d...",
    "nome": "João Silva Atualizado",
    "fotoPerfil": "/fotos_perfil/9876543210.jpg"
  }
}
```

#### Teste com cURL
```bash
curl -X PUT http://localhost:3000/api/v1/auth/perfil \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -F "nome=João Silva Atualizado" \
  -F "foto=@/path/to/nova_foto.jpg"
```

#### Teste com Fetch
```javascript
const formData = new FormData();
formData.append('nome', 'João Silva Atualizado');
if (fileInput.files[0]) {
  formData.append('foto', fileInput.files[0]);
}

const response = await fetch('http://localhost:3000/api/v1/auth/perfil', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: formData
});
const data = await response.json();
console.log(data);
```

---

## 👨‍💼 Rotas de Administração (Admin)
*Criar admin padrão
npm run admin:create


### POST /api/v1/admin/login
Login de administrador

**Método:** `POST`  
**Autenticação:** Não  
**Status Code:** `200`

#### Body (JSON)
```json
{
  "email": "admin@example.com",
  "senha": "admin123"
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Login admin realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "_id": "676b2a1d...",
    "nome": "Administrador",
    "email": "admin@example.com"
  }
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "senha": "admin123"
  }'
```

---

### POST /api/v1/admin/criar
Criar novo administrador (requer autenticação admin)

**Método:** `POST`  
**Autenticação:** Admin Token  
**Status Code:** `201`

#### Body (JSON)
```json
{
  "nome": "Novo Admin",
  "email": "novoadmin@example.com",
  "senha": "senhaSegura123"
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Administrador criado com sucesso",
  "admin": {
    "_id": "676b3e1d...",
    "nome": "Novo Admin",
    "email": "novoadmin@example.com"
  }
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/admin/criar \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Novo Admin",
    "email": "novoadmin@example.com",
    "senha": "senhaSegura123"
  }'
```

---

### GET /api/v1/admin/listar
Listar todos administradores (requer autenticação admin)

**Método:** `GET`  
**Autenticação:** Admin Token  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Administradores listados",
  "admins": [
    {
      "_id": "676b2a1d...",
      "nome": "Administrador",
      "email": "admin@example.com",
      "criadoEm": "2026-03-09T09:00:00.000Z"
    },
    {
      "_id": "676b3e1d...",
      "nome": "Novo Admin",
      "email": "novoadmin@example.com",
      "criadoEm": "2026-03-09T10:00:00.000Z"
    }
  ]
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/admin/listar \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

### GET /api/v1/admin/verificar
Verificar token admin (requer autenticação admin)

**Método:** `GET`  
**Autenticação:** Admin Token  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Token válido",
  "admin": {
    "_id": "676b2a1d...",
    "nome": "Administrador",
    "email": "admin@example.com"
  }
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/admin/verificar \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

---

## 🌱 Rotas de Plantas

### GET /api/v1/plantas
Listar todas plantas

**Método:** `GET`  
**Autenticação:** Não  
**Query Parameters:**
- `page` (opcional): número da página (padrão: 1)
- `limit` (opcional): itens por página (padrão: 10)

**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Plantas listadas",
  "plantas": [
    {
      "_id": "676b4a1d...",
      "nome": "Alface",
      "nomeCientifico": "Lactuca sativa",
      "descricao": "Hortaliça folhosa",
      "tempoCrescimento": 45,
      "diasParaColheita": 30,
      "fotoPlanta": "/fotos_plantas/alface.jpg"
    }
  ],
  "total": 1,
  "pagina": 1,
  "totalPaginas": 1
}
```

#### Teste com cURL
```bash
curl -X GET "http://localhost:3000/api/v1/plantas?page=1&limit=10"
```

#### Teste com Fetch
```javascript
const response = await fetch('http://localhost:3000/api/v1/plantas?page=1&limit=10');
const data = await response.json();
console.log(data);
```

---

### GET /api/v1/plantas/:id
Buscar planta específica

**Método:** `GET`  
**Autenticação:** Não  
**Parâmetro de Rota:** `id` - ID MongoDB da planta  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Planta encontrada",
  "planta": {
    "_id": "676b4a1d...",
    "nome": "Alface",
    "nomeCientifico": "Lactuca sativa",
    "descricao": "Hortaliça folhosa",
    "tempoCrescimento": 45,
    "diasParaColheita": 30,
    "fotoPlanta": "/fotos_plantas/alface.jpg",
    "criadoEm": "2026-03-09T10:00:00.000Z"
  }
}
```

#### Teste com cURL
```bash
curl -X GET "http://localhost:3000/api/v1/plantas/676b4a1d..."
```

---

### POST /api/v1/plantas
Criar nova planta

**Método:** `POST`  
**Autenticação:** Não  
**Status Code:** `201`

#### Body (form-data)
```
nome (text, obrigatório): "Alface"
nomeCientifico (text, obrigatório): "Lactuca sativa"
descricao (text): "Hortaliça folhosa"
tempoCrescimento (number): 45
diasParaColheita (number): 30
fotoPlanta (file, opcional): arquivo de imagem
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Planta criada com sucesso",
  "planta": {
    "_id": "676b4a1d...",
    "nome": "Alface",
    "nomeCientifico": "Lactuca sativa",
    "descricao": "Hortaliça folhosa",
    "tempoCrescimento": 45,
    "diasParaColheita": 30,
    "fotoPlanta": "/fotos_plantas/1234567890.jpg"
  }
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/plantas \
  -F "nome=Alface" \
  -F "nomeCientifico=Lactuca sativa" \
  -F "descricao=Hortaliça folhosa" \
  -F "tempoCrescimento=45" \
  -F "diasParaColheita=30" \
  -F "fotoPlanta=@/path/to/foto.jpg"
```

---

### PUT /api/v1/plantas/:id
Atualizar planta

**Método:** `PUT`  
**Autenticação:** Não  
**Parâmetro de Rota:** `id`  
**Status Code:** `200`

#### Body (form-data - tudo opcional)
```
nome (text): "Alface Atualizada"
nomeCientifico (text): "Lactuca sativa"
descricao (text): "Descrição atualizada"
tempoCrescimento (number): 45
diasParaColheita (number): 30
fotoPlanta (file): nova imagem
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Planta atualizada com sucesso",
  "planta": {
    "_id": "676b4a1d...",
    "nome": "Alface Atualizada",
    "nomeCientifico": "Lactuca sativa"
  }
}
```

#### Teste com cURL
```bash
curl -X PUT http://localhost:3000/api/v1/plantas/676b4a1d... \
  -F "nome=Alface Atualizada"
```

---

### POST /api/v1/plantas/:id/colheita
Registrar colheita

**Método:** `POST`  
**Autenticação:** Não  
**Parâmetro de Rota:** `id`  
**Status Code:** `201`

#### Body (JSON)
```json
{
  "dataColheita": "2026-03-09T10:30:00Z",
  "quantidade": 25,
  "unidade": "unidades"
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Colheita registrada com sucesso",
  "colheita": {
    "_id": "676b5a1d...",
    "plantaId": "676b4a1d...",
    "dataColheita": "2026-03-09T10:30:00.000Z",
    "quantidade": 25,
    "unidade": "unidades"
  }
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/plantas/676b4a1d.../colheita \
  -H "Content-Type: application/json" \
  -d '{
    "dataColheita": "2026-03-09T10:30:00Z",
    "quantidade": 25,
    "unidade": "unidades"
  }'
```

---

### GET /api/v1/plantas/:id/crescimento
Histórico de crescimento

**Método:** `GET`  
**Autenticação:** Não  
**Parâmetro de Rota:** `id`  
**Query Parameters:**
- `dias` (opcional): últimos N dias (padrão: 30)

**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Histórico de crescimento",
  "crescimento": [
    {
      "data": "2026-03-01T10:00:00.000Z",
      "altura": 10,
      "peso": 50,
      "folhas": 4
    },
    {
      "data": "2026-03-08T10:00:00.000Z",
      "altura": 15,
      "peso": 75,
      "folhas": 6
    }
  ]
}
```

#### Teste com cURL
```bash
curl -X GET "http://localhost:3000/api/v1/plantas/676b4a1d.../crescimento?dias=30"
```

---

## 📱 Rotas de Dispositivos

### GET /api/v1/dispositivos
Listar todos dispositivos

**Método:** `GET`  
**Autenticação:** User Token  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Dispositivos listados",
  "dispositivos": [
    {
      "_id": "676b6a1d...",
      "nome": "Sensor 01",
      "tipo": "sensor",
      "modeloDisp": "DHT22",
      "ip": "192.168.1.100",
      "status": "online",
      "ultimaLeitura": "2026-03-09T10:30:00.000Z"
    }
  ]
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/dispositivos \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

### GET /api/v1/dispositivos/:id
Buscar dispositivo específico

**Método:** `GET`  
**Autenticação:** User Token  
**Parâmetro de Rota:** `id`  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Dispositivo encontrado",
  "dispositivo": {
    "_id": "676b6a1d...",
    "nome": "Sensor 01",
    "tipo": "sensor",
    "modeloDisp": "DHT22",
    "ip": "192.168.1.100",
    "status": "online",
    "ultimaLeitura": "2026-03-09T10:30:00.000Z",
    "criadoEm": "2026-03-09T09:00:00.000Z"
  }
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/dispositivos/676b6a1d... \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

### POST /api/v1/dispositivos
Criar novo dispositivo

**Método:** `POST`  
**Autenticação:** User Token  
**Status Code:** `201`

#### Body (JSON)
```json
{
  "nome": "Sensor 01",
  "tipo": "sensor",
  "modeloDisp": "DHT22",
  "ip": "192.168.1.100",
  "plantaId": "676b4a1d..."
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Dispositivo criado com sucesso",
  "dispositivo": {
    "_id": "676b6a1d...",
    "nome": "Sensor 01",
    "tipo": "sensor",
    "modeloDisp": "DHT22",
    "ip": "192.168.1.100",
    "status": "offline",
    "plantaId": "676b4a1d..."
  }
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/dispositivos \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Sensor 01",
    "tipo": "sensor",
    "modeloDisp": "DHT22",
    "ip": "192.168.1.100",
    "plantaId": "676b4a1d..."
  }'
```

---

### PUT /api/v1/dispositivos/:id
Atualizar dispositivo

**Método:** `PUT`  
**Autenticação:** User Token  
**Parâmetro de Rota:** `id`  
**Status Code:** `200`

#### Body (JSON - tudo opcional)
```json
{
  "nome": "Sensor 01 Atualizado",
  "ip": "192.168.1.101",
  "plantaId": "676b4a1d..."
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Dispositivo atualizado com sucesso",
  "dispositivo": {
    "_id": "676b6a1d...",
    "nome": "Sensor 01 Atualizado",
    "ip": "192.168.1.101"
  }
}
```

#### Teste com cURL
```bash
curl -X PUT http://localhost:3000/api/v1/dispositivos/676b6a1d... \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Sensor 01 Atualizado"
  }'
```

---

### PATCH /api/v1/dispositivos/:id/status
Atualizar status online/offline

**Método:** `PATCH`  
**Autenticação:** Não  
**Parâmetro de Rota:** `id`  
**Status Code:** `200`

#### Body (JSON)
```json
{
  "status": "online"
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Status atualizado",
  "dispositivo": {
    "_id": "676b6a1d...",
    "nome": "Sensor 01",
    "status": "online",
    "ultimaLeitura": "2026-03-09T10:35:00.000Z"
  }
}
```

#### Teste com cURL
```bash
curl -X PATCH http://localhost:3000/api/v1/dispositivos/676b6a1d.../status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "online"
  }'
```

---

## 📊 Rotas de Leituras

### POST /api/v1/leituras/sensores
Receber leitura dos sensores (ESP32) - PÚBLICA

**Método:** `POST`  
**Autenticação:** Não  
**Status Code:** `201`

#### Body (JSON)
```json
{
  "dispositivoId": "676b6a1d...",
  "temperatura": 25.5,
  "umidade": 65,
  "ph": 7.0,
  "ec": 1.5
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Leitura registrada",
  "leitura": {
    "_id": "676b7a1d...",
    "dispositivoId": "676b6a1d...",
    "temperatura": 25.5,
    "umidade": 65,
    "ph": 7.0,
    "ec": 1.5,
    "timestamp": "2026-03-09T10:36:00.000Z"
  }
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/leituras/sensores \
  -H "Content-Type: application/json" \
  -d '{
    "dispositivoId": "676b6a1d...",
    "temperatura": 25.5,
    "umidade": 65,
    "ph": 7.0,
    "ec": 1.5
  }'
```

---

### POST /api/v1/leituras/sensores/auth
Receber leitura com autenticação (App)

**Método:** `POST`  
**Autenticação:** User Token  
**Status Code:** `201`

#### Body (JSON)
```json
{
  "dispositivoId": "676b6a1d...",
  "temperatura": 25.5,
  "umidade": 65,
  "ph": 7.0,
  "ec": 1.5
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Leitura registrada",
  "leitura": {
    "_id": "676b7a1d...",
    "dispositivoId": "676b6a1d...",
    "temperatura": 25.5,
    "umidade": 65,
    "ph": 7.0,
    "ec": 1.5,
    "timestamp": "2026-03-09T10:36:00.000Z"
  }
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/leituras/sensores/auth \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "dispositivoId": "676b6a1d...",
    "temperatura": 25.5,
    "umidade": 65
  }'
```

---

### POST /api/v1/leituras/camera
Receber foto da câmera (ESP32-CAM) - PÚBLICA

**Método:** `POST`  
**Autenticação:** Não  
**Status Code:** `201`

#### Body (form-data)
```
dispositivoId (text, obrigatório): "676b6a1d..."
imagem (file, obrigatório): arquivo de imagem
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Foto registrada",
  "foto": {
    "_id": "676b8a1d...",
    "dispositivoId": "676b6a1d...",
    "caminhoFoto": "/fotos_plantas/1234567890.jpg",
    "timestamp": "2026-03-09T10:37:00.000Z"
  }
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/leituras/camera \
  -F "dispositivoId=676b6a1d..." \
  -F "imagem=@/path/to/image.jpg"
```

---

### POST /api/v1/leituras/camera/auth
Receber foto com autenticação (App)

**Método:** `POST`  
**Autenticação:** User Token  
**Status Code:** `201`

#### Body (form-data)
```
dispositivoId (text, obrigatório): "676b6a1d..."
imagem (file, obrigatório): arquivo de imagem
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Foto registrada",
  "foto": {
    "_id": "676b8a1d...",
    "dispositivoId": "676b6a1d...",
    "caminhoFoto": "/fotos_plantas/1234567890.jpg",
    "timestamp": "2026-03-09T10:37:00.000Z"
  }
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/leituras/camera/auth \
  -H "Authorization: Bearer <USER_TOKEN>" \
  -F "dispositivoId=676b6a1d..." \
  -F "imagem=@/path/to/image.jpg"
```

---

### GET /api/v1/leituras/:dispositivo_id/historico
Histórico de leituras

**Método:** `GET`  
**Autenticação:** User Token  
**Parâmetro de Rota:** `dispositivo_id`  
**Query Parameters:**
- `dias` (opcional): últimos N dias (padrão: 7)
- `limite` (opcional): máximo de registros (padrão: 100)

**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Histórico de leituras",
  "leituras": [
    {
      "_id": "676b7a1d...",
      "dispositivoId": "676b6a1d...",
      "temperatura": 25.5,
      "umidade": 65,
      "ph": 7.0,
      "ec": 1.5,
      "timestamp": "2026-03-09T10:36:00.000Z"
    }
  ],
  "total": 1
}
```

#### Teste com cURL
```bash
curl -X GET "http://localhost:3000/api/v1/leituras/676b6a1d.../historico?dias=7&limite=100" \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

### GET /api/v1/leituras/:dispositivo_id/grafico
Dados para gráficos (agrupados)

**Método:** `GET`  
**Autenticação:** User Token  
**Parâmetro de Rota:** `dispositivo_id`  
**Query Parameters:**
- `periodo` (opcional): "hora", "dia", "semana" (padrão: "dia")

**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Dados para gráfico",
  "dados": [
    {
      "timestamp": "2026-03-09T10:00:00.000Z",
      "temperatura": {
        "minima": 24.5,
        "maxima": 26.5,
        "media": 25.5
      },
      "umidade": {
        "minima": 60,
        "maxima": 70,
        "media": 65
      }
    }
  ]
}
```

#### Teste com cURL
```bash
curl -X GET "http://localhost:3000/api/v1/leituras/676b6a1d.../grafico?periodo=dia" \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

### GET /api/v1/leituras/:dispositivo_id/metricas
Métricas resumidas

**Método:** `GET`  
**Autenticação:** User Token  
**Parâmetro de Rota:** `dispositivo_id`  
**Query Parameters:**
- `dias` (opcional): últimos N dias (padrão: 30)

**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Métricas do dispositivo",
  "metricas": {
    "temperatura": {
      "media": 25.5,
      "minima": 20.0,
      "maxima": 30.0
    },
    "umidade": {
      "media": 65,
      "minima": 40,
      "maxima": 80
    },
    "ph": {
      "media": 7.0,
      "minima": 6.5,
      "maxima": 7.5
    },
    "leiturasTotais": 240
  }
}
```

#### Teste com cURL
```bash
curl -X GET "http://localhost:3000/api/v1/leituras/676b6a1d.../metricas?dias=30" \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

## 🚨 Rotas de Alertas

### GET /api/v1/alertas/estatisticas
Estatísticas de alertas

**Método:** `GET`  
**Autenticação:** Não  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Estatísticas de alertas",
  "estatisticas": {
    "totalAlertas": 15,
    "naoResolvidos": 3,
    "resolvidos": 12,
    "ultimoAlerta": "2026-03-09T10:30:00.000Z"
  }
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/alertas/estatisticas
```

---

### GET /api/v1/alertas
Listar alertas

**Método:** `GET`  
**Autenticação:** Não  
**Query Parameters:**
- `resolvido` (opcional): true/false
- `tipo` (opcional): tipo de alerta
- `limite` (opcional): máximo de registros (padrão: 50)

**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Alertas listados",
  "alertas": [
    {
      "_id": "676b9a1d...",
      "dispositivoId": "676b6a1d...",
      "tipo": "temperatura_alta",
      "mensagem": "Temperatura acima do esperado",
      "severidade": "alta",
      "valor": 35,
      "limite": 30,
      "resolvido": false,
      "dataCriacao": "2026-03-09T10:30:00.000Z"
    }
  ],
  "total": 1
}
```

#### Teste com cURL
```bash
curl -X GET "http://localhost:3000/api/v1/alertas?resolvido=false&limite=50"
```

---

### PATCH /api/v1/alertas/:id/resolver
Marcar alerta como resolvido

**Método:** `PATCH`  
**Autenticação:** Não  
**Parâmetro de Rota:** `id`  
**Status Code:** `200`

#### Body (JSON - opcional)
```json
{
  "notasResolucao": "Temperatura normalizada"
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Alerta resolvido",
  "alerta": {
    "_id": "676b9a1d...",
    "dispositivoId": "676b6a1d...",
    "tipo": "temperatura_alta",
    "resolvido": true,
    "dataResolucao": "2026-03-09T10:40:00.000Z",
    "notasResolucao": "Temperatura normalizada"
  }
}
```

#### Teste com cURL
```bash
curl -X PATCH http://localhost:3000/api/v1/alertas/676b9a1d.../resolver \
  -H "Content-Type: application/json" \
  -d '{
    "notasResolucao": "Temperatura normalizada"
  }'
```

---

## ⚙️ Rotas de Configuração de Alertas

### GET /api/v1/configuracoes-alerta
Listar todas configurações de alerta

**Método:** `GET`  
**Autenticação:** Não  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Configurações listadas",
  "configuracoes": [
    {
      "_id": "676baa1d...",
      "tipo": "temperatura",
      "parametro": "temperatura_maxima",
      "valor": 30,
      "unidade": "°C",
      "severidade": "alta",
      "ativo": true
    }
  ]
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/configuracoes-alerta
```

---

### GET /api/v1/configuracoes-alerta/:id
Buscar configuração específica

**Método:** `GET`  
**Autenticação:** Não  
**Parâmetro de Rota:** `id`  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Configuração encontrada",
  "configuracao": {
    "_id": "676baa1d...",
    "tipo": "temperatura",
    "parametro": "temperatura_maxima",
    "valor": 30,
    "unidade": "°C",
    "severidade": "alta",
    "ativo": true,
    "criadoEm": "2026-03-09T09:00:00.000Z"
  }
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/configuracoes-alerta/676baa1d...
```

---

### GET /api/v1/configuracoes-alerta/dispositivo/:dispositivoId
Configurações por dispositivo

**Método:** `GET`  
**Autenticação:** Não  
**Parâmetro de Rota:** `dispositivoId`  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Configurações do dispositivo",
  "configuracoes": [
    {
      "_id": "676baa1d...",
      "dispositivoId": "676b6a1d...",
      "tipo": "temperatura",
      "parametro": "temperatura_maxima",
      "valor": 30,
      "ativo": true
    }
  ]
}
```

#### Teste com cURL
```bash
curl -X GET "http://localhost:3000/api/v1/configuracoes-alerta/dispositivo/676b6a1d..."
```

---

### POST /api/v1/configuracoes-alerta
Criar configuração de alerta

**Método:** `POST`  
**Autenticação:** Não  
**Status Code:** `201`

#### Body (JSON)
```json
{
  "dispositivoId": "676b6a1d...",
  "tipo": "temperatura",
  "parametro": "temperatura_maxima",
  "valor": 30,
  "unidade": "°C",
  "severidade": "alta"
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Configuração criada com sucesso",
  "configuracao": {
    "_id": "676baa1d...",
    "dispositivoId": "676b6a1d...",
    "tipo": "temperatura",
    "parametro": "temperatura_maxima",
    "valor": 30,
    "unidade": "°C",
    "severidade": "alta",
    "ativo": true
  }
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/configuracoes-alerta \
  -H "Content-Type: application/json" \
  -d '{
    "dispositivoId": "676b6a1d...",
    "tipo": "temperatura",
    "parametro": "temperatura_maxima",
    "valor": 30,
    "unidade": "°C",
    "severidade": "alta"
  }'
```

---

### PUT /api/v1/configuracoes-alerta/:id
Atualizar configuração de alerta

**Método:** `PUT`  
**Autenticação:** Não  
**Parâmetro de Rota:** `id`  
**Status Code:** `200`

#### Body (JSON - tudo opcional)
```json
{
  "valor": 32,
  "severidade": "media",
  "ativo": false
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Configuração atualizada com sucesso",
  "configuracao": {
    "_id": "676baa1d...",
    "tipo": "temperatura",
    "parametro": "temperatura_maxima",
    "valor": 32,
    "severidade": "media",
    "ativo": false
  }
}
```

#### Teste com cURL
```bash
curl -X PUT http://localhost:3000/api/v1/configuracoes-alerta/676baa1d... \
  -H "Content-Type: application/json" \
  -d '{
    "valor": 32,
    "severidade": "media"
  }'
```

---

### DELETE /api/v1/configuracoes-alerta/:id
Deletar configuração de alerta

**Método:** `DELETE`  
**Autenticação:** Não  
**Parâmetro de Rota:** `id`  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Configuração deletada com sucesso"
}
```

#### Teste com cURL
```bash
curl -X DELETE http://localhost:3000/api/v1/configuracoes-alerta/676baa1d...
```

---

### POST /api/v1/configuracoes-alerta/padrao/:tipo
Criar configuração padrão do sistema

**Método:** `POST`  
**Autenticação:** Não  
**Parâmetro de Rota:** `tipo` - temperatura, umidade, ph, ec  
**Status Code:** `201`

#### Body (JSON)
```json
{
  "parametro": "temperatura_maxima",
  "valor": 30,
  "unidade": "°C",
  "severidade": "alta"
}
```

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Configuração padrão criada",
  "configuracao": {
    "_id": "676bab1d...",
    "tipo": "temperatura",
    "parametro": "temperatura_maxima",
    "valor": 30,
    "isPadrao": true
  }
}
```

#### Teste com cURL
```bash
curl -X POST http://localhost:3000/api/v1/configuracoes-alerta/padrao/temperatura \
  -H "Content-Type: application/json" \
  -d '{
    "parametro": "temperatura_maxima",
    "valor": 30,
    "unidade": "°C",
    "severidade": "alta"
  }'
```

---

## 📈 Rotas de Dashboard

### GET /api/v1/dashboard/principal
Dashboard principal

**Método:** `GET`  
**Autenticação:** User Token  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Dashboard principal",
  "dados": {
    "dispositivosAtivos": 5,
    "dispositivosInativos": 2,
    "plantasEmCrescimento": 8,
    "colheitasEste": 0,
    "alertasAtivos": 3,
    "ultimasLeituras": [
      {
        "dispositivoNome": "Sensor 01",
        "temperatura": 25.5,
        "umidade": 65,
        "timestamp": "2026-03-09T10:36:00.000Z"
      }
    ]
  }
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/principal \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

### GET /api/v1/dashboard/dispositivo/:id
Dashboard específico do dispositivo

**Método:** `GET`  
**Autenticação:** User Token  
**Parâmetro de Rota:** `id`  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Dashboard do dispositivo",
  "dados": {
    "dispositivo": {
      "_id": "676b6a1d...",
      "nome": "Sensor 01",
      "status": "online",
      "ultimaLeitura": "2026-03-09T10:36:00.000Z"
    },
    "ultimaLeitura": {
      "temperatura": 25.5,
      "umidade": 65,
      "ph": 7.0,
      "ec": 1.5
    },
    "leituras24h": {
      "temperatura": {
        "minima": 20.0,
        "maxima": 30.0,
        "media": 25.5
      },
      "umidade": {
        "minima": 40,
        "maxima": 80,
        "media": 65
      }
    },
    "alertasAtivos": 0
  }
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/dispositivo/676b6a1d... \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

### GET /api/v1/dashboard/plantas
Dashboard de plantas

**Método:** `GET`  
**Autenticação:** User Token  
**Status Code:** `200`

#### Resposta de Sucesso
```json
{
  "success": true,
  "message": "Dashboard de plantas",
  "dados": {
    "plantasEmCrescimento": 8,
    "plantasParaColher": 2,
    "plantasColhidas": 15,
    "plantas": [
      {
        "_id": "676b4a1d...",
        "nome": "Alface",
        "status": "crescendo",
        "diasRestantes": 15,
        "fotoPerfil": "/fotos_plantas/alface.jpg"
      }
    ]
  }
}
```

#### Teste com cURL
```bash
curl -X GET http://localhost:3000/api/v1/dashboard/plantas \
  -H "Authorization: Bearer <USER_TOKEN>"
```

---

## 🔍 Códigos de Status HTTP Comuns

| Código | Sigla | Significado |
|--------|-------|-------------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 204 | No Content | Requisição bem-sucedida sem conteúdo |
| 400 | Bad Request | Requisição inválida |
| 401 | Unauthorized | Autenticação necessária |
| 403 | Forbidden | Acesso negado |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro no servidor |

---

## 🛠️ Variáveis de Exemplo

### IDs (MongoDB ObjectId)
```
"676b3c1d..." = ID válido de usuário/planta/dispositivo
```

### Tokens
```
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." = Token JWT válido
```

### Endpoints de Upload
- `/fotos_perfil` - Fotos de perfil de usuário
- `/fotos_plantas` - Fotos de plantas
- `/fotos_cogumelos` - Fotos de cogumelos (se aplicável)

---

## 📝 Notas Importantes

1. **Autenticação**: A maioria das rotas que manipulam dados do usuário requer autenticação
2. **Públicas**: Rotas de leitura de sensores e câmeras são públicas para ESP32
3. **Headers**: Sempre envie `Content-Type: application/json` para requisições JSON
4. **Uploads**: Use `form-data` para enviar arquivos
5. **Limites**: Máximo 10MB por requisição (arquivo)
6. **Paginação**: Use `page` e `limit` para listar resultados

---

## 📞 Suporte

Para dúvidas ou problemas com a API, consulte os logs do servidor:
```bash
npm start
```

Última atualização: 09/03/2026
