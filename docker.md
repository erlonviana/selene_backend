# 🚀 Como rodar o projeto com Docker (Guia Completo)

## 🧑‍💻 PASSO A PASSO PARA USUÁRIO NOVO

### 1. Clonar o projeto

```bash
git clone <url-do-repositorio>
cd nome-do-projeto
```

---

### 2. Criar o arquivo `.env`

Se existir `.env.example`:

```bash
cp .env.example .env
```

Ou criar manualmente com:

```env
MONGODB_URI=mongodb://mongo:27017/selene
JWT_SECRET=segredo
ADMIN_JWT_SECRET=segredo_admin
PORT=3000
```

⚠️ IMPORTANTE:
Se estiver usando Docker, use `mongo` (nome do serviço), NÃO `localhost`.

---

### 3. Subir o projeto (primeira vez)

```bash
docker-compose up --build
```

👉 Isso vai:

* Fazer o build da API
* Subir o MongoDB
* Conectar tudo automaticamente

---

### 4. Próximas execuções (mais rápido)

Depois da primeira vez:

```bash
docker-compose up
```

---

### 5. Testar se a API está funcionando

Abra no navegador:

```
http://localhost:3000/api/v1/health
```

Se retornar sucesso → está tudo funcionando ✅

---

### 6. Criar administrador (OBRIGATÓRIO)

Abra outro terminal e rode:

```bash
docker exec -it minha-api npm run admin:create
```

---

### 7. Fazer login como admin

Requisição:

```
POST http://localhost:3000/api/v1/admin/login
```

Body:

```json
{
  "email": "admin@selene.com",
  "senha": "admin123"
}
```

👉 Isso vai retornar o TOKEN de administrador

---

## 🧠 RESUMO RÁPIDO

* Primeira vez:

  ```
  docker-compose up --build
  ```

* Depois:

  ```
  docker-compose up
  ```

* Criar admin:

  ```
  docker exec -it minha-api npm run admin:create
  ```

* Fazer login → pegar token

---

## ⚠️ ERROS COMUNS

❌ Usar `localhost` no Mongo dentro do Docker
✔️ Use `mongo`

❌ Container não está rodando
✔️ Rode `docker-compose up`

❌ Criar admin fora do container
✔️ Sempre use `docker exec`

---

## ✅ Pronto!

Agora é só usar a API normalmente 🚀
