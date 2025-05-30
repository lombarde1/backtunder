import mongoose from 'mongoose';

const rewardChestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chestNumber: {
    type: Number,
    required: true,
    enum: [1, 2, 3],
    validate: {
      validator: function(value) {
        return [1, 2, 3].includes(value);
      },
      message: 'Número do baú deve ser 1, 2 ou 3'
    }
  },
  opened: {
    type: Boolean,
    default: false
  },
  openedAt: {
    type: Date
  },
  bonusAmount: {
    type: Number,
    default: 3 // R$ 3,00 de bônus padrão
  },
  extraAmount: {
    type: Number,
    default: 0 // R$ 500,00 adicional apenas no terceiro baú
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }
}, {
  timestamps: true
});

// Índice composto para garantir que cada usuário tenha apenas um baú de cada número
rewardChestSchema.index({ userId: 1, chestNumber: 1 }, { unique: true });

// Índices para otimização
rewardChestSchema.index({ userId: 1 });
rewardChestSchema.index({ opened: 1 });

const RewardChest = mongoose.model('RewardChest', rewardChestSchema);

export default RewardChest; 