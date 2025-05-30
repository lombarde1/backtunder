import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  depositWithCreditCard,
  getDepositHistory
} from '../controllers/deposit.controller.js';

const router = express.Router();

// Rota para depósito com cartão de crédito
router.post('/credit-card', verifyToken, depositWithCreditCard);

// Rota para histórico de depósitos
router.get('/history', verifyToken, getDepositHistory);

export default router; 