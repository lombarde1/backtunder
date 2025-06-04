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
    required: true,
    validate: {
      validator: function(value) {
        // Validar valores específicos para cada baú
        const validAmounts = {
          1: 10,  // Baú 1: R$ 10,00
          2: 20,  // Baú 2: R$ 20,00
          3: 50   // Baú 3: R$ 50,00
        };
        return validAmounts[this.chestNumber] === value;
      },
      message: function(props) {
        const validAmounts = { 1: 10, 2: 20, 3: 50 };
        return `Valor do baú ${this.chestNumber} deve ser R$ ${validAmounts[this.chestNumber]},00`;
      }
    }
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Remover campos que não devem aparecer na resposta
      delete ret.extraAmount;
      delete ret.__v;
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      // Remover campos que não devem aparecer na resposta
      delete ret.extraAmount;
      delete ret.__v;
      return ret;
    }
  }
});

// Índice composto para garantir que cada usuário tenha apenas um baú de cada número
rewardChestSchema.index({ userId: 1, chestNumber: 1 }, { unique: true });

// Índices para otimização
rewardChestSchema.index({ userId: 1 });
rewardChestSchema.index({ opened: 1 });

// Método para obter o valor correto do baú baseado no número
rewardChestSchema.statics.getChestAmount = function(chestNumber) {
  const amounts = {
    1: 10,  // R$ 10,00
    2: 20,  // R$ 20,00
    3: 50   // R$ 50,00
  };
  return amounts[chestNumber] || 0;
};

const RewardChest = mongoose.model('RewardChest', rewardChestSchema);

export default RewardChest; 