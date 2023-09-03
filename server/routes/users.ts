import express from 'express';
import { documentsApi, usersApi } from '@api';

const router = express.Router();

// GET endpoints
router.get('/search', usersApi.searchUser);
router.get('/:userId', usersApi.getUserbyId);
router.get('/:userId/documents', documentsApi.getRTDocsbyUserId);

export default router;
