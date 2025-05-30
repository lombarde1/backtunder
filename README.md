# ThunderBet API

API RESTful para a casa de apostas ThunderBet.

## 📚 Documentação

- **[Documentação Completa da API](./docs/API_DOCUMENTATION.md)** - Documentação detalhada de todas as rotas, parâmetros e respostas
- **[Exemplos de Uso](./docs/API_EXAMPLES.md)** - Exemplos práticos de implementação em JavaScript
- **[Documentação PIX](./docs/pix-api.md)** - Específica para integração PIX
- **[Documentação de Saques](./docs/withdrawal-api.md)** - Específica para sistema de saques
- **[Documentação de Baús de Recompensa](./docs/reward-chests.md)** - Sistema de recompensas
- **[Documentação de Cartão de Crédito](./docs/credit-card-deposit-api.md)** - Depósitos via cartão

## Tecnologias Utilizadas

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT para autenticação
- Integração com PIX para pagamentos

## Configuração

### Pré-requisitos

- Node.js (v12 ou superior)
- MongoDB

### Instalação

1. Clone o repositório
2. Instale as dependências:
   ```
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   PORT=3000
   MONGODB_URI=mongodb://darkvips:lombarde1@147.79.111.143:27017/ThunderBet2?authSource=admin
   JWT_SECRET=seu_segredo_jwt
   NODE_ENV=development
   ```
4. Inicie o servidor:
   ```
   npm run dev
   ```

## Estrutura do Projeto

```
├── config/         # Configurações (conexão com banco de dados)
├── controllers/    # Controladores das rotas
├── docs/           # Documentação da API
├── middleware/     # Middleware personalizado (autenticação)
├── models/         # Modelos do Mongoose
├── routes/         # Rotas da API
├── utils/          # Utilitários
├── .env            # Variáveis de ambiente
├── app.js          # Arquivo principal
└── package.json    # Dependências do projeto
```

## 🚀 Início Rápido

### Base URL
```
http://localhost:3000/api
```

### Autenticação
A API utiliza JWT (JSON Web Tokens). Inclua o token no header:
```
Authorization: Bearer <seu_token_jwt>
```

### Exemplo de Registro
```javascript
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+5511999999999',
    password: 'minhasenha123'
  })
});
```

### Exemplo de Login
```javascript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+5511999999999',
    password: 'minhasenha123'
  })
});
```

## 📋 Principais Endpoints

### 🔐 Autenticação (`/api/auth`)
- `POST /register` - Registrar novo usuário
- `POST /login` - Autenticar usuário
- `GET /profile` - Obter perfil do usuário

### 👤 Usuários (`/api/users`)
- `GET /profile` - Perfil do usuário logado
- `PUT /profile` - Atualizar perfil
- `GET /` - Listar usuários (Admin)
- `GET /:id` - Obter usuário por ID (Admin)
- `PUT /:id` - Atualizar usuário (Admin)
- `DELETE /:id` - Excluir usuário (Admin)

### 🎮 Jogos (`/api/games`)
- `GET /` - Listar jogos com filtros
- `GET /featured` - Jogos em destaque
- `GET /:id` - Obter jogo por ID
- `POST /` - Criar jogo (Admin)
- `PUT /:id` - Atualizar jogo (Admin)
- `DELETE /:id` - Excluir jogo (Admin)

### 🎯 Apostas (`/api/bets`)
- `POST /` - Criar aposta
- `GET /:id` - Obter aposta por ID
- `GET /user/:userId` - Apostas do usuário
- `POST /:id/cancel` - Cancelar aposta

### 💰 Sistema Financeiro
#### PIX (`/api/pix`)
- `POST /generate` - Gerar QR Code PIX
- `GET /status/:external_id` - Status do pagamento
- `POST /webhook` - Webhook de notificação

#### Depósitos (`/api/deposits`)
- `POST /credit-card` - Depósito via cartão
- `GET /history` - Histórico de depósitos

#### Saques (`/api/withdrawals`)
- `POST /request` - Solicitar saque
- `GET /status/:transaction_id` - Status do saque
- `GET /history` - Histórico de saques

### 📊 Transações (`/api/transactions`)
- `GET /` - Transações do usuário
- `GET /:id` - Detalhes da transação
- `POST /withdraw` - Criar saque
- `GET /admin/all` - Todas as transações (Admin)
- `PUT /:id` - Atualizar status (Admin)

### 🎁 Recompensas (`/api/reward-chests`)
- `GET /` - Status dos baús
- `POST /:chestNumber/open` - Abrir baú

## 🔒 Níveis de Acesso

- **Público**: Endpoints acessíveis sem autenticação
- **Privado**: Requer token JWT válido
- **Admin**: Requer token JWT + permissões de administrador

## 📝 Formato de Resposta

Todas as respostas seguem o padrão:
```json
{
  "success": true/false,
  "message": "Mensagem descritiva",
  "data": { /* dados da resposta */ }
}
```

## 🔧 Códigos de Status

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autorizado
- `403` - Acesso negado
- `404` - Não encontrado
- `500` - Erro interno do servidor

## 🧪 Testando a API

### Com cURL
```bash
# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "11999888777", "password": "senha123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "11999888777", "password": "senha123"}'

# Gerar PIX (com token)
curl -X POST http://localhost:3000/api/pix/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"amount": 100}'
```

### Com JavaScript/Fetch
Consulte o arquivo [API_EXAMPLES.md](./docs/API_EXAMPLES.md) para exemplos completos.

## 🚀 Deploy

Para deploy em produção:

1. Configure as variáveis de ambiente adequadas
2. Use um gerenciador de processos como PM2
3. Configure um proxy reverso (Nginx)
4. Configure SSL/HTTPS
5. Configure backup do banco de dados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para dúvidas ou suporte, consulte a documentação completa ou entre em contato com a equipe de desenvolvimento.

## 📄 Licença

Este projeto está licenciado sob a licença ISC. 