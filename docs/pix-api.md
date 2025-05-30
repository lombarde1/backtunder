# Documentação das APIs de PIX

## 💰 Visão Geral
APIs para geração de QR Code PIX para depósitos e verificação de status de pagamentos.

## 🔒 Autenticação
- Requer token JWT válido
- Header: `Authorization: Bearer {seu_token}`

## 📌 Endpoints

### 1. Gerar QR Code PIX
```http
POST /api/pix/generate
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "amount": number // Valor do depósito (obrigatório)
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "QR Code PIX gerado com sucesso",
  "transaction_id": "string",
  "external_id": "string",
  "qr_code": "string",
  "qr_code_image": "string",
  "expiration": "string",
  "amount": number,
  "bonus": number // Valor do bônus (10 reais no primeiro depósito)
}
```

### 2. Verificar Status do Pagamento
```http
GET /api/pix/status/:external_id
```

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros de URL:**
| Parâmetro    | Tipo   | Descrição                    |
|--------------|--------|------------------------------|
| external_id  | string | ID externo da transação PIX  |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "status": "string", // PENDING, COMPLETED, etc
  "transaction_id": "string",
  "external_id": "string",
  "amount": number,
  "bonus": number, // Valor do bônus (10 reais no primeiro depósito)
  "created_at": "string",
  "updated_at": "string",
  "metadata": {
    "pixTransactionId": "string",
    "dateApproval": "string",
    "payerInfo": object,
    "webhookData": object
  }
}
```

## ⚠️ Códigos de Erro

| Código | Descrição                                    | Motivo                                         |
|--------|----------------------------------------------|------------------------------------------------|
| 400    | Valor inválido                               | Amount menor ou igual a zero                   |
| 401    | Não autorizado                              | Token inválido ou expirado                     |
| 403    | Não autorizado a visualizar esta transação  | Usuário não é dono da transação                |
| 404    | Transação não encontrada                    | External ID não encontrado                     |
| 500    | Erro ao gerar QR Code PIX                   | Erro interno ou credenciais não configuradas   |
| 500    | Erro ao verificar status do pagamento       | Erro interno do servidor                       |

## 🔒 Regras de Negócio

1. **Geração de QR Code:**
   - Requer credenciais PIX ativas configuradas
   - Valor deve ser maior que zero
   - Cria transação pendente automaticamente
   - Gera ID externo único
   - Verifica se é primeiro depósito para aplicar bônus

2. **Verificação de Status:**
   - Apenas o próprio usuário pode verificar suas transações
   - Admins podem verificar qualquer transação
   - Retorna dados completos da transação
   - Inclui informação sobre bônus aplicado

3. **Processamento:**
   - QR Code tem tempo de expiração
   - Transação é atualizada via webhook
   - Saldo é atualizado automaticamente após confirmação
   - Bônus é aplicado apenas no primeiro depósito

4. **Bônus de Primeiro Depósito:**
   - Usuários recebem R$ 10 de bônus no primeiro depósito
   - Bônus é adicionado automaticamente ao valor do depósito
   - Apenas depósitos com status COMPLETED são considerados
   - Bônus é registrado nos metadados da transação

## 📝 Exemplos de Uso

### Gerar QR Code para depósito:
```bash
curl -X POST http://sua-api.com/api/pix/generate \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.50
  }'
```

### Verificar status do pagamento:
```bash
curl -X GET http://sua-api.com/api/pix/status/PIX_1234567890 \
  -H "Authorization: Bearer seu_token"
```

## 📋 Observações Importantes

1. **Segurança:**
   - Todas as requisições devem usar HTTPS
   - Token JWT é obrigatório
   - Dados sensíveis são mascarados nos logs

2. **Transações:**
   - São criadas inicialmente como PENDING
   - Status é atualizado via webhook
   - Saldo é atualizado automaticamente
   - Bônus é aplicado apenas no primeiro depósito

3. **Integração:**
   - Requer credenciais PIX configuradas
   - Webhook URL deve ser configurada
   - Sistema mantém registro completo

4. **Limitações:**
   - QR Code tem tempo de expiração
   - Valor deve ser positivo
   - Apenas uma transação PIX pendente por vez
   - Bônus é aplicado apenas uma vez por usuário

5. **Depuração:**
   - Logs detalhados de todas as operações
   - Registro de erros com contexto
   - Monitoramento de atualizações de saldo 