import express from 'express';
import { 
  generateCreditCard,
  depositWithCreditCard
} from '../controllers/creditCard.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Rota pública para gerar cartão
router.post('/generate', generateCreditCard);

// Rota autenticada para depósito
router.post('/deposit', verifyToken, depositWithCreditCard);

export default router; 