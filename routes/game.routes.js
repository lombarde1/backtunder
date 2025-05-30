import express from 'express';
import { 
  getGames, 
  getFeaturedGames,
  getGameById, 
  createGame, 
  updateGame, 
  deleteGame 
} from '../controllers/game.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rotas públicas
router.get('/', getGames);
router.get('/featured', getFeaturedGames);
router.get('/:id', getGameById);

// Rotas para administradores
router.post('/', verifyToken, isAdmin, createGame);
router.put('/:id', verifyToken, isAdmin, updateGame);
router.delete('/:id', verifyToken, isAdmin, deleteGame);

export default router; 