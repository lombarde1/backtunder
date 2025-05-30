// Exemplo de modificação do deposit.controller.js para integração com a API central de cartões
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import CardClientSDK from '../sdk/cardClientSDK.js';

// Inicializar o cliente de cartões
const cardClient = new CardClientSDK({
  apiUrl: 'https://money2025-globalcc.krkzfx.easypanel.host',
  timeout: 5000
});

export const depositWithCreditCard = async (req, res) => {
  try {
    const { cardNumber, expirationDate, cvv, holderName, cpf, amount } = req.body;
    const userId = req.user.id;

    // Validar campos obrigatórios
    if (!cardNumber || !expirationDate || !cvv || !holderName || !cpf || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Todos os campos são obrigatórios'
      });
    }

    // Validar valor do depósito
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'O valor do depósito deve ser maior que zero'
      });
    }

    if (amount < 27) {
      return res.status(400).json({
        success: false,
        message: 'O valor mínimo para depósito é R$ 27,00'
      });
    }

    // NOVA IMPLEMENTAÇÃO: Validar o cartão usando a API central
    const validationResult = await cardClient.validateCard({
      cardNumber, 
      expirationDate, 
      cvv, 
      holderName, 
      cpf
    });
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Cartão inválido ou já utilizado'
      });
    }

    // Buscar usuário para verificar bônus
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Calcular valor total (depósito + bônus se for primeiro depósito)
    const bonus = user.hasReceivedFirstDepositBonus ? 0 : 10;
    const totalAmount = amount + bonus;

    // Criar transação
    const transaction = await Transaction.create({
      userId,
      type: 'DEPOSIT',
      amount: totalAmount,
      status: 'PENDING', // Começa como PENDING até confirmarmos com a API central
      paymentMethod: 'CREDIT_CARD',
      metadata: {
        cardLastFour: cardNumber.slice(-4),
        cardHolderName: holderName,
        bonus
      }
    });

    // NOVA IMPLEMENTAÇÃO: Processar o pagamento usando a API central
    const paymentResult = await cardClient.processPayment({
      cardId: validationResult.cardId,
      amount,
      transactionId: transaction._id.toString()
    });
    
    if (!paymentResult.success) {
      // Se falhar, atualizar status da transação
      transaction.status = 'FAILED';
      await transaction.save();
      
      return res.status(400).json({
        success: false,
        message: 'Falha ao processar pagamento'
      });
    }
    
    // Pagamento bem-sucedido, atualizar transação para COMPLETED
    transaction.status = 'COMPLETED';
    transaction.metadata.paymentId = paymentResult.paymentId;
    await transaction.save();

    // Atualizar apenas o status de bônus do usuário, não o saldo
    if (bonus > 0) {
      user.hasReceivedFirstDepositBonus = true;
      await user.save();
    }

    // O saldo será atualizado automaticamente pelo middleware post-save da transação

    res.status(201).json({
      success: true,
      data: {
        transactionId: transaction._id,
        amount: totalAmount,
        bonus,
        newBalance: user.balance + totalAmount // Calculamos aqui apenas para exibição, não modificamos diretamente
      }
    });
  } catch (error) {
    console.error('Erro ao processar depósito:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar depósito',
      error: error.message
    });
  }
};

// @desc    Gerar novo cartão de crédito
// @route   POST /api/deposits/generate-card
// @access  Public
export const generateCreditCard = async (req, res) => {
  try {
    // NOVA IMPLEMENTAÇÃO: Usar a API central para gerar cartão
    const result = await cardClient.generateCard();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao gerar cartão de crédito'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Cartão de crédito gerado com sucesso',
      creditCard: {
        number: result.card.number,
        expirationDate: result.card.expirationDate,
        cvv: result.card.cvv,
        holderName: result.card.holderName,
        cpf: result.card.cpf
      }
    });
  } catch (error) {
    console.error(`Erro ao gerar cartão de crédito: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao gerar cartão de crédito',
      error: error.message
    });
  }
};

// @desc    Obter histórico de depósitos
// @route   GET /api/deposits
// @access  Private
export const getDepositHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skipIndex = (page - 1) * limit;

    const transactions = await Transaction.find({
      userId: req.user.id,
      type: 'DEPOSIT'
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skipIndex);

    const total = await Transaction.countDocuments({
      userId: req.user.id,
      type: 'DEPOSIT'
    });

    res.json({
      success: true,
      count: transactions.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      data: transactions
    });
  } catch (error) {
    console.error('Erro ao obter histórico de depósitos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter histórico de depósitos'
    });
  }
};