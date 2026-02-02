import prisma from '../utils/prisma.js';
import path from 'path';
import fs from 'fs';

/**
 * Get abono for a specific workday
 */
export async function getAbonoByWorkday(workdayId) {
    return await prisma.abono.findUnique({
        where: {
            workdayId: parseInt(workdayId)
        }
    });
}

/**
 * Create a new abono
 */
export async function createAbono(data) {
    const { workdayId, type, reason, startTime, endTime, minutes, document } = data;

    return await prisma.abono.create({
        data: {
            workdayId: parseInt(workdayId),
            type,
            reason,
            startTime,
            endTime,
            minutes: parseInt(minutes),
            document
        }
    });
}

/**
 * Update abono document
 */
export async function updateAbonoDocument(id, documentName) {
    return await prisma.abono.update({
        where: {
            id: parseInt(id)
        },
        data: {
            document: documentName
        }
    });
}

/**
 * Delete an abono
 */
export async function deleteAbono(id) {
    const abono = await prisma.abono.findUnique({
        where: { id: parseInt(id) }
    });

    // Delete associated document if exists
    if (abono?.document) {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'atestados');
        const filePath = path.join(uploadsDir, abono.document);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    return await prisma.abono.delete({
        where: {
            id: parseInt(id)
        }
    });
}
