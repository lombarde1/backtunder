import mongoose from 'mongoose';

const utmSchema = new mongoose.Schema(
  {
    ip: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    utm_source: {
      type: String,
      default: null
    },
    utm_medium: {
      type: String,
      default: null
    },
    utm_campaign: {
      type: String,
      default: null
    },
    utm_content: {
      type: String,
      default: null
    },
    utm_term: {
      type: String,
      default: null
    },
    src: {
      type: String,
      default: null
    },
    sck: {
      type: String,
      default: null
    },
    user_agent: {
      type: String,
      default: null
    },
    page_url: {
      type: String,
      default: null
    },
    referrer: {
      type: String,
      default: null
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// TTL Index - Remove automaticamente após 30 dias
utmSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const UTM = mongoose.model('UTM', utmSchema);

export default UTM; 