import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';
import CreditCard from '../models/creditCard.model.js';

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
  
      if (amount < 35) {
        return res.status(400).json({
          success: false,
          message: 'O valor mínimo para depósito é R$ 35,00'
        });
      }
  
      // Verificar se o cartão existe e não foi usado
      const card = await CreditCard.findOne({
        number: cardNumber,
        expirationDate,
        cvv,
        holderName,
        cpf,
        isUsed: false
      });
  
      if (!card) {
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
  
      // Marcar cartão como usado
      card.isUsed = true;
      await card.save();
  
      // Criar transação
      const transaction = await Transaction.create({
        userId,
        type: 'DEPOSIT',
        amount: totalAmount,
        status: 'COMPLETED',
        paymentMethod: 'CREDIT_CARD',
        metadata: {
          cardLastFour: cardNumber.slice(-4),
          cardHolderName: holderName,
          bonus
        }
      });
  
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
        message: 'Erro ao processar depósito'
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