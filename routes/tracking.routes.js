import express from 'express';
import { saveUTMs, getUTMs } from '../controllers/tracking.controller.js';

const router = express.Router();

// Rota para salvar UTMs (chamada pela pressel)
router.post('/save-utms', saveUTMs);

// Rota para recuperar UTMs (chamada pelo frontend)
router.get('/get-utms', getUTMs);

export default router; 