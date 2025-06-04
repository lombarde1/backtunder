import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAW', 'BET', 'WIN', 'BONUS', 'WITHDRAWAL'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED', 'PROCESSING'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['PIX', 'BANK_TRANSFER', 'CRYPTO', 'CREDIT', 'SYSTEM', 'CREDIT_CARD', 'WITHDRAWAL'],
      required: function() {
        return this.type === 'DEPOSIT' || this.type === 'WITHDRAW';
      },
    },
    externalReference: {
      type: String,
      sparse: true,
      unique: true,
    },
    gameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
    },
    betDetails: {
      type: Object,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      validate: {
        validator: function(metadata) {
          // Validação específica para depósitos
          if (this.type === 'DEPOSIT') {
            if (this.paymentMethod === 'CREDIT_CARD') {
              return metadata.cardNumber && metadata.bonus !== undefined;
            }
           
          }
          return true;
        },
        message: 'Metadados inválidos para o tipo de transação'
      }
    },
  },
  {
    timestamps: true,
  }
);

// Middleware para atualizar saldo do usuário após salvar transação completa
transactionSchema.post('save', async function () {
  if (this.status === 'COMPLETED') {
    const User = mongoose.model('User');
    const user = await User.findById(this.userId);
    
    if (!user) {
      console.error(`Usuário não encontrado: ${this.userId}`);
      return;
    }

    if (this.type === 'DEPOSIT' || this.type === 'WIN') {
      user.balance += this.amount 
      await user.save();
      console.log(`Saldo atualizado para usuário ${user._id}: ${user.balance}`);
    } else if (this.type === 'BONUS') {
      // Atualizar saldo para bônus dos baús de recompensa
      user.balance += this.amount;
      await user.save();
      console.log(`Bônus aplicado para usuário ${user._id}: ${this.amount} - Novo saldo: ${user.balance}`);
    } else if (this.type === 'BET' && user.balance >= this.amount) {
      user.balance -= this.amount;
      await user.save();
      console.log(`Saldo atualizado para usuário ${user._id}: ${user.balance}`);
    } 
    // Não é necessário deduzir para WITHDRAW, pois já é feito na criação
    // Mas podemos registrar que o saque foi concluído
    else if (this.type === 'WITHDRAW') {
      console.log(`Saque concluído para usuário ${user._id}: ${this.amount}`);
    }
  }
});

// Índices para otimização de consultas
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ externalReference: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction; 