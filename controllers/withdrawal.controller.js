import WithdrawalService from '../services/withdrawal.service.js';
import Transaction from '../models/transaction.model.js';
import User from '../models/user.model.js';

const withdrawalService = new WithdrawalService();

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

    // Criar transação
    const transaction = await Transaction.create({
      userId,
      type: 'WITHDRAWAL',
      amount,
      status: 'PENDING',
      paymentMethod: 'PIX',
      metadata: {
        pixDetails,
        processingDetails: {
          estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
        }
      }
    });

    // Atualizar saldo do usuário
    user.balance -= amount;
    await user.save();

    // Processar saque
    await withdrawalService.processWithdrawal(transaction);

    res.status(200).json({
      success: true,
      message: 'Saque solicitado com sucesso',
      transaction: {
        id: transaction._id,
        amount: transaction.amount,
        status: transaction.status,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
        estimatedCompletion: transaction.metadata.processingDetails.estimatedCompletion
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