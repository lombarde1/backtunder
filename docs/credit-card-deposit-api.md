# Documentação da API de Depósito com Cartão de Crédito

## 💰 Visão Geral
API para processamento de depósitos utilizando cartões de crédito gerados pelo sistema. Cada cartão pode ser utilizado apenas uma vez para depósito.

## 🔒 Autenticação
- Requer token JWT válido
- Header: `Authorization: Bearer {seu_token}`

## 📌 Endpoint
```http
POST /api/credit-card/deposit
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "cardNumber": "string",      // Número do cartão (obrigatório)
  "expirationDate": "string", // Data de validade no formato MM/YY (obrigatório)
  "cvv": "string",           // Código de segurança (obrigatório)
  "holderName": "string",    // Nome do titular (obrigatório)
  "cpf": "string",          // CPF do titular (obrigatório)
  "amount": number          // Valor do depósito (obrigatório)
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Depósito realizado com sucesso",
  "transaction": {
    "id": "string",
    "amount": number,
    "status": "COMPLETED",
    "bonus": number,        // Valor do bônus (10 reais no primeiro depósito)
    "createdAt": "string"
  }
}
```

## ⚠️ Códigos de Erro

| Código | Descrição                                    | Motivo                                         |
|--------|----------------------------------------------|------------------------------------------------|
| 400    | Todos os campos são obrigatórios            | Faltam campos na requisição                    |
| 400    | O valor do depósito deve ser maior que zero | Amount menor ou igual a zero                   |
| 400    | Cartão inválido ou já utilizado            | Cartão não existe ou já foi usado              |
| 401    | Não autorizado                              | Token inválido ou expirado                     |
| 500    | Erro ao processar depósito                  | Erro interno do servidor                       |

## 🔒 Regras de Negócio

1. **Validação do Cartão:**
   - Cartão deve existir no sistema
   - Cartão não pode ter sido usado anteriormente
   - Todos os dados do cartão devem corresponder exatamente

2. **Validação do Depósito:**
   - Valor deve ser maior que zero
   - Todos os campos são obrigatórios
   - Cartão é marcado como usado após o depósito

3. **Bônus de Primeiro Depósito:**
   - Usuários recebem R$ 10 de bônus no primeiro depósito
   - Bônus é adicionado automaticamente ao valor do depósito
   - Apenas depósitos com status COMPLETED são considerados
   - Bônus é registrado nos metadados da transação

4. **Processamento:**
   - Transação é criada com status COMPLETED
   - Saldo do usuário é atualizado automaticamente
   - Cartão é marcado como usado após o processamento

## 📝 Exemplo de Uso

```bash
curl -X POST http://sua-api.com/api/credit-card/deposit \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "cardNumber": "4532XXXXXXXXXXXXXXX",
    "expirationDate": "MM/YY",
    "cvv": "123",
    "holderName": "Nome Árabe Gerado",
    "cpf": "CPF Gerado",
    "amount": 100.00
  }'
```

**Resposta de Sucesso:**
```json
{
  "success": true,
  "message": "Depósito realizado com sucesso",
  "transaction": {
    "id": "65f2e8b7c261e8b7c261e8b7",
    "amount": 110.00,
    "status": "COMPLETED",
    "bonus": 10,
    "createdAt": "2024-03-14T12:00:00.000Z"
  }
}
```

**Resposta de Erro:**
```json
{
  "success": false,
  "message": "Cartão inválido ou já utilizado"
}
```

## 📋 Observações Importantes

1. **Segurança:**
   - Todos os dados do cartão são validados
   - Cartão é marcado como usado após o depósito
   - Transações são registradas com detalhes completos

2. **Bônus:**
   - Aplicado apenas no primeiro depósito do usuário
   - Valor fixo de R$ 10
   - Registrado nos metadados da transação
   - Não aplicável em depósitos subsequentes

3. **Transações:**
   - São criadas com status COMPLETED
   - Incluem metadados com últimos 4 dígitos do cartão
   - Registram o valor do bônus quando aplicável

4. **Limitações:**
   - Cartão pode ser usado apenas uma vez
   - Valor mínimo de depósito é maior que zero
   - Bônus é aplicado apenas uma vez por usuário

5. **Depuração:**
   - Logs detalhados de todas as operações
   - Registro de erros com contexto
   - Monitoramento de atualizações de saldo 