import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  createBet,
  getBetById,
  getUserBets,
  cancelBet
} from '../controllers/bet.controller.js';

const router = express.Router();

// Criar nova aposta
router.post('/', verifyToken, createBet);

// Buscar aposta por ID
router.get('/:id', verifyToken, getBetById);

// Buscar apostas do usuário
router.get('/user/:userId', verifyToken, getUserBets);

// Cancelar aposta
router.post('/:id/cancel', verifyToken, cancelBet);

export default router; 