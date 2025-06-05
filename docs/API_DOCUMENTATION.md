# Documentação da API ThunderBet

## Visão Geral

A API ThunderBet é uma plataforma de apostas online que oferece funcionalidades completas para gerenciamento de usuários, jogos, apostas, transações financeiras e sistema de recompensas.

**Base URL:** `https://money2025-thunder03.krkzfx.easypanel.host`

## Autenticação

A API utiliza JWT (JSON Web Tokens) para autenticação. O token deve ser incluído no header `Authorization` como `Bearer <token>`.

### Headers Necessários
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 🔐 Autenticação (`/api/auth`)

### POST `/api/auth/register`
**Descrição:** Registra um novo usuário na plataforma

**Acesso:** Público

**Parâmetros do Body:**
```json
{
  "phone": "string (obrigatório)",
  "password": "string (obrigatório, min: 6 caracteres)",
  "username": "string (opcional)",
  "email": "string (opcional)",
  "fullName": "string (opcional)",
  "cpf": "string (opcional)"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "phone": "string",
    "username": "string",
    "email": "string",
    "name": "string",
    "role": "USER",
    "token": "string"
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "Telefone já cadastrado"
}
```

### POST `/api/auth/login`
**Descrição:** Realiza login do usuário

**Acesso:** Público

**Parâmetros do Body:**
```json
{
  "phone": "string (obrigatório)",
  "password": "string (obrigatório)"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "phone": "string",
    "username": "string",
    "email": "string",
    "name": "string",
    "role": "USER",
    "token": "string"
  }
}
```

**Resposta de Erro (401):**
```json
{
  "success": false,
  "message": "Credenciais inválidas"
}
```

### GET `/api/auth/profile`
**Descrição:** Obtém o perfil do usuário autenticado

**Acesso:** Privado (requer token)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "phone": "string",
    "username": "string",
    "email": "string",
    "name": "string",
    "cpf": "string",
    "balance": "number",
    "location": "string",
    "role": "string",
    "status": "string",
    "lastLogin": "date",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

---

## 👤 Usuários (`/api/users`)

### GET `/api/users/profile`
**Descrição:** Obtém o perfil do usuário logado

**Acesso:** Privado (requer token)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "name": "string",
    "phone": "string",
    "cpf": "string",
    "balance": "number",
    "location": "string",
    "role": "string",
    "status": "string",
    "lastLogin": "date",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### PUT `/api/users/profile`
**Descrição:** Atualiza o perfil do usuário logado

**Acesso:** Privado (requer token)

**Parâmetros do Body:**
```json
{
  "name": "string (opcional)",
  "email": "string (opcional)",
  "location": "string (opcional)"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Perfil atualizado com sucesso",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "name": "string",
    "phone": "string",
    "cpf": "string",
    "balance": "number",
    "location": "string",
    "role": "string",
    "status": "string"
  }
}
```

### GET `/api/users` (Admin)
**Descrição:** Lista todos os usuários com paginação e filtros

**Acesso:** Privado (requer token + permissão de admin)

**Query Parameters:**
- `page`: number (padrão: 1)
- `limit`: number (padrão: 10)
- `search`: string (busca por telefone, username ou nome)
- `status`: string (active, inactive, suspended)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "count": "number",
  "total": "number",
  "pages": "number",
  "currentPage": "number",
  "users": [
    {
      "id": "string",
      "username": "string",
      "email": "string",
      "name": "string",
      "phone": "string",
      "cpf": "string",
      "balance": "number",
      "location": "string",
      "role": "string",
      "status": "string",
      "lastLogin": "date",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

### GET `/api/users/:id` (Admin)
**Descrição:** Obtém um usuário específico por ID

**Acesso:** Privado (requer token + permissão de admin)

**Parâmetros da URL:**
- `id`: string (ID do usuário)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "name": "string",
    "phone": "string",
    "cpf": "string",
    "balance": "number",
    "location": "string",
    "role": "string",
    "status": "string",
    "lastLogin": "date",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### PUT `/api/users/:id` (Admin)
**Descrição:** Atualiza um usuário específico

**Acesso:** Privado (requer token + permissão de admin)

**Parâmetros da URL:**
- `id`: string (ID do usuário)

**Parâmetros do Body:**
```json
{
  "fullName": "string (opcional)",
  "email": "string (opcional)",
  "phone": "string (opcional)",
  "cpf": "string (opcional)",
  "status": "string (opcional)",
  "role": "string (opcional)",
  "balance": "number (opcional)",
  "location": "string (opcional)"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "name": "string",
    "phone": "string",
    "cpf": "string",
    "status": "string",
    "role": "string",
    "balance": "number",
    "location": "string"
  }
}
```

### DELETE `/api/users/:id` (Admin)
**Descrição:** Remove um usuário

**Acesso:** Privado (requer token + permissão de admin)

**Parâmetros da URL:**
- `id`: string (ID do usuário)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Usuário removido com sucesso"
}
```

---

## 🎮 Jogos (`/api/games`)

### GET `/api/games`
**Descrição:** Lista todos os jogos com paginação e filtros

**Acesso:** Público

**Query Parameters:**
- `page`: number (padrão: 1)
- `limit`: number (padrão: 10)
- `search`: string (busca por nome ou provedor)
- `category`: string (slots, table, live, crash, sport, other)
- `provider`: string (nome do provedor)
- `active`: boolean (padrão: true)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "count": "number",
  "total": "number",
  "pages": "number",
  "currentPage": "number",
  "games": [
    {
      "id": "string",
      "name": "string",
      "provider": "string",
      "category": "string",
      "imageUrl": "string",
      "description": "string",
      "minBet": "number",
      "maxBet": "number",
      "rtp": "number",
      "isActive": "boolean",
      "isFeatured": "boolean",
      "popularity": "number",
      "gameConfig": "object",
      "createdAt": "date",
      "updatedAt": "date"
    }
  ]
}
```

### GET `/api/games/featured`
**Descrição:** Obtém jogos em destaque

**Acesso:** Público

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "count": "number",
  "games": [
    {
      "id": "string",
      "name": "string",
      "provider": "string",
      "category": "string",
      "imageUrl": "string",
      "description": "string",
      "minBet": "number",
      "maxBet": "number",
      "rtp": "number",
      "isActive": "boolean",
      "isFeatured": "boolean",
      "popularity": "number",
      "gameConfig": "object"
    }
  ]
}
```

### GET `/api/games/:id`
**Descrição:** Obtém um jogo específico por ID

**Acesso:** Público

**Parâmetros da URL:**
- `id`: string (ID do jogo)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "game": {
    "id": "string",
    "name": "string",
    "provider": "string",
    "category": "string",
    "imageUrl": "string",
    "description": "string",
    "minBet": "number",
    "maxBet": "number",
    "rtp": "number",
    "isActive": "boolean",
    "isFeatured": "boolean",
    "popularity": "number",
    "gameConfig": "object",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### POST `/api/games` (Admin)
**Descrição:** Cria um novo jogo

**Acesso:** Privado (requer token + permissão de admin)

**Parâmetros do Body:**
```json
{
  "name": "string (obrigatório)",
  "provider": "string (obrigatório)",
  "category": "string (opcional)",
  "imageUrl": "string (opcional)",
  "description": "string (opcional)",
  "minBet": "number (opcional)",
  "maxBet": "number (opcional)",
  "rtp": "number (opcional)",
  "isActive": "boolean (opcional)",
  "isFeatured": "boolean (opcional)",
  "gameConfig": "object (opcional)"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Jogo criado com sucesso",
  "game": {
    "id": "string",
    "name": "string",
    "provider": "string",
    "category": "string",
    "imageUrl": "string",
    "description": "string",
    "minBet": "number",
    "maxBet": "number",
    "rtp": "number",
    "isActive": "boolean",
    "isFeatured": "boolean",
    "gameConfig": "object"
  }
}
```

### PUT `/api/games/:id` (Admin)
**Descrição:** Atualiza um jogo existente

**Acesso:** Privado (requer token + permissão de admin)

**Parâmetros da URL:**
- `id`: string (ID do jogo)

**Parâmetros do Body:**
```json
{
  "name": "string (opcional)",
  "provider": "string (opcional)",
  "category": "string (opcional)",
  "imageUrl": "string (opcional)",
  "description": "string (opcional)",
  "minBet": "number (opcional)",
  "maxBet": "number (opcional)",
  "rtp": "number (opcional)",
  "isActive": "boolean (opcional)",
  "isFeatured": "boolean (opcional)",
  "popularity": "number (opcional)",
  "gameConfig": "object (opcional)"
}
```

### DELETE `/api/games/:id` (Admin)
**Descrição:** Remove um jogo

**Acesso:** Privado (requer token + permissão de admin)

**Parâmetros da URL:**
- `id`: string (ID do jogo)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Jogo removido com sucesso"
}
```

---

## 🎯 Apostas (`/api/bets`)

### POST `/api/bets`
**Descrição:** Cria uma nova aposta

**Acesso:** Privado (requer token)

**Parâmetros do Body:**
```json
{
  "gameId": "string (obrigatório)",
  "amount": "number (obrigatório)",
  "prediction": "object (obrigatório)"
}
```

**Resposta de Sucesso (201):**
```json
{
  "success": true,
  "message": "Aposta criada com sucesso",
  "bet": {
    "id": "string",
    "userId": "string",
    "gameId": "string",
    "amount": "number",
    "prediction": "object",
    "status": "PENDING",
    "createdAt": "date"
  }
}
```

**Resposta de Erro (400):**
```json
{
  "success": false,
  "message": "Saldo insuficiente"
}
```

### GET `/api/bets/:id`
**Descrição:** Obtém uma aposta específica por ID

**Acesso:** Privado (requer token)

**Parâmetros da URL:**
- `id`: string (ID da aposta)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "bet": {
    "id": "string",
    "userId": "string",
    "gameId": {
      "id": "string",
      "name": "string",
      "provider": "string",
      "category": "string"
    },
    "amount": "number",
    "prediction": "object",
    "status": "string",
    "result": "object",
    "payout": "number",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### GET `/api/bets/user/:userId`
**Descrição:** Obtém apostas de um usuário específico

**Acesso:** Privado (requer token)

**Parâmetros da URL:**
- `userId`: string (ID do usuário)

**Query Parameters:**
- `page`: number (padrão: 1)
- `limit`: number (padrão: 10)
- `status`: string (PENDING, WON, LOST, CANCELLED)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "bets": [
      {
        "id": "string",
        "userId": "string",
        "gameId": {
          "id": "string",
          "name": "string",
          "provider": "string"
        },
        "amount": "number",
        "prediction": "object",
        "status": "string",
        "result": "object",
        "payout": "number",
        "createdAt": "date"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "totalPages": "number"
    }
  }
}
```

### POST `/api/bets/:id/cancel`
**Descrição:** Cancela uma aposta pendente

**Acesso:** Privado (requer token)

**Parâmetros da URL:**
- `id`: string (ID da aposta)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Aposta cancelada com sucesso",
  "bet": {
    "id": "string",
    "userId": "string",
    "gameId": "string",
    "amount": "number",
    "status": "CANCELLED",
    "cancelledAt": "date"
  }
}
```

---

## 💳 Depósitos (`/api/deposits`)

### POST `/api/deposits/credit-card`
**Descrição:** Realiza depósito via cartão de crédito

**Acesso:** Privado (requer token)

**Parâmetros do Body:**
```json
{
  "amount": "number (obrigatório)",
  "cardNumber": "string (obrigatório)",
  "cardHolderName": "string (obrigatório)",
  "expiryDate": "string (obrigatório)",
  "cvv": "string (obrigatório)"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Depósito processado com sucesso",
  "transaction": {
    "id": "string",
    "amount": "number",
    "status": "COMPLETED",
    "method": "CREDIT_CARD",
    "createdAt": "date"
  }
}
```

### GET `/api/deposits/history`
**Descrição:** Obtém histórico de depósitos do usuário

**Acesso:** Privado (requer token)

**Query Parameters:**
- `page`: number (padrão: 1)
- `limit`: number (padrão: 10)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "deposits": [
    {
      "id": "string",
      "amount": "number",
      "status": "string",
      "method": "string",
      "createdAt": "date"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

---

## 💰 Saques (`/api/withdrawals`)

### POST `/api/withdrawals/request`
**Descrição:** Solicita um saque

**Acesso:** Privado (requer token)

**Parâmetros do Body:**
```json
{
  "amount": "number (obrigatório)",
  "pixKey": "string (obrigatório)",
  "pixKeyType": "string (obrigatório)"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Solicitação de saque criada com sucesso",
  "withdrawal": {
    "id": "string",
    "amount": "number",
    "pixKey": "string",
    "pixKeyType": "string",
    "status": "PENDING",
    "transactionId": "string",
    "createdAt": "date"
  }
}
```

### GET `/api/withdrawals/status/:transaction_id`
**Descrição:** Verifica o status de um saque

**Acesso:** Privado (requer token)

**Parâmetros da URL:**
- `transaction_id`: string (ID da transação)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "withdrawal": {
    "id": "string",
    "amount": "number",
    "status": "string",
    "transactionId": "string",
    "createdAt": "date",
    "processedAt": "date"
  }
}
```

### GET `/api/withdrawals/history`
**Descrição:** Obtém histórico de saques do usuário

**Acesso:** Privado (requer token)

**Query Parameters:**
- `page`: number (padrão: 1)
- `limit`: number (padrão: 10)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "withdrawals": [
    {
      "id": "string",
      "amount": "number",
      "status": "string",
      "pixKey": "string",
      "pixKeyType": "string",
      "transactionId": "string",
      "createdAt": "date"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

---

## 🏦 PIX (`/api/pix`)

### POST `/api/pix/generate`
**Descrição:** Gera um QR Code PIX para depósito

**Acesso:** Privado (requer token)

**Parâmetros do Body:**
```json
{
  "amount": "number (obrigatório)"
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "qrCode": {
    "qrCodeBase64": "string",
    "qrCodeText": "string",
    "externalId": "string",
    "amount": "number",
    "expiresAt": "date"
  }
}
```

### GET `/api/pix/status/:external_id`
**Descrição:** Verifica o status de um pagamento PIX

**Acesso:** Privado (requer token)

**Parâmetros da URL:**
- `external_id`: string (ID externo da transação PIX)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "payment": {
    "externalId": "string",
    "status": "string",
    "amount": "number",
    "paidAt": "date"
  }
}
```

### POST `/api/pix/webhook`
**Descrição:** Webhook para notificações de pagamento PIX

**Acesso:** Público (webhook)

**Parâmetros do Body:**
```json
{
  "external_id": "string",
  "status": "string",
  "amount": "number",
  "paid_at": "string"
}
```

---

## 💳 Cartão de Crédito (`/api/credit-card`)

### POST `/api/credit-card/process`
**Descrição:** Processa pagamento com cartão de crédito

**Acesso:** Privado (requer token)

**Parâmetros do Body:**
```json
{
  "amount": "number (obrigatório)",
  "cardNumber": "string (obrigatório)",
  "cardHolderName": "string (obrigatório)",
  "expiryDate": "string (obrigatório)",
  "cvv": "string (obrigatório)"
}
```

---

## 📊 Transações (`/api/transactions`)

### GET `/api/transactions`
**Descrição:** Obtém transações do usuário autenticado

**Acesso:** Privado (requer token)

**Query Parameters:**
- `page`: number (padrão: 1)
- `limit`: number (padrão: 10)
- `type`: string (DEPOSIT, WITHDRAWAL, BET, WIN)
- `status`: string (PENDING, COMPLETED, FAILED, CANCELLED)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "transactions": [
    {
      "id": "string",
      "type": "string",
      "amount": "number",
      "status": "string",
      "description": "string",
      "createdAt": "date"
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "totalPages": "number"
  }
}
```

### GET `/api/transactions/:id`
**Descrição:** Obtém uma transação específica

**Acesso:** Privado (requer token)

**Parâmetros da URL:**
- `id`: string (ID da transação)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "transaction": {
    "id": "string",
    "userId": "string",
    "type": "string",
    "amount": "number",
    "status": "string",
    "description": "string",
    "metadata": "object",
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

### POST `/api/transactions/withdraw`
**Descrição:** Cria uma transação de saque

**Acesso:** Privado (requer token)

**Parâmetros do Body:**
```json
{
  "amount": "number (obrigatório)",
  "pixKey": "string (obrigatório)",
  "pixKeyType": "string (obrigatório)"
}
```

### GET `/api/transactions/admin/all` (Admin)
**Descrição:** Obtém todas as transações (admin)

**Acesso:** Privado (requer token + permissão de admin)

**Query Parameters:**
- `page`: number (padrão: 1)
- `limit`: number (padrão: 10)
- `type`: string
- `status`: string
- `userId`: string

### PUT `/api/transactions/:id` (Admin)
**Descrição:** Atualiza o status de uma transação

**Acesso:** Privado (requer token + permissão de admin)

**Parâmetros da URL:**
- `id`: string (ID da transação)

**Parâmetros do Body:**
```json
{
  "status": "string (obrigatório)"
}
```

---

## 🎁 Baús de Recompensa (`/api/reward-chests`)

### GET `/api/reward-chests`
**Descrição:** Obtém status dos baús de recompensa do usuário

**Acesso:** Privado (requer token)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "chests": {
    "chest1": {
      "opened": "boolean",
      "openedAt": "date",
      "canOpen": "boolean"
    },
    "chest2": {
      "opened": "boolean",
      "openedAt": "date",
      "canOpen": "boolean"
    },
    "chest3": {
      "opened": "boolean",
      "openedAt": "date",
      "canOpen": "boolean"
    }
  }
}
```

### POST `/api/reward-chests/:chestNumber/open`
**Descrição:** Abre um baú de recompensa

**Acesso:** Privado (requer token)

**Parâmetros da URL:**
- `chestNumber`: number (1, 2 ou 3)

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Baú aberto com sucesso!",
  "reward": {
    "type": "string",
    "amount": "number"
  },
  "newBalance": "number"
}
```

---

## 🔑 Credenciais PIX (`/api/pix-credentials`)

### GET `/api/pix-credentials` (Admin)
**Descrição:** Obtém credenciais PIX configuradas

**Acesso:** Privado (requer token + permissão de admin)

### POST `/api/pix-credentials` (Admin)
**Descrição:** Configura credenciais PIX

**Acesso:** Privado (requer token + permissão de admin)

### PUT `/api/pix-credentials/:id` (Admin)
**Descrição:** Atualiza credenciais PIX

**Acesso:** Privado (requer token + permissão de admin)

### DELETE `/api/pix-credentials/:id` (Admin)
**Descrição:** Remove credenciais PIX

**Acesso:** Privado (requer token + permissão de admin)

---

## 📋 Códigos de Status HTTP

- **200**: Sucesso
- **201**: Criado com sucesso
- **400**: Requisição inválida
- **401**: Não autorizado
- **403**: Acesso negado
- **404**: Não encontrado
- **500**: Erro interno do servidor

## 🔒 Middleware de Autenticação

### `verifyToken`
Verifica se o token JWT é válido e adiciona as informações do usuário ao objeto `req.user`.

### `isAdmin`
Verifica se o usuário autenticado possui permissões de administrador.

## 📝 Observações Importantes

1. **Paginação**: A maioria dos endpoints que retornam listas suportam paginação via query parameters `page` e `limit`.

2. **Filtros**: Muitos endpoints suportam filtros via query parameters para refinar os resultados.

3. **Validação**: Todos os endpoints validam os dados de entrada e retornam mensagens de erro apropriadas.

4. **Segurança**: Endpoints sensíveis requerem autenticação e/ou permissões específicas.

5. **Formato de Data**: Todas as datas são retornadas no formato ISO 8601.

6. **Valores Monetários**: Todos os valores monetários são representados como números decimais.

7. **Status de Transações**: 
   - `PENDING`: Pendente
   - `COMPLETED`: Concluída
   - `FAILED`: Falhou
   - `CANCELLED`: Cancelada

8. **Status de Usuários**:
   - `ACTIVE`: Ativo
   - `INACTIVE`: Inativo
   - `BLOCKED`: Bloqueado

9. **Tipos de Transação**:
   - `DEPOSIT`: Depósito
   - `WITHDRAWAL`: Saque
   - `BET`: Aposta
   - `WIN`: Ganho
   - `BONUS`: Bônus

Esta documentação cobre todas as rotas disponíveis na API ThunderBet. Para mais informações ou suporte, entre em contato com a equipe de desenvolvimento. 