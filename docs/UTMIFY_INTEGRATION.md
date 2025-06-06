# 📊 Integração UTMify - ThunderBet

## 🎯 Visão Geral

A integração com UTMify permite rastrear eventos de conversão e análise de performance das campanhas de marketing do ThunderBet. Os eventos são enviados automaticamente quando:

1. **PIX é gerado** (waiting_payment)
2. **PIX é aprovado** (paid)
3. **Depósito por cartão** é processado (paid)

## 🔧 Configuração

### Token de API
O token UTMify está configurado no serviço:
```javascript
this.apiToken = '33N6gEl24sqy7juqxyk1dKOzvuQvkLaNJ8aT';
```

### URL Base
```javascript
this.baseUrl = 'https://api.utmify.com.br/api-credentials/orders';
```

## 📡 Eventos Enviados

### 1. PIX Gerado (waiting_payment)
**Quando:** Usuário gera QR Code PIX
**Endpoint:** `POST /api/pix/generate`
**Status:** `waiting_payment`

### 2. PIX Aprovado (paid)
**Quando:** Webhook confirma pagamento PIX
**Endpoint:** `POST /api/pix/webhook`
**Status:** `paid`

### 3. Depósito Cartão (paid)
**Quando:** Depósito por cartão é processado
**Endpoint:** `POST /api/deposits/credit-card`
**Status:** `paid`

## 🎯 Estrutura dos Dados

### Payload Padrão
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "platform": "ThunderBet",
  "paymentMethod": "pix",
  "status": "waiting_payment|paid",
  "createdAt": "2024-01-15 10:30:00",
  "approvedDate": "2024-01-15 10:35:00",
  "refundedAt": null,
  "customer": {
    "name": "João Silva",
    "email": "joao.silva@email.com",
    "phone": "11999999999",
    "document": "12345678901",
    "country": "BR",
    "ip": null
  },
  "products": [{
    "id": "507f1f77bcf86cd799439011",
    "name": "ThunderBet Depósito PIX",
    "planId": null,
    "planName": null,
    "quantity": 1,
    "priceInCents": 10000
  }],
  "trackingParameters": {
    "src": null,
    "sck": null,
    "utm_source": null,
    "utm_campaign": null,
    "utm_medium": null,
    "utm_content": null,
    "utm_term": null
  },
  "commission": {
    "totalPriceInCents": 10000,
    "gatewayFeeInCents": 500,
    "userCommissionInCents": 9500
  },
  "isTest": false
}
```

## 🔄 Fluxo de Integração

### PIX Normal
1. Usuário solicita PIX → **Evento "waiting_payment"**
2. Usuário paga PIX → **Evento "paid"**

### PIX com Lógica Especial
1. Usuário gera PIX R$ 500 → **Evento "waiting_payment"**
2. Usuário gera PIX R$ 35 → **Evento "waiting_payment"**
3. Usuário paga R$ 35 → **Evento "paid"** (com valor R$ 500)

### Cartão de Crédito
1. Usuário deposita → **Evento "paid"** (imediato)

## 📊 Monitoramento

### Logs de Sucesso
```
📊 Evento PIX Gerado enviado para UTMify com sucesso
💰 Evento PIX Aprovado enviado para UTMify com sucesso
💳 Evento Depósito Cartão enviado para UTMify com sucesso
```

### Logs de Erro
```
⚠️ Falha ao enviar evento PIX Gerado para UTMify: [erro]
⚠️ Falha ao enviar evento PIX Aprovado para UTMify: [erro]
⚠️ Falha ao enviar evento Depósito Cartão para UTMify: [erro]
```

## 🧪 Teste da Integração

Execute o teste manual:
```bash
node test-utmify-integration.js
```

### Resultado Esperado:
```
🧪 Iniciando teste da integração UTMify...

📊 Teste 1: Enviando evento PIX Gerado
✅ Evento PIX Gerado enviado com sucesso

==================================================

💰 Teste 2: Enviando evento PIX Aprovado
✅ Evento PIX Aprovado enviado com sucesso

🏁 Teste concluído!
```

## ⚠️ Considerações Importantes

### 1. Não Bloqueia o Fluxo Principal
- Se UTMify falhar, o depósito/PIX continua funcionando
- Erros são logados, mas não interrompem o usuário

### 2. Timeout Configurado
- 10 segundos de timeout para evitar travamentos
- Falhas silenciosas para não afetar UX

### 3. Tracking Parameters
- Atualmente enviados como `null` (sem acesso no backend)
- Estrutura preparada para futuras implementações

### 4. Comissões
- 5% taxa gateway
- 95% comissão usuário
- Configurável no serviço

## 🔐 Segurança

- Token de API hardcoded (ambiente de desenvolvimento)
- Em produção, mover para variáveis de ambiente
- Headers de autenticação configurados corretamente

## 📈 Próximos Passos

1. Implementar captura de UTM parameters no frontend
2. Configurar token via variáveis de ambiente
3. Adicionar retry automático em caso de falha
4. Implementar fila de eventos para maior confiabilidade
5. Adicionar métricas de sucesso/falha dos envios 