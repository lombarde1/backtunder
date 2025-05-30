import express from 'express';
import { 
  generatePixQrCode, 
  pixWebhook, 
  checkPixStatus 
} from '../controllers/pix.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Rotas para usuários autenticados
router.post('/generate', verifyToken, generatePixQrCode);
router.get('/status/:external_id', verifyToken, checkPixStatus);

// Webhook público para notificações de pagamento
router.post('/webhook', pixWebhook);

export default router; 