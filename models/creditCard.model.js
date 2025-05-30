import mongoose from 'mongoose';

const creditCardSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  expirationDate: {
    type: String,
    required: true
  },
  cvv: {
    type: String,
    required: true
  },
  holderName: {
    type: String,
    required: true
  },
  cpf: {
    type: String,
    required: true,
    unique: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CreditCard = mongoose.model('CreditCard', creditCardSchema);

export default CreditCard; 