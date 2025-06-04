import RewardChest from '../models/rewardChest.model.js';
import User from '../models/user.model.js';
import Transaction from '../models/transaction.model.js';

// Valores fixos dos baús
const CHEST_AMOUNTS = {
  1: 10,  // R$ 10,00
  2: 20,  // R$ 20,00
  3: 50   // R$ 50,00
};

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

    // Criar os 3 baús com os novos valores
    const chests = [];
    for (let i = 1; i <= 3; i++) {
      const chest = new RewardChest({
        userId,
        chestNumber: i,
        bonusAmount: CHEST_AMOUNTS[i]
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
        bonusAmount: chest.bonusAmount
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

    // Buscar dados do usuário para verificar saldo
    const user = await User.findById(userId);
    const hasMinimumBalance = user && user.balance >= 500;

    let chests = await RewardChest.find({ userId }).sort({ chestNumber: 1 });

    // Se não existem baús, inicializar automaticamente
    if (chests.length === 0) {
      const newChests = [];
      for (let i = 1; i <= 3; i++) {
        const chest = new RewardChest({
          userId,
          chestNumber: i,
          bonusAmount: CHEST_AMOUNTS[i]
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
      canOpen: !chest.opened && hasDeposit !== null && hasMinimumBalance
    }));

    res.json({
      success: true,
      hasDeposit: hasDeposit !== null,
      hasMinimumBalance,
      userBalance: user ? user.balance : 0,
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

    // Buscar o usuário e verificar saldo mínimo
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (user.balance < 500) {
      return res.status(403).json({
        success: false,
        message: 'Você precisa ter um saldo mínimo de R$ 500,00 para abrir os baús de recompensa'
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

    // Obter valor fixo do baú
    const bonusAmount = CHEST_AMOUNTS[chestNumber];

    // Criar transação de bônus
    const bonusTransaction = new Transaction({
      userId,
      type: 'BONUS',
      amount: bonusAmount,
      status: 'COMPLETED',
      paymentMethod: 'SYSTEM',
      metadata: {
        source: 'REWARD_CHEST',
        chestNumber,
        bonusAmount,
        description: `Baú ${chestNumber} - Bônus de R$ ${bonusAmount},00`
      }
    });

    // Salvar transação
    await bonusTransaction.save();

    // O saldo será atualizado automaticamente pelo middleware do modelo Transaction

    // Marcar baú como aberto
    chest.opened = true;
    chest.openedAt = new Date();
    chest.transactionId = bonusTransaction._id;
    await chest.save();

    // Buscar usuário atualizado para retornar o novo saldo
    const updatedUser = await User.findById(userId);

    res.json({
      success: true,
      message: `Parabéns! Você abriu o baú ${chestNumber} e ganhou R$ ${bonusAmount},00 de bônus!`,
      chest: {
        chestNumber: chest.chestNumber,
        opened: chest.opened,
        openedAt: chest.openedAt,
        bonusAmount,
        totalAmount: bonusAmount
      },
      newBalance: updatedUser.balance,
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
              $cond: ['$opened', '$bonusAmount', 0] 
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

// @desc    Corrigir valores dos baús existentes (Admin/Debug)
// @route   POST /api/reward-chests/fix-amounts
// @access  Private
export const fixChestAmounts = async (req, res) => {
  try {
    console.log('🔧 Iniciando correção dos valores dos baús...');

    // Buscar todos os baús que não foram abertos e têm valores incorretos
    const chestsToFix = await RewardChest.find({
      opened: false,
      $or: [
        { chestNumber: 1, bonusAmount: { $ne: CHEST_AMOUNTS[1] } },
        { chestNumber: 2, bonusAmount: { $ne: CHEST_AMOUNTS[2] } },
        { chestNumber: 3, bonusAmount: { $ne: CHEST_AMOUNTS[3] } }
      ]
    });

    console.log(`📋 Encontrados ${chestsToFix.length} baús para corrigir`);

    let correctedCount = 0;

    // Corrigir cada baú
    for (const chest of chestsToFix) {
      const correctAmount = CHEST_AMOUNTS[chest.chestNumber];
      const oldAmount = chest.bonusAmount;
      
      chest.bonusAmount = correctAmount;
      await chest.save();
      
      console.log(`✅ Baú ${chest.chestNumber} - Usuário ${chest.userId}: ${oldAmount} → ${correctAmount}`);
      correctedCount++;
    }

    // Buscar baús com valores corretos para verificação
    const allChests = await RewardChest.find({}).sort({ chestNumber: 1 });
    const summary = {
      1: { total: 0, correct: 0 },
      2: { total: 0, correct: 0 },
      3: { total: 0, correct: 0 }
    };

    allChests.forEach(chest => {
      summary[chest.chestNumber].total++;
      if (chest.bonusAmount === CHEST_AMOUNTS[chest.chestNumber]) {
        summary[chest.chestNumber].correct++;
      }
    });

    console.log('📊 Resumo da correção:', summary);

    res.json({
      success: true,
      message: `Correção concluída! ${correctedCount} baús foram atualizados.`,
      data: {
        correctedChests: correctedCount,
        summary,
        expectedValues: CHEST_AMOUNTS
      }
    });

  } catch (error) {
    console.error(`Erro ao corrigir valores dos baús: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao corrigir valores dos baús',
      error: error.message
    });
  }
}; 