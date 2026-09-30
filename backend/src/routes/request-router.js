import express from 'express';
import controller from '../controllers/request-controller.js';
import requirePerfil from '../services/mid-role.js';

const router = express.Router();

router.get('/dashboard', controller.dashboard);
router.get('/', controller.getAll);
router.get('/:id', controller.getOne);
router.post('/', controller.create);
router.put('/:id', controller.editOne);
router.delete('/:id', controller.deleteOne);
router.patch('/:id/status', requirePerfil('ATENDENTE'), controller.changeStatus);

export default router;
