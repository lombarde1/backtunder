# Documentação da API ThunderBet

Bem-vindo à documentação completa da API ThunderBet! Esta seção contém toda a informação necessária para integrar e utilizar nossa API de apostas online.

## 📚 Índice da Documentação

### 📖 Documentação Principal
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Documentação completa e detalhada de todas as rotas da API
- **[API_EXAMPLES.md](./API_EXAMPLES.md)** - Exemplos práticos de implementação em JavaScript

### 🔧 Documentação Específica por Módulo
- **[pix-api.md](./pix-api.md)** - Sistema de pagamentos PIX
- **[withdrawal-api.md](./withdrawal-api.md)** - Sistema de saques
- **[credit-card-deposit-api.md](./credit-card-deposit-api.md)** - Depósitos via cartão de crédito
- **[reward-chests.md](./reward-chests.md)** - Sistema de baús de recompensa

## 🚀 Início Rápido

### 1. Configuração Básica
```javascript
const BASE_URL = 'https://money2025-thunder05.krkzfx.easypanel.host/api';
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
};
```

### 2. Primeiro Registro
```javascript
const response = await fetch(`${BASE_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+5511999999999',
    password: 'minhasenha123'
  })
});
```

### 3. Login e Obtenção do Token
```javascript
const response = await fetch(`${BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    phone: '+5511999999999',
    password: 'minhasenha123'
  })
});

const data = await response.json();
const token = data.data.token; // Use este token nas próximas requisições
```

## 🎯 Principais Funcionalidades

### 🔐 Sistema de Autenticação
- Registro de usuários com telefone e senha
- Login com JWT tokens
- Perfis de usuário com informações opcionais
- Sistema de permissões (USER/ADMIN)

### 🎮 Gerenciamento de Jogos
- Catálogo de jogos com filtros avançados
- Jogos em destaque
- Categorias (slots, table, live, crash, sport)
- Configurações específicas por jogo

### 🎯 Sistema de Apostas
- Criação de apostas em tempo real
- Histórico completo de apostas
- Cancelamento de apostas pendentes
- Diferentes tipos de predições

### 💰 Sistema Financeiro Completo
- **PIX**: Depósitos instantâneos via QR Code
- **Cartão de Crédito**: Processamento seguro de pagamentos
- **Saques**: Sistema automatizado via PIX
- **Histórico**: Rastreamento completo de transações

### 🎁 Sistema de Recompensas
- Baús de recompensa progressivos
- Bônus de primeiro depósito
- Sistema de conquistas

### 👥 Painel Administrativo
- Gerenciamento completo de usuários
- Controle de transações
- Configuração de jogos
- Relatórios e analytics

## 📋 Estrutura de Resposta Padrão

Todas as respostas da API seguem este formato:

```json
{
  "success": true,
  "message": "Descrição da operação",
  "data": {
    // Dados específicos da resposta
  }
}
```

### Códigos de Status HTTP
- `200` - Operação realizada com sucesso
- `201` - Recurso criado com sucesso
- `400` - Erro na requisição (dados inválidos)
- `401` - Não autorizado (token inválido/ausente)
- `403` - Acesso negado (permissões insuficientes)
- `404` - Recurso não encontrado
- `500` - Erro interno do servidor

## 🔒 Autenticação e Segurança

### JWT Tokens
A API utiliza JWT (JSON Web Tokens) para autenticação. Após o login bem-sucedido, você receberá um token que deve ser incluído em todas as requisições autenticadas:

```javascript
headers: {
  'Authorization': 'Bearer SEU_TOKEN_JWT'
}
```

### Níveis de Acesso
- **Público**: Endpoints acessíveis sem autenticação
- **Privado**: Requer token JWT válido
- **Admin**: Requer token JWT + permissões de administrador

## 🛠️ Ferramentas de Desenvolvimento

### Testando com cURL
```bash
# Exemplo de registro
curl -X POST https://money2025-thunder05.krkzfx.easypanel.host/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "11999999999", "password": "senha123"}'
```

### Testando com Postman
1. Importe a collection da API (se disponível)
2. Configure a variável de ambiente `baseUrl`
3. Use o token JWT nas requisições autenticadas

### Testando com JavaScript
Consulte [API_EXAMPLES.md](./API_EXAMPLES.md) para exemplos completos de implementação.

## 📊 Paginação

Muitos endpoints suportam paginação através dos parâmetros:
- `page`: Número da página (padrão: 1)
- `limit`: Itens por página (padrão: 10)

Exemplo de resposta paginada:
```json
{
  "success": true,
  "count": 10,
  "total": 150,
  "pages": 15,
  "currentPage": 1,
  "data": [...]
}
```

## 🔍 Filtros e Busca

A maioria dos endpoints de listagem suporta filtros:
- `search`: Busca textual
- `status`: Filtro por status
- `category`: Filtro por categoria
- `provider`: Filtro por provedor

## 🚨 Tratamento de Erros

### Estrutura de Erro Padrão
```json
{
  "success": false,
  "message": "Descrição do erro",
  "error": "Detalhes técnicos (apenas em desenvolvimento)"
}
```

### Erros Comuns
- **Token Expirado**: Faça login novamente
- **Saldo Insuficiente**: Verifique o saldo antes de apostar
- **Dados Inválidos**: Verifique os parâmetros enviados
- **Permissões**: Verifique se tem acesso ao recurso

## 📞 Suporte e Contato

Para dúvidas técnicas ou suporte:
1. Consulte primeiro esta documentação
2. Verifique os exemplos práticos
3. Entre em contato com a equipe de desenvolvimento

## 🔄 Versionamento

A API segue versionamento semântico. Mudanças breaking serão comunicadas com antecedência e uma nova versão será disponibilizada.

## 📝 Changelog

Acompanhe as mudanças e atualizações da API:
- Novas funcionalidades
- Correções de bugs
- Melhorias de performance
- Mudanças de segurança

---

**Última atualização:** Dezembro 2024  
**Versão da API:** 1.0.0 