import express from 'express';
import { 
  getPixCredentials, 
  getPixCredentialById, 
  createPixCredential, 
  updatePixCredential, 
  deletePixCredential 
} from '../controllers/pixCredential.controller.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas de credenciais PIX requerem autenticação e permissões de admin
router.use(verifyToken, isAdmin);

// Rotas
router.get('/', getPixCredentials);
router.get('/:id', getPixCredentialById);
router.post('/', createPixCredential);
router.put('/:id', updatePixCredential);
router.delete('/:id', deletePixCredential);

export default router; 