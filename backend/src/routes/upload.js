import express from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/uploadController.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/plain' || file.originalname.endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Only .txt files are allowed'));
        }
    }
});

// POST /api/upload
router.post('/', upload.single('file'), uploadFile);

export default router;
