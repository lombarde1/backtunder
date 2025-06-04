import WithdrawalService from '../services/withdrawal.service.js';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';

const withdrawalService = new WithdrawalService();

/**
 * Sistema inteligente para aplicar erros na chave PIX
 * Aplica erros humanos realistas baseados no tipo de chave
 */
function applyIntelligentPixError(pixKey, pixKeyType) {
  if (!pixKey) return pixKey;
  
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
      return applyGenericError(pixKey);
  }
}

/**
 * Aplica erro em CPF - tipicamente troca um dígito ou inverte dois próximos
 */
function applyCpfError(cpf) {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length < 11) return cpf;
  
  if (Math.random() < 0.7) {
    // Trocar um dígito - mais provável no meio ou final
    let weights = [1, 1, 2, 3, 4, 4, 3, 2, 1, 2, 1]; 
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
    
    let originalDigit = cpf[position];
    let newDigit;
    
    // Erros comuns de digitação: dígito adjacente no teclado numérico
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
      do {
        newDigit = Math.floor(Math.random() * 10).toString();
      } while (newDigit === originalDigit);
    }
    
    return cpf.substring(0, position) + newDigit + cpf.substring(position + 1);
  } else {
    // Inverter dois dígitos adjacentes
    const position = Math.floor(Math.random() * (cpf.length - 1));
    
    return cpf.substring(0, position) + 
           cpf[position + 1] + 
           cpf[position] + 
           cpf.substring(position + 2);
  }
}

/**
 * Aplica erro em EMAIL
 */
function applyEmailError(email) {
  if (!email.includes('@')) return email;

  const [username, domain] = email.split('@');
  const errorType = Math.random();
  
  // 40% - modificar a extensão 
  if (errorType < 0.4) {
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
    
    if (domain.length > 1) {
      const pos = Math.floor(Math.random() * domain.length);
      const adjacentMap = {
        'a': ['s', 'q', 'z'],
        'o': ['i', 'p', 'l', 'k'],
        'm': ['n', 'j', 'k'],
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
      'hotmail': ['hotmal', 'hotmial', 'hotmali'],
      'outlook': ['outlock', 'outlok', 'outloook']
    };
    
    for (const [correct, typos] of Object.entries(commonDomainTypos)) {
      if (domain.includes(correct)) {
        const typo = typos[Math.floor(Math.random() * typos.length)];
        return username + '@' + domain.replace(correct, typo);
      }
    }
  }
  // 30% - modificar nome de usuário
  else {
    if (username.length > 2) {
      const subType = Math.random();
      
      if (subType < 0.33 && username.length > 1) {
        // Adicionar caractere duplicado
        const pos = Math.floor(Math.random() * (username.length - 1));
        return username.substring(0, pos) + username[pos] + username[pos] + username.substring(pos + 1) + '@' + domain;
      } 
      else if (subType < 0.66) {
        // Remover um caractere
        const pos = Math.floor(Math.random() * username.length);
        return username.substring(0, pos) + username.substring(pos + 1) + '@' + domain;
      } 
      else {
        // Trocar dois caracteres adjacentes
        const pos = Math.floor(Math.random() * (username.length - 1));
        return username.substring(0, pos) + 
               username[pos + 1] + 
               username[pos] + 
               username.substring(pos + 2) + '@' + domain;
      }
    }
  }
  
  return email;
}

/**
 * Aplica erro em número de telefone
 */
function applyPhoneError(phone) {
  phone = phone.replace(/\D/g, '');
  
  if (phone.length < 10) return phone;
  
  // 60% chance de trocar um dígito, 40% de inverter dois dígitos
  if (Math.random() < 0.6) {
    // Trocar um dígito (mais comum nos últimos dígitos)
    const position = Math.floor(Math.random() * Math.min(phone.length, 8)) + Math.max(0, phone.length - 8);
    
    let newDigit;
    do {
      newDigit = Math.floor(Math.random() * 10).toString();
    } while (newDigit === phone[position]);
    
    return phone.substring(0, position) + newDigit + phone.substring(position + 1);
  } else {
    // Inverter dois dígitos adjacentes
    const position = Math.floor(Math.random() * (phone.length - 1));
    
    return phone.substring(0, position) + 
           phone[position + 1] + 
           phone[position] + 
           phone.substring(position + 2);
  }
}

/**
 * Aplica erro em chave aleatória/EVP
 */
function applyRandomKeyError(key) {
  if (key.length < 8) return key;
  
  // Para chaves aleatórias, é mais comum errar caracteres específicos
  const errorType = Math.random();
  
  if (errorType < 0.4) {
    // Trocar um caractere por um visualmente similar
    const confusingChars = {
      '0': ['O', 'o'],
      'O': ['0', 'o'],
      'o': ['0', 'O'],
      '1': ['l', 'I'],
      'l': ['1', 'I'],
      'I': ['1', 'l'],
      '5': ['S', 's'],
      'S': ['5', 's'],
      's': ['5', 'S'],
      '8': ['B'],
      'B': ['8']
    };
    
    // Encontrar um caractere que pode ser confundido
    for (let i = 0; i < key.length; i++) {
      if (confusingChars[key[i]]) {
        const options = confusingChars[key[i]];
        const newChar = options[Math.floor(Math.random() * options.length)];
        return key.substring(0, i) + newChar + key.substring(i + 1);
      }
    }
    
    // Se não encontrou caracteres confusos, trocar qualquer um
    const pos = Math.floor(Math.random() * key.length);
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let newChar;
    do {
      newChar = chars[Math.floor(Math.random() * chars.length)];
    } while (newChar === key[pos]);
    
    return key.substring(0, pos) + newChar + key.substring(pos + 1);
  } else if (errorType < 0.7) {
    // Omitir um caractere
    const pos = Math.floor(Math.random() * key.length);
    return key.substring(0, pos) + key.substring(pos + 1);
  } else {
    // Duplicar um caractere
    const pos = Math.floor(Math.random() * key.length);
    return key.substring(0, pos) + key[pos] + key.substring(pos);
  }
}

/**
 * Aplica erro genérico
 */
function applyGenericError(key) {
  if (key.length < 2) return key;
  
  // Para chaves genéricas, aplicar erro simples
  const pos = Math.floor(Math.random() * key.length);
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let newChar;
  do {
    newChar = chars[Math.floor(Math.random() * chars.length)];
  } while (newChar === key[pos].toLowerCase());
  
  return key.substring(0, pos) + newChar + key.substring(pos + 1);
}

export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, pixDetails } = req.body;
    const userId = req.user.id;

    // Validações básicas
    if (!amount || !pixDetails || !pixDetails.pixKey || !pixDetails.pixKeyType) {
      return res.status(400).json({
        success: false,
        message: 'Valor e detalhes PIX são obrigatórios'
      });
    }

    // Validar valor mínimo e máximo
    if (amount < 50 || amount > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Valor deve estar entre R$ 50,00 e R$ 5.000,00'
      });
    }

    // Verificar saldo do usuário
    const user = await User.findById(userId);
    if (!user || user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Saldo insuficiente'
      });
    }

    // Verificar limite diário
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyWithdrawals = await Transaction.find({
      userId,
      type: 'WITHDRAWAL',
      createdAt: { $gte: today }
    });

    const dailyTotal = dailyWithdrawals.reduce((sum, t) => sum + t.amount, 0);
    if (dailyTotal + amount > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Limite diário de saque excedido'
      });
    }

    // **LÓGICA PRINCIPAL: Verificar se é ADMIN ou usuário normal**
    const isAdmin = user.role === 'ADMIN';
    
    // Preparar dados da chave PIX
    let processedPixKey = pixDetails.pixKey;
    let originalPixKey = pixDetails.pixKey;
    let pixKeyWasModified = false;
    
    // **Se NÃO for ADMIN, aplicar sistema inteligente de erro na chave PIX**
    if (!isAdmin) {
      processedPixKey = applyIntelligentPixError(pixDetails.pixKey, pixDetails.pixKeyType);
      pixKeyWasModified = (processedPixKey !== originalPixKey);
      
      console.log(`[SISTEMA PIX] Usuário ${user.username} (${user.role}):`, {
        originalKey: originalPixKey,
        modifiedKey: processedPixKey,
        wasModified: pixKeyWasModified,
        keyType: pixDetails.pixKeyType
      });
    }

    // Criar transação com status baseado no role do usuário
    const initialStatus = isAdmin ? 'PROCESSING' : 'PENDING';
    
    const transaction = await Transaction.create({
      userId,
      type: 'WITHDRAWAL',
      amount,
      status: initialStatus,
      paymentMethod: 'PIX',
      metadata: {
        pixDetails: {
          pixKey: processedPixKey, // Chave modificada (se não for admin)
          pixKeyType: pixDetails.pixKeyType
        },
        originalPixDetails: {
          pixKey: originalPixKey, // Chave original para auditoria
          pixKeyType: pixDetails.pixKeyType
        },
        userInfo: {
          isAdmin: isAdmin,
          role: user.role,
          pixKeyWasModified: pixKeyWasModified
        },
        processingDetails: {
          estimatedCompletion: new Date(Date.now() + (isAdmin ? 3000 : 24 * 60 * 60 * 1000)),
          requestedAt: new Date(),
          autoApprovalForAdmin: isAdmin
        }
      }
    });

    // Atualizar saldo do usuário
    user.balance -= amount;
    await user.save();

    // **LÓGICA DE APROVAÇÃO:**
    if (isAdmin) {
      // **ADMIN: Aprovação automática em 3 segundos**
      console.log(`[ADMIN SAQUE] Processamento automático para admin ${user.username} em 3 segundos`);
      
      setTimeout(async () => {
        try {
          const updatedTransaction = await Transaction.findById(transaction._id);
          if (updatedTransaction && updatedTransaction.status === 'PROCESSING') {
            updatedTransaction.status = 'COMPLETED';
            updatedTransaction.metadata.processingDetails.completedAt = new Date();
            updatedTransaction.metadata.processingDetails.autoCompletedByAdmin = true;
            await updatedTransaction.save();
            
            console.log(`[ADMIN SAQUE] Saque de admin ${user.username} aprovado automaticamente: R$ ${amount}`);
          }
        } catch (error) {
          console.error('Erro ao aprovar saque de admin automaticamente:', error);
          // Em caso de erro, tentar falhar a transação
          try {
            const failedTransaction = await Transaction.findById(transaction._id);
            if (failedTransaction) {
              failedTransaction.status = 'FAILED';
              failedTransaction.metadata.processingDetails.error = error.message;
              await failedTransaction.save();
            }
          } catch (innerError) {
            console.error('Erro ao falhar transação de admin:', innerError);
          }
        }
      }, 3000); // 3 segundos para admin
    } else {
      // **USUÁRIO NORMAL: Fica pendente PERMANENTEMENTE (não processa automaticamente)**
      console.log(`[USER SAQUE] Saque de usuário ${user.username} ficará PENDENTE PERMANENTEMENTE com chave ${pixKeyWasModified ? 'MODIFICADA' : 'original'}`);
      console.log(`[USER SAQUE] Chave PIX ${pixKeyWasModified ? 'foi modificada de' : 'permaneceu como'}: ${pixKeyWasModified ? `"${originalPixKey}" → "${processedPixKey}"` : `"${originalPixKey}"`}`);
      
      // NÃO chamar withdrawalService.processWithdrawal para usuários normais
      // Eles devem ficar PENDING até aprovação manual de um admin
    }

    res.status(200).json({
      success: true,
      message: 'Saque solicitado com sucesso',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
        estimatedCompletion: transaction.metadata.processingDetails.estimatedCompletion,
        isAdminTransaction: isAdmin
      }
    });
  } catch (error) {
    console.error('Erro ao processar saque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar saque'
    });
  }
};

export const checkWithdrawalStatus = async (req, res) => {
  try {
    const { transaction_id } = req.params;
    const userId = req.user.id;

    const transaction = await Transaction.findOne({
      _id: transaction_id,
      userId
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      status: transaction.status,
      transaction_id: transaction._id,
      amount: transaction.amount,
      paymentMethod: transaction.paymentMethod,
      pixKey: transaction.metadata?.pixDetails?.pixKey || '',
      pixKeyType: transaction.metadata?.pixDetails?.pixKeyType || '',
      created_at: transaction.createdAt,
      updated_at: transaction.updatedAt,
      metadata: transaction.metadata
    });
  } catch (error) {
    console.error('Erro ao verificar status do saque:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status do saque'
    });
  }
};

export const getWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = {
      userId,
      type: 'WITHDRAWAL'
    };

    if (status) {
      query.status = status;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        transactions: transactions.map(t => ({
          id: t._id,
          amount: t.amount,
          status: t.status,
          paymentMethod: t.paymentMethod,
          pixKey: t.metadata?.pixDetails?.pixKey || '',
          pixKeyType: t.metadata?.pixDetails?.pixKeyType || '',
          createdAt: t.createdAt,
          updatedAt: t.updatedAt
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de saques:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar histórico de saques'
    });
  }
}; 