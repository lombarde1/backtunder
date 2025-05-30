import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  requestWithdrawal,
  checkWithdrawalStatus,
  getWithdrawalHistory
} from '../controllers/withdrawal.controller.js';

const router = express.Router();

// Rota para solicitar saque
router.post('/request', verifyToken, requestWithdrawal);

// Rota para verificar status do saque
router.get('/status/:transaction_id', verifyToken, checkWithdrawalStatus);

// Rota para listar histórico de saques
router.get('/history', verifyToken, getWithdrawalHistory);

export default router; 