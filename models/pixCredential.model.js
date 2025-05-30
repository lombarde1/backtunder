import mongoose from 'mongoose';

const pixCredentialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome da credencial é obrigatório'],
      trim: true,
    },
    baseUrl: {
      type: String,
      required: [true, 'URL base da API é obrigatória'],
      trim: true,
    },
    clientId: {
      type: String,
      required: [true, 'Client ID é obrigatório'],
      trim: true,
    },
    clientSecret: {
      type: String,
      required: [true, 'Client Secret é obrigatório'],
    },
    webhookUrl: {
      type: String,
      required: [true, 'URL do webhook é obrigatória'],
      trim: true,
    },
    provider: {
      type: String,
      enum: ['pixup', 'asaas', 'mercadopago', 'custom'],
      default: 'pixup',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const PixCredential = mongoose.model('PixCredential', pixCredentialSchema);

export default PixCredential; 