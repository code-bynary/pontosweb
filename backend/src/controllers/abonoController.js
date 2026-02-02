import { getAbonoByWorkday, createAbono, updateAbonoDocument, deleteAbono } from '../services/abonoService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads', 'atestados');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        cb(null, `${req.params.id}_${timestamp}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|jpg|jpeg|png/;
        const ext = path.extname(file.originalname).toLowerCase();
        const mimeType = allowedTypes.test(file.mimetype);
        const extName = allowedTypes.test(ext);

        if (mimeType && extName) {
            return cb(null, true);
        }
        cb(new Error('Apenas arquivos PDF, JPG e PNG são permitidos'));
    }
});

/**
 * Get abono for a workday
 */
export async function getAbono(req, res) {
    try {
        const { workdayId } = req.params;
        const abono = await getAbonoByWorkday(workdayId);

        if (!abono) {
            return res.status(404).json({ error: 'Abono not found' });
        }

        res.json(abono);
    } catch (error) {
        console.error('Error fetching abono:', error);
        res.status(500).json({ error: 'Failed to fetch abono' });
    }
}

/**
 * Create a new abono
 */
export async function addAbono(req, res) {
    try {
        const { workdayId, type, reason, startTime, endTime, minutes } = req.body;

        if (!workdayId || !type || !reason || !minutes) {
            return res.status(400).json({ error: 'WorkdayId, type, reason, and minutes are required' });
        }

        const abono = await createAbono({
            workdayId,
            type,
            reason,
            startTime,
            endTime,
            minutes
        });

        res.status(201).json(abono);
    } catch (error) {
        console.error('Error creating abono:', error);

        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'An abono already exists for this workday' });
        }

        res.status(500).json({ error: 'Failed to create abono' });
    }
}

/**
 * Upload document for an abono
 */
export const uploadDocument = [
    upload.single('document'),
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            await updateAbonoDocument(id, req.file.filename);

            res.json({
                message: 'Document uploaded successfully',
                filename: req.file.filename
            });
        } catch (error) {
            console.error('Error uploading document:', error);
            res.status(500).json({ error: 'Failed to upload document' });
        }
    }
];

/**
 * Delete an abono
 */
export async function removeAbono(req, res) {
    try {
        const { id } = req.params;

        await deleteAbono(id);

        res.json({ message: 'Abono deleted successfully' });
    } catch (error) {
        console.error('Error deleting abono:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Abono not found' });
        }

        res.status(500).json({ error: 'Failed to delete abono' });
    }
}

/**
 * Download abono document
 */
export async function downloadDocument(req, res) {
    try {
        const { workdayId } = req.params;
        const abono = await getAbonoByWorkday(workdayId);

        if (!abono || !abono.document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const filePath = path.join(uploadsDir, abono.document);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ error: 'Failed to download document' });
    }
}
