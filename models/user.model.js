import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  cpf: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    type: String,
    default: 'Nacional',
    trim: true,
    // Valores aceitos: 'Nacional' (Brasil) ou 'Internacional' (outros países)
    // Valores antigos como 'Brasil' ou nomes de países são automaticamente 
    // convertidos para 'Nacional' ou 'Internacional' pelos controllers
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'BLOCKED'],
    default: 'ACTIVE'
  },
  lastLogin: {
    type: Date
  },
  hasReceivedFirstDepositBonus: {
    type: Boolean,
    default: false
  },
  rewardChests: {
    chest1: {
      opened: {
        type: Boolean,
        default: false
      },
      openedAt: {
        type: Date
      }
    },
    chest2: {
      opened: {
        type: Boolean,
        default: false
      },
      openedAt: {
        type: Date
      }
    },
    chest3: {
      opened: {
        type: Boolean,
        default: false
      },
      openedAt: {
        type: Date
      }
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User; 