# Sistema de Baús de Recompensa

## Visão Geral

O sistema de baús de recompensa permite que usuários que fizeram pelo menos um depósito possam abrir baús e receber bônus em dinheiro. Cada usuário tem direito a 3 baús, sendo que o terceiro baú oferece um prêmio especial.

## Funcionalidades

### 1. Localização do Usuário
- Campo `location` adicionado ao modelo de usuário
- Valor padrão: "Brasil"
- Pode ser alterado pelo usuário através do endpoint de atualização de perfil

### 2. Baús de Recompensa
- **3 baús por usuário**: Cada usuário tem direito a exatamente 3 baús
- **Requisito**: Usuário deve ter feito pelo menos um depósito completo
- **Valores**:
  - Baú 1: R$ 3,00 de bônus
  - Baú 2: R$ 3,00 de bônus  
  - Baú 3: R$ 3,00 de bônus + R$ 500,00 de prêmio especial
- **Uso único**: Cada baú só pode ser aberto uma vez

## Endpoints da API

### Usuário - Perfil

#### GET /api/users/profile
Obter perfil do usuário logado (incluindo localização)

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email@example.com",
    "name": "Nome do Usuário",
    "phone": "+5511999999999",
    "cpf": "12345678901",
    "balance": 100.50,
    "location": "Brasil",
    "role": "USER",
    "status": "ACTIVE",
    "lastLogin": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/users/profile
Atualizar perfil do usuário (incluindo localização)

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Novo Nome",
  "email": "novo@email.com",
  "location": "São Paulo"
}
```

### Baús de Recompensa

#### GET /api/reward-chests
Obter status dos baús do usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta:**
```json
{
  "success": true,
  "hasDeposit": true,
  "chests": [
    {
      "id": "chest_id_1",
      "chestNumber": 1,
      "opened": false,
      "openedAt": null,
      "bonusAmount": 3,
      "extraAmount": 0,
      "canOpen": true
    },
    {
      "id": "chest_id_2", 
      "chestNumber": 2,
      "opened": false,
      "openedAt": null,
      "bonusAmount": 3,
      "extraAmount": 0,
      "canOpen": true
    },
    {
      "id": "chest_id_3",
      "chestNumber": 3,
      "opened": false,
      "openedAt": null,
      "bonusAmount": 3,
      "extraAmount": 500,
      "canOpen": true
    }
  ]
}
```

#### POST /api/reward-chests/:chestNumber/open
Abrir um baú específico

**Headers:**
```
Authorization: Bearer <token>
```

**Parâmetros:**
- `chestNumber`: Número do baú (1, 2 ou 3)

**Resposta (Baú 1 ou 2):**
```json
{
  "success": true,
  "message": "Parabéns! Você abriu o baú 1 e ganhou R$ 3 de bônus!",
  "chest": {
    "chestNumber": 1,
    "opened": true,
    "openedAt": "2024-01-01T12:00:00.000Z",
    "bonusAmount": 3,
    "extraAmount": 0,
    "totalAmount": 3
  },
  "newBalance": 103.50,
  "transaction": {
    "id": "transaction_id",
    "amount": 3,
    "type": "BONUS"
  }
}
```

**Resposta (Baú 3):**
```json
{
  "success": true,
  "message": "Parabéns! Você abriu o baú 3 e ganhou R$ 3 de bônus + R$ 500 de prêmio especial!",
  "chest": {
    "chestNumber": 3,
    "opened": true,
    "openedAt": "2024-01-01T12:00:00.000Z",
    "bonusAmount": 3,
    "extraAmount": 500,
    "totalAmount": 503
  },
  "newBalance": 603.50,
  "transaction": {
    "id": "transaction_id",
    "amount": 503,
    "type": "BONUS"
  }
}
```

#### POST /api/reward-chests/initialize
Inicializar baús para um usuário (opcional - feito automaticamente)

**Headers:**
```
Authorization: Bearer <token>
```

#### GET /api/reward-chests/stats (Admin)
Obter estatísticas dos baús

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Resposta:**
```json
{
  "success": true,
  "stats": {
    "totalUsers": 1000,
    "usersWithChests": 800,
    "chestStats": [
      {
        "_id": 1,
        "totalChests": 800,
        "openedChests": 400,
        "totalBonusDistributed": 1200
      },
      {
        "_id": 2,
        "totalChests": 800,
        "openedChests": 300,
        "totalBonusDistributed": 900
      },
      {
        "_id": 3,
        "totalChests": 800,
        "openedChests": 100,
        "totalBonusDistributed": 50300
      }
    ]
  }
}
```

## Regras de Negócio

### Requisitos para Abrir Baús
1. **Depósito obrigatório**: O usuário deve ter pelo menos uma transação de depósito com status "COMPLETED"
2. **Autenticação**: Usuário deve estar logado e com token válido
3. **Status da conta**: Conta deve estar ativa (status "ACTIVE")

### Limitações
1. **Uso único**: Cada baú só pode ser aberto uma vez
2. **Ordem livre**: Baús podem ser abertos em qualquer ordem
3. **Não transferível**: Baús são pessoais e não podem ser transferidos

### Transações
- Todas as recompensas geram transações do tipo "BONUS"
- Transações são registradas com metadata detalhada
- Saldo do usuário é atualizado automaticamente
- Operações são realizadas em transações de banco de dados para garantir consistência

## Modelos de Dados

### User (Atualizado)
```javascript
{
  // ... campos existentes ...
  location: {
    type: String,
    default: 'Brasil',
    trim: true
  },
  rewardChests: {
    chest1: {
      opened: { type: Boolean, default: false },
      openedAt: { type: Date }
    },
    chest2: {
      opened: { type: Boolean, default: false },
      openedAt: { type: Date }
    },
    chest3: {
      opened: { type: Boolean, default: false },
      openedAt: { type: Date }
    }
  }
}
```

### RewardChest (Novo)
```javascript
{
  userId: { type: ObjectId, ref: 'User', required: true },
  chestNumber: { type: Number, enum: [1, 2, 3], required: true },
  opened: { type: Boolean, default: false },
  openedAt: { type: Date },
  bonusAmount: { type: Number, default: 3 },
  extraAmount: { type: Number, default: 0 }, // 500 apenas para baú 3
  transactionId: { type: ObjectId, ref: 'Transaction' }
}
```

## Códigos de Erro

### 400 - Bad Request
- Número do baú inválido
- Baú já foi aberto
- Baús já inicializados

### 403 - Forbidden
- Usuário não fez depósito
- Acesso negado (admin apenas)

### 404 - Not Found
- Baú não encontrado
- Usuário não encontrado

### 500 - Internal Server Error
- Erro no banco de dados
- Erro na transação 