import Bet from '../models/bet.model.js';
import User from '../models/user.model.js';
import Game from '../models/game.model.js';

export const createBet = async (req, res) => {
  try {
    const { gameId, amount, prediction } = req.body;
    const userId = req.user.id;

    // Validar dados
    if (!gameId || !amount || !prediction) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos'
      });
    }

    // Verificar se o jogo existe e está ativo
    const game = await Game.findById(gameId);
    if (!game || game.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Jogo não encontrado ou não está ativo'
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

    // Criar aposta
    const bet = await Bet.create({
      userId,
      gameId,
      amount,
      prediction,
      status: 'PENDING'
    });

    // Atualizar saldo do usuário
    user.balance -= amount;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Aposta criada com sucesso',
      bet
    });
  } catch (error) {
    console.error('Erro ao criar aposta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar aposta'
    });
  }
};

export const getBetById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const bet = await Bet.findOne({
      _id: id,
      userId
    }).populate('gameId');

    if (!bet) {
      return res.status(404).json({
        success: false,
        message: 'Aposta não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      bet
    });
  } catch (error) {
    console.error('Erro ao buscar aposta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar aposta'
    });
  }
};

export const getUserBets = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const bets = await Bet.find(query)
      .populate('gameId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Bet.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        bets,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Erro ao buscar apostas do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar apostas do usuário'
    });
  }
};

export const cancelBet = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const bet = await Bet.findOne({
      _id: id,
      userId,
      status: 'PENDING'
    });

    if (!bet) {
      return res.status(404).json({
        success: false,
        message: 'Aposta não encontrada ou não pode ser cancelada'
      });
    }

    // Verificar se o jogo ainda está ativo
    const game = await Game.findById(bet.gameId);
    if (!game || game.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar esta aposta'
      });
    }

    // Restaurar saldo do usuário
    const user = await User.findById(userId);
    user.balance += bet.amount;
    await user.save();

    // Atualizar status da aposta
    bet.status = 'CANCELLED';
    bet.cancelledAt = new Date();
    await bet.save();

    res.status(200).json({
      success: true,
      message: 'Aposta cancelada com sucesso',
      bet
    });
  } catch (error) {
    console.error('Erro ao cancelar aposta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao cancelar aposta'
    });
  }
}; 