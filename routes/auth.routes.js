import express from 'express';
import { register, login, getProfile } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.post('/register', register);
router.post('/login', login);

// Rotas privadas (requer autenticação)
router.get('/profile', verifyToken, getProfile);

export default router; 