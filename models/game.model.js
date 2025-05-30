import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['SPORTS', 'CASINO', 'LOTTERY', 'OTHER']
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
    default: 'ACTIVE'
  },
  odds: {
    type: Number,
    required: true,
    min: 1
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  result: {
    type: String,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Índices para melhorar performance
gameSchema.index({ category: 1, status: 1 });
gameSchema.index({ startTime: 1, endTime: 1 });
gameSchema.index({ status: 1 });

const Game = mongoose.model('Game', gameSchema);

export default Game; 