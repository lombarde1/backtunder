import RewardChest from '../models/rewardChest.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

// @desc    Inicializar baús de recompensa para um usuário
// @route   POST /api/reward-chests/initialize
// @access  Private
export const initializeRewardChests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar se os baús já foram inicializados
    const existingChests = await RewardChest.find({ userId });
    
    if (existingChests.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Baús de recompensa já foram inicializados para este usuário'
      });
    }

    // Criar os 3 baús
    const chests = [];
    for (let i = 1; i <= 3; i++) {
      const chest = new RewardChest({
        userId,
        chestNumber: i,
        bonusAmount: 3,
        extraAmount: i === 3 ? 500 : 0 // Apenas o terceiro baú tem valor extra
      });
      chests.push(chest);
    }

    await RewardChest.insertMany(chests);

    res.status(201).json({
      success: true,
      message: 'Baús de recompensa inicializados com sucesso',
      chests: chests.map(chest => ({
        chestNumber: chest.chestNumber,
        opened: chest.opened,
        bonusAmount: chest.bonusAmount,
        extraAmount: chest.extraAmount
      }))
    });

  } catch (error) {
    console.error(`Erro ao inicializar baús: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao inicializar baús de recompensa',
      error: error.message
    });
  }
};

// @desc    Obter status dos baús de recompensa do usuário
// @route   GET /api/reward-chests
// @access  Private
export const getUserRewardChests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Verificar se o usuário fez algum depósito
    const hasDeposit = await Transaction.findOne({
      userId,
      type: 'DEPOSIT',
      status: 'COMPLETED'
    });

    let chests = await RewardChest.find({ userId }).sort({ chestNumber: 1 });

    // Se não existem baús, inicializar automaticamente
    if (chests.length === 0) {
      const newChests = [];
      for (let i = 1; i <= 3; i++) {
        const chest = new RewardChest({
          userId,
          chestNumber: i,
          bonusAmount: 3,
          extraAmount: i === 3 ? 500 : 0
        });
        newChests.push(chest);
      }
      chests = await RewardChest.insertMany(newChests);
    }

    const chestsData = chests.map(chest => ({
      id: chest._id,
      chestNumber: chest.chestNumber,
      opened: chest.opened,
      openedAt: chest.openedAt,
      bonusAmount: chest.bonusAmount,
      extraAmount: chest.extraAmount,
      canOpen: !chest.opened && hasDeposit !== null
    }));

    res.json({
      success: true,
      hasDeposit: hasDeposit !== null,
      chests: chestsData
    });

  } catch (error) {
    console.error(`Erro ao obter baús: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter baús de recompensa',
      error: error.message
    });
  }
};

// @desc    Abrir um baú de recompensa
// @route   POST /api/reward-chests/:chestNumber/open
// @access  Private
export const openRewardChest = async (req, res) => {
  try {
    const userId = req.user.id;
    const chestNumber = parseInt(req.params.chestNumber);

    // Validar número do baú
    if (![1, 2, 3].includes(chestNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Número do baú inválido. Deve ser 1, 2 ou 3'
      });
    }

    // Verificar se o usuário fez algum depósito
    const hasDeposit = await Transaction.findOne({
      userId,
      type: 'DEPOSIT',
      status: 'COMPLETED'
    });

    if (!hasDeposit) {
      return res.status(403).json({
        success: false,
        message: 'Você precisa fazer pelo menos um depósito para abrir os baús de recompensa'
      });
    }

    // Buscar o baú
    const chest = await RewardChest.findOne({
      userId,
      chestNumber
    });

    if (!chest) {
      return res.status(404).json({
        success: false,
        message: 'Baú não encontrado'
      });
    }

    // Verificar se o baú já foi aberto
    if (chest.opened) {
      return res.status(400).json({
        success: false,
        message: 'Este baú já foi aberto'
      });
    }

    // Buscar o usuário
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Calcular valores da recompensa
    const bonusAmount = chest.bonusAmount;
    const extraAmount = chest.extraAmount;
    const totalAmount = bonusAmount + extraAmount;

    // Criar transação de bônus
    const bonusTransaction = new Transaction({
      userId,
      type: 'BONUS',
      amount: totalAmount,
      status: 'COMPLETED',
      paymentMethod: 'SYSTEM',
      metadata: {
        source: 'REWARD_CHEST',
        chestNumber,
        bonusAmount,
        extraAmount,
        description: chestNumber === 3 
          ? `Baú ${chestNumber} - Bônus de R$ ${bonusAmount} + Prêmio especial de R$ ${extraAmount}`
          : `Baú ${chestNumber} - Bônus de R$ ${bonusAmount}`
      }
    });

    // Salvar transação
    await bonusTransaction.save();

    // Atualizar saldo do usuário
    user.balance += totalAmount;
    await user.save();

    // Marcar baú como aberto
    chest.opened = true;
    chest.openedAt = new Date();
    chest.transactionId = bonusTransaction._id;
    await chest.save();

    res.json({
      success: true,
      message: `Parabéns! Você abriu o baú ${chestNumber} e ganhou R$ ${bonusAmount} de bônus!`,
      chest: {
        chestNumber: chest.chestNumber,
        opened: chest.opened,
        openedAt: chest.openedAt,
        bonusAmount,
        extraAmount,
        totalAmount
      },
      newBalance: user.balance,
      transaction: {
        id: bonusTransaction._id,
        amount: bonusTransaction.amount,
        type: bonusTransaction.type
      }
    });

  } catch (error) {
    console.error(`Erro ao abrir baú: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao abrir baú de recompensa',
      error: error.message
    });
  }
};

// @desc    Obter estatísticas dos baús (Admin)
// @route   GET /api/reward-chests/stats
// @access  Private/Admin
export const getRewardChestStats = async (req, res) => {
  try {
    const stats = await RewardChest.aggregate([
      {
        $group: {
          _id: '$chestNumber',
          totalChests: { $sum: 1 },
          openedChests: {
            $sum: { $cond: ['$opened', 1, 0] }
          },
          totalBonusDistributed: {
            $sum: { 
              $cond: ['$opened', { $add: ['$bonusAmount', '$extraAmount'] }, 0] 
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const usersWithChests = await RewardChest.distinct('userId').then(users => users.length);

    res.json({
      success: true,
      stats: {
        totalUsers,
        usersWithChests,
        chestStats: stats
      }
    });

  } catch (error) {
    console.error(`Erro ao obter estatísticas: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas dos baús',
      error: error.message
    });
  }
}; 