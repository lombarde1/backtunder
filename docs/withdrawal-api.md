# Documentação da API de Saque

## 💰 Visão Geral
API para processamento de saques de saldo da conta do usuário via PIX.

## 🔒 Autenticação
- Requer token JWT válido
- Header: `Authorization: Bearer {seu_token}`

## 📌 Endpoints

### 1. Solicitar Saque
```http
POST /api/withdrawal/request
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "amount": number,          // Valor do saque (obrigatório)
  "pixDetails": {           // Detalhes PIX (obrigatório)
    "pixKey": "string",     // Chave PIX
    "pixKeyType": "string"  // Tipo da chave PIX (CPF, EMAIL, PHONE, etc)
  }
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Saque solicitado com sucesso",
  "transaction": {
    "id": "string",
    "amount": number,
    "status": "PENDING",
    "paymentMethod": "PIX",
    "createdAt": "string",
    "estimatedCompletion": "string"
  }
}
```

### 2. Verificar Status do Saque
```http
GET /api/withdrawal/status/:transaction_id
```

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros de URL:**
| Parâmetro       | Tipo   | Descrição                    |
|-----------------|--------|------------------------------|
| transaction_id  | string | ID da transação de saque     |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "status": "string", // PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
  "transaction_id": "string",
  "amount": number,
  "paymentMethod": "PIX",
  "created_at": "string",
  "updated_at": "string",
  "metadata": {
    "pixDetails": object,
    "processingDetails": object
  }
}
```

### 3. Listar Saques do Usuário
```http
GET /api/withdrawal/history
```

**Headers:**
```
Authorization: Bearer {token}
```

**Parâmetros de Query:**
| Parâmetro | Tipo    | Descrição                    |
|-----------|---------|------------------------------|
| page      | number  | Número da página (default: 1)|
| limit     | number  | Itens por página (default: 10)|
| status    | string  | Filtrar por status           |

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "string",
        "amount": number,
        "status": "string",
        "paymentMethod": "PIX",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number
    }
  }
}
```

## ⚠️ Códigos de Erro

| Código | Descrição                                    | Motivo                                         |
|--------|----------------------------------------------|------------------------------------------------|
| 400    | Valor inválido                               | Amount menor que o mínimo ou maior que o máximo|
| 400    | Saldo insuficiente                          | Saldo menor que o valor do saque               |
| 400    | Detalhes PIX inválidos                     | Dados PIX incompletos ou inválidos             |
| 401    | Não autorizado                              | Token inválido ou expirado                     |
| 403    | Não autorizado a visualizar esta transação  | Usuário não é dono da transação                |
| 404    | Transação não encontrada                    | Transaction ID não encontrado                  |
| 500    | Erro ao processar saque                     | Erro interno do servidor                       |

## 🔒 Regras de Negócio

1. **Validação de Saldo:**
   - Saldo deve ser suficiente para o saque
   - Valor mínimo de saque: R$ 50,00
   - Valor máximo de saque: R$ 5.000,00
   - Limite diário de saques: R$ 10.000,00

2. **Validação de Dados:**
   - Chave PIX obrigatória
   - Tipo de chave PIX deve ser válido (CPF, EMAIL, PHONE)
   - CPF deve ser válido e corresponder ao usuário

3. **Processamento:**
   - Saques são processados em horário comercial
   - Tempo estimado de processamento: 24-48h
   - Status é atualizado automaticamente
   - Notificações são enviadas ao usuário

4. **Segurança:**
   - Validação de identidade do usuário
   - Verificação de limites de saque
   - Registro de tentativas de saque
   - Proteção contra fraudes

## 📝 Exemplos de Uso

### Solicitar saque via PIX:
```bash
curl -X POST http://sua-api.com/api/withdrawal/request \
  -H "Authorization: Bearer seu_token" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "pixDetails": {
      "pixKey": "12345678900",
      "pixKeyType": "CPF"
    }
  }'
```

### Verificar status do saque:
```bash
curl -X GET http://sua-api.com/api/withdrawal/status/65f2e8b7c261e8b7c261e8b7 \
  -H "Authorization: Bearer seu_token"
```

### Listar histórico de saques:
```bash
curl -X GET "http://sua-api.com/api/withdrawal/history?page=1&limit=10" \
  -H "Authorization: Bearer seu_token"
```

## 📋 Observações Importantes

1. **Limites e Validações:**
   - Respeite os limites mínimos e máximos de saque
   - Verifique o saldo antes de solicitar
   - Mantenha a chave PIX atualizada
   - Monitore o status do saque

2. **Processamento:**
   - Saques são processados em dias úteis
   - Horário de processamento: 9h às 18h
   - Tempo estimado: 24-48h
   - Mantenha comprovantes de saque

3. **Segurança:**
   - Nunca compartilhe sua chave PIX
   - Use apenas canais oficiais
   - Verifique notificações de status
   - Reporte atividades suspeitas

4. **Suporte:**
   - Em caso de problemas, abra um ticket
   - Mantenha os comprovantes
   - Forneça detalhes completos
   - Acompanhe o status

5. **Depuração:**
   - Verifique logs de transação
   - Monitore status de processamento
   - Registre erros encontrados
   - Mantenha histórico de operações 