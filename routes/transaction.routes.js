import express from 'express';
import { 
  getTransactions, 
  getAllTransactions, 
  getTransactionById, 
  createWithdrawal,
  updateTransactionStatus 
} from '../controllers/transaction.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rotas para usuários autenticados
router.get('/', verifyToken, getTransactions);
router.get('/:id', verifyToken, getTransactionById);
router.post('/withdraw', verifyToken, createWithdrawal);

// Rotas para administradores
router.get('/admin/all', verifyToken, isAdmin, getAllTransactions);
router.put('/:id', verifyToken, isAdmin, updateTransactionStatus);

export default router; 