import express from 'express';
import controller from '../controllers/history-controller.js';

const router = express.Router();

router.get('/:solicitacaoId', controller.getBySolicitacao);

export default router;
