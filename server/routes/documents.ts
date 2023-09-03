import express from 'express';
import { documentsApi } from '@api';

const router = express.Router();

// GET endpoints
router.get('/:documentId', documentsApi.getDocbyId);

// POST endpoints
router.post('/', documentsApi.createDoc);

// DELETE endpoints
router.delete('/:documentId', documentsApi.deleteRTDocument);

// PUT endpoints
router.put('/:documentId', documentsApi.updateDoc);

export default router;
