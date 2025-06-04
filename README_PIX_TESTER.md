# 🔔 PIX Webhook Tester - ThunderBet

Interface gráfica em Python para testar a **lógica especial PIX** em ambiente de desenvolvimento.

## 🚀 Instalação e Execução

### Pré-requisitos
- Python 3.6+ instalado
- Biblioteca `requests` (instalar se não tiver)
- **Backend ThunderBet rodando em `localhost:3001`**

```bash
pip install requests
```

### 1. Iniciar o Backend (OBRIGATÓRIO)
```bash
# No diretório backend/
cd backend
npm start
# ou para desenvolvimento com auto-reload:
npm run dev
```

### 2. Executar o Tester
```bash
# Em outro terminal, no diretório backend/
python pix_webhook_tester.py
```

> ⚠️ **IMPORTANTE**: O backend DEVE estar rodando na porta 3001 antes de usar o tester!

## 🎯 Como Usar

### 1. **Configurações**
- **URL da API**: Por padrão `https://money2025-tunderapp.krkzfx.easypanel.host` (ajuste se necessário)
- **Transaction ID**: ID da transação PIX (pré-preenchido com exemplo)
- **Valor Pago**: Valor que simula o pagamento real (padrão R$ 35,00)

### 2. **Testar a Lógica Especial**

**Cenário para testar o "bugzinho proposital":**

1. **Gere um PIX de R$ 500,00** no sistema (frontend) e **NÃO PAGUE**
2. **Gere um PIX de R$ 35,00** no sistema (frontend) 
3. **Use o Tester para simular o pagamento** do PIX de R$ 35,00
4. **Resultado esperado**: Sistema creditará **APENAS R$ 500,00** (valor maior pendente)
5. **Importante**: O PIX de R$ 35,00 será automaticamente cancelado

> 💡 **Lógica**: Apenas o valor maior é creditado, evitando soma (R$ 500 + R$ 35 = R$ 535)

### 3. **Funcionalidades da Interface**

#### 🚀 **Enviar Webhook PIX**
- Simula o pagamento PIX com os dados configurados
- Mostra resposta detalhada do servidor
- Identifica se a lógica especial foi aplicada

#### 📊 **Verificar Transações Pendentes**
- Lista todas as transações PIX pendentes no sistema
- Mostra estatísticas da lógica especial
- Útil para verificar o estado antes/depois dos testes

#### 🧹 **Limpar Logs**
- Limpa a área de logs para nova sessão de testes

## 🔍 Interpretando os Logs

### ✅ **Sucesso com Lógica Especial**
```
✅ SUCESSO!
🔥 LÓGICA ESPECIAL FOI APLICADA!
💰 Valor creditado: R$ 500,00
💳 Valor pago: R$ 35.00
🗑️ Transações canceladas: 1
✅ Total creditado final: R$ 500,00
📝 Apenas o valor maior foi creditado, outras transações foram canceladas
```

### 📊 **Estatísticas**
```
🔥 Total de aplicações da lógica especial: 5
📈 Hoje: 2 | Esta semana: 5 | Este mês: 12
💰 Total creditado: R$ 2.450,00
📋 Transações PIX pendentes: 3
```

## 🎮 Cenários de Teste

### **Cenário 1: Lógica Especial Básica**
1. Gerar PIX R$ 500,00 → Não pagar
2. Gerar PIX R$ 35,00 → Simular pagamento via tester
3. **Resultado**: Credita **apenas** R$ 500,00 (PIX de R$ 35,00 cancelado)

### **Cenário 2: Múltiplos PIX Pendentes**
1. Gerar PIX R$ 1000,00 → Não pagar
2. Gerar PIX R$ 200,00 → Não pagar  
3. Gerar PIX R$ 50,00 → Simular pagamento via tester
4. **Resultado**: Credita **apenas** R$ 1000,00 (outros 2 PIX cancelados)

### **Cenário 3: Sem PIX Pendentes**
1. Simular pagamento sem ter PIX pendentes
2. **Resultado**: Erro - Nenhuma transação pendente

## 🐛 Troubleshooting

### **Erro 404 - Cannot POST /api/pix/webhook**
- ✅ **Verificar se o backend está rodando**: `npm start` ou `node app.js`
- ✅ **Confirmar porta**: Backend deve estar em `localhost:3001`
- ✅ **Verificar rotas**: As rotas PIX devem estar carregadas no `app.js`
- ✅ **Restart do servidor**: Reinicie o backend após mudanças

### **Erro de Conexão**
- Verificar se o backend está rodando em `localhost:3001`
- Confirmar URL da API nas configurações

### **Nenhuma Transação Pendente**
- Gerar PIX via frontend primeiro
- Verificar se o PIX não expirou
- Usar botão "Verificar Transações Pendentes"

### **Lógica Especial Não Aplicada**
- Confirmar que existe PIX pendente de valor maior
- Verificar logs do servidor backend para debug detalhado

## 🛠️ Recursos Técnicos

- **Interface Gráfica**: tkinter (incluído no Python)
- **Requisições HTTP**: biblioteca requests
- **Threading**: Não trava a interface durante requisições
- **Logs Coloridos**: Terminal estilo hacker com timestamps
- **Status Bar**: Feedback visual das operações

## 📝 Logs do Servidor

Acompanhe os logs do backend para ver os emojis identificadores:

```
🔔 PIX RECEBIDO - INICIANDO PROCESSAMENTO
👤 Usuário identificado: 60f7b3b4d5e8a12345678901
🎯 LÓGICA ESPECIAL ATIVADA!
💰 Transação encontrada: 60f7b3b4d5e8a12345678902
💵 Valor que será creditado: R$ 500,00
✅ LÓGICA ESPECIAL APLICADA COM SUCESSO!
🔥 BUGZINHO PROPOSITAL ATIVADO
```

## 🔒 Segurança

Este tester é **APENAS PARA DESENVOLVIMENTO**. Não use em produção.
- Remove qualquer referência em ambiente produtivo
- Os endpoints de debug devem ser protegidos/removidos em prod 