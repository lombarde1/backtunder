# Exemplos de Uso da API ThunderBet

Este documento contém exemplos práticos de como usar a API ThunderBet em diferentes cenários.

## 🔧 Configuração Inicial

### Headers Padrão
```javascript
const headers = {
  'Content-Type': 'application/json',
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
};
```

### Base URL
```javascript
const BASE_URL = 'https://money2025-tunderapp.krkzfx.easypanel.host';
```

---

## 🔐 Fluxo de Autenticação

### 1. Registro de Usuário
```javascript
const registerUser = async () => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone: '+5511999999999',
      password: 'minhasenha123',
      username: 'jogador123',
      email: 'jogador@email.com',
      fullName: 'João Silva',
      cpf: '12345678901'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Salvar token para uso futuro
    localStorage.setItem('token', data.data.token);
    console.log('Usuário registrado:', data.data);
  }
};
```

### 2. Login
```javascript
const loginUser = async () => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      phone: '+5511999999999',
      password: 'minhasenha123'
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    console.log('Login realizado:', data.data);
  }
};
```

### 3. Obter Perfil
```javascript
const getUserProfile = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Perfil do usuário:', data.data);
};
```

---

## 🎮 Gerenciamento de Jogos

### 1. Listar Jogos com Filtros
```javascript
const getGames = async (filters = {}) => {
  const queryParams = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    category: filters.category || '',
    provider: filters.provider || '',
    search: filters.search || ''
  });
  
  const response = await fetch(`${BASE_URL}/games?${queryParams}`);
  const data = await response.json();
  
  console.log('Jogos encontrados:', data.games);
  return data;
};

// Exemplo de uso
getGames({
  category: 'slots',
  provider: 'Pragmatic Play',
  page: 1,
  limit: 20
});
```

### 2. Obter Jogos em Destaque
```javascript
const getFeaturedGames = async () => {
  const response = await fetch(`${BASE_URL}/games/featured`);
  const data = await response.json();
  
  console.log('Jogos em destaque:', data.games);
  return data.games;
};
```

### 3. Criar Novo Jogo (Admin)
```javascript
const createGame = async (gameData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: 'Sweet Bonanza',
      provider: 'Pragmatic Play',
      category: 'slots',
      imageUrl: 'https://example.com/sweet-bonanza.jpg',
      description: 'Jogo de slots com tema de doces',
      minBet: 0.20,
      maxBet: 100.00,
      rtp: 96.51,
      isActive: true,
      isFeatured: true,
      gameConfig: {
        reels: 6,
        rows: 5,
        paylines: 'cluster'
      }
    })
  });
  
  const data = await response.json();
  console.log('Jogo criado:', data.game);
};
```

---

## 🎯 Sistema de Apostas

### 1. Criar Aposta
```javascript
const createBet = async (gameId, amount, prediction) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/bets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      gameId: gameId,
      amount: amount,
      prediction: prediction
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Aposta criada:', data.bet);
  } else {
    console.error('Erro ao criar aposta:', data.message);
  }
  
  return data;
};

// Exemplo de uso
createBet('64f1a2b3c4d5e6f7g8h9i0j1', 10.50, {
  type: 'color',
  value: 'red',
  multiplier: 2
});
```

### 2. Obter Histórico de Apostas
```javascript
const getUserBets = async (userId, filters = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    status: filters.status || ''
  });
  
  const response = await fetch(`${BASE_URL}/bets/user/${userId}?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Histórico de apostas:', data.data.bets);
  return data;
};
```

### 3. Cancelar Aposta
```javascript
const cancelBet = async (betId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/bets/${betId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Aposta cancelada:', data.bet);
  }
  
  return data;
};
```

---

## 💰 Sistema Financeiro

### 1. Depósito via PIX
```javascript
const generatePixDeposit = async (amount) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/pix/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount: amount
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('QR Code PIX gerado:', data.qrCode);
    // Exibir QR Code para o usuário
    displayQRCode(data.qrCode.qrCodeBase64);
    
    // Verificar status do pagamento periodicamente
    checkPixPaymentStatus(data.qrCode.externalId);
  }
  
  return data;
};

const checkPixPaymentStatus = async (externalId) => {
  const token = localStorage.getItem('token');
  
  const checkStatus = async () => {
    const response = await fetch(`${BASE_URL}/pix/status/${externalId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.payment.status === 'PAID') {
      console.log('Pagamento confirmado!');
      // Atualizar saldo do usuário
      getUserProfile();
      return true;
    }
    
    return false;
  };
  
  // Verificar a cada 5 segundos por até 10 minutos
  const interval = setInterval(async () => {
    const isPaid = await checkStatus();
    if (isPaid) {
      clearInterval(interval);
    }
  }, 5000);
  
  // Parar verificação após 10 minutos
  setTimeout(() => {
    clearInterval(interval);
  }, 600000);
};
```

### 2. Depósito via Cartão de Crédito
```javascript
const depositWithCreditCard = async (depositData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/deposits/credit-card`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount: depositData.amount,
      cardNumber: depositData.cardNumber,
      cardHolderName: depositData.cardHolderName,
      expiryDate: depositData.expiryDate,
      cvv: depositData.cvv
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Depósito processado:', data.transaction);
  }
  
  return data;
};

// Exemplo de uso
depositWithCreditCard({
  amount: 100.00,
  cardNumber: '4111111111111111',
  cardHolderName: 'João Silva',
  expiryDate: '12/25',
  cvv: '123'
});
```

### 3. Solicitar Saque
```javascript
const requestWithdrawal = async (withdrawalData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/withdrawals/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount: withdrawalData.amount,
      pixKey: withdrawalData.pixKey,
      pixKeyType: withdrawalData.pixKeyType
    })
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Saque solicitado:', data.withdrawal);
  }
  
  return data;
};

// Exemplo de uso
requestWithdrawal({
  amount: 50.00,
  pixKey: 'joao@email.com',
  pixKeyType: 'EMAIL'
});
```

### 4. Verificar Status do Saque
```javascript
const checkWithdrawalStatus = async (transactionId) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/withdrawals/status/${transactionId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Status do saque:', data.withdrawal);
  return data;
};
```

---

## 📊 Relatórios e Histórico

### 1. Histórico de Transações
```javascript
const getTransactionHistory = async (filters = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    type: filters.type || '',
    status: filters.status || ''
  });
  
  const response = await fetch(`${BASE_URL}/transactions?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Histórico de transações:', data.transactions);
  return data;
};

// Exemplo de uso
getTransactionHistory({
  type: 'DEPOSIT',
  status: 'COMPLETED',
  page: 1,
  limit: 20
});
```

### 2. Histórico de Depósitos
```javascript
const getDepositHistory = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams({ page, limit });
  
  const response = await fetch(`${BASE_URL}/deposits/history?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Histórico de depósitos:', data.deposits);
  return data;
};
```

### 3. Histórico de Saques
```javascript
const getWithdrawalHistory = async (page = 1, limit = 10) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams({ page, limit });
  
  const response = await fetch(`${BASE_URL}/withdrawals/history?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Histórico de saques:', data.withdrawals);
  return data;
};
```

---

## 🎁 Sistema de Recompensas

### 1. Verificar Status dos Baús
```javascript
const getRewardChests = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/reward-chests`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Status dos baús:', data.chests);
  return data;
};
```

### 2. Abrir Baú de Recompensa
```javascript
const openRewardChest = async (chestNumber) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/reward-chests/${chestNumber}/open`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Baú aberto! Recompensa:', data.reward);
    console.log('Novo saldo:', data.newBalance);
  }
  
  return data;
};

// Exemplo de uso
openRewardChest(1); // Abre o primeiro baú
```

---

## 👥 Administração (Admin)

### 1. Listar Todos os Usuários
```javascript
const getAllUsers = async (filters = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    search: filters.search || '',
    status: filters.status || ''
  });
  
  const response = await fetch(`${BASE_URL}/users?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Lista de usuários:', data.users);
  return data;
};
```

### 2. Atualizar Usuário
```javascript
const updateUser = async (userId, updateData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Usuário atualizado:', data.user);
  }
  
  return data;
};

// Exemplo de uso
updateUser('64f1a2b3c4d5e6f7g8h9i0j1', {
  status: 'BLOCKED',
  balance: 100.00
});
```

### 3. Gerenciar Transações
```javascript
const getAllTransactions = async (filters = {}) => {
  const token = localStorage.getItem('token');
  const queryParams = new URLSearchParams({
    page: filters.page || 1,
    limit: filters.limit || 10,
    type: filters.type || '',
    status: filters.status || '',
    userId: filters.userId || ''
  });
  
  const response = await fetch(`${BASE_URL}/transactions/admin/all?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  console.log('Todas as transações:', data.transactions);
  return data;
};

const updateTransactionStatus = async (transactionId, status) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${BASE_URL}/transactions/${transactionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  
  const data = await response.json();
  console.log('Transação atualizada:', data.transaction);
  return data;
};
```

---

## 🛠️ Utilitários e Helpers

### 1. Tratamento de Erros
```javascript
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }
    
    return data;
  } catch (error) {
    console.error('Erro na API:', error.message);
    throw error;
  }
};
```

### 2. Interceptor para Token Expirado
```javascript
const apiRequestWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    },
    ...options
  };
  
  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (response.status === 401) {
      // Token expirado, redirecionar para login
      localStorage.removeItem('token');
      window.location.href = '/login';
      return;
    }
    
    if (!response.ok) {
      throw new Error(data.message || 'Erro na requisição');
    }
    
    return data;
  } catch (error) {
    console.error('Erro na API:', error.message);
    throw error;
  }
};
```

### 3. Formatação de Valores
```javascript
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};
```

---

## 🔄 Fluxos Completos

### 1. Fluxo Completo de Registro e Primeiro Depósito
```javascript
const completeRegistrationFlow = async (userData, depositAmount) => {
  try {
    // 1. Registrar usuário
    const registerResponse = await apiRequest(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    
    if (!registerResponse.success) {
      throw new Error('Erro no registro');
    }
    
    // 2. Salvar token
    localStorage.setItem('token', registerResponse.data.token);
    
    // 3. Gerar PIX para primeiro depósito
    const pixResponse = await generatePixDeposit(depositAmount);
    
    return {
      user: registerResponse.data,
      pixQrCode: pixResponse.qrCode
    };
    
  } catch (error) {
    console.error('Erro no fluxo de registro:', error);
    throw error;
  }
};
```

### 2. Fluxo de Aposta Completo
```javascript
const completeBettingFlow = async (gameId, betAmount, prediction) => {
  try {
    // 1. Verificar saldo
    const profile = await getUserProfile();
    if (profile.data.balance < betAmount) {
      throw new Error('Saldo insuficiente');
    }
    
    // 2. Criar aposta
    const betResponse = await createBet(gameId, betAmount, prediction);
    
    // 3. Monitorar resultado da aposta
    const betId = betResponse.bet.id;
    
    // Simular verificação periódica do resultado
    const checkBetResult = setInterval(async () => {
      const betDetails = await getBetById(betId);
      
      if (betDetails.bet.status !== 'PENDING') {
        clearInterval(checkBetResult);
        
        if (betDetails.bet.status === 'WON') {
          console.log('Parabéns! Você ganhou:', betDetails.bet.payout);
        } else {
          console.log('Aposta perdida');
        }
      }
    }, 2000);
    
    return betResponse;
    
  } catch (error) {
    console.error('Erro no fluxo de aposta:', error);
    throw error;
  }
};
```

Este arquivo de exemplos fornece implementações práticas e prontas para uso de todas as funcionalidades da API ThunderBet, facilitando a integração e desenvolvimento de aplicações cliente. 