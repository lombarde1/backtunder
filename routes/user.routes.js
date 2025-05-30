import express from 'express';
import { 
  getUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  getUserProfile,
  updateUserProfile
} from '../controllers/user.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Rotas que requerem apenas autenticação
router.get('/profile', verifyToken, getUserProfile);
router.put('/profile', verifyToken, updateUserProfile);

// Todas as outras rotas de usuário requerem autenticação e permissões de admin
router.use(verifyToken, isAdmin);

// Rotas administrativas
router.get('/', getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router; 