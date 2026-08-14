import express from 'express';
import { protect } from '../../middleware/auth.js';
import { authorize } from '../../middleware/authorize.js';
import {
    issueCertificate,
    getMyCertificates,
    verifyCertificateHash
} from './certificates.controller.js';

const router = express.Router();

// GET /api/certificates/:id -> Public validation route (no auth required!)
router.get('/:id', verifyCertificateHash);

// GET /api/certificates/my -> Fetch logged-in volunteer's earned certificates
router.get('/my', protect, authorize('volunteer'), getMyCertificates);

// POST /api/certificates/issue -> Generate cryptographic certificate (Admin only)
router.post('/issue', protect, authorize('admin'), issueCertificate);

export default router;
