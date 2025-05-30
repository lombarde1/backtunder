import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  prediction: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'WON', 'LOST', 'CANCELLED'],
    default: 'PENDING'
  },
  result: {
    type: String,
    enum: ['WIN', 'LOSS', null],
    default: null
  },
  potentialWinnings: {
    type: Number,
    default: 0
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Índices para melhorar performance
betSchema.index({ userId: 1, createdAt: -1 });
betSchema.index({ gameId: 1, status: 1 });
betSchema.index({ status: 1 });

const Bet = mongoose.model('Bet', betSchema);

export default Bet; 