/**
 * Parse TXT file from biometric punch clock
 * Expected format (tab-delimited):
 * No	Mchn	EnNo		Name		Mode	IOMd	DateTime
 * 000001	1	000000052	Henrique      	1	0	2025/12/01  07:41:00
 */
export function parsePunchFile(fileContent) {
    const lines = fileContent.split('\n').filter(line => line.trim());
    const records = [];
    const errors = [];

    // Start from line 0 and detect data lines
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Skip header lines or separator lines silently
        if (line.toLowerCase().startsWith('no\t') || line.startsWith('---') || line.toLowerCase().includes('total')) {
            continue;
        }

        try {
            // Split by tabs
            const parts = line.split('\t').map(p => p.trim());

            // Expected format: No, Mchn, EnNo, Name, Mode, IOMd, DateTime
            // Minimal check: we need at least EnNo, Name and Date (usually 7 parts)
            if (parts.length < 7) {
                // Only log as error if it's not a known noise line
                if (parts.length > 2) {
                    errors.push({ line: i + 1, error: 'Invalid format - expected 7 fields', content: line });
                }
                continue;
            }

            const no = parts[0];
            const mchn = parts[1];
            const enNo = parts[2];
            const name = parts[3];
            const mode = parseInt(parts[4]);
            const ioMode = parseInt(parts[5]);
            const dateTimeStr = parts[6];

            // Validate required fields
            if (!enNo || !name || isNaN(ioMode) || !dateTimeStr) {
                // If it looks like a header but failed the length check, skip silently
                if (enNo === 'EnNo') continue;

                errors.push({ line: i + 1, error: 'Missing required fields', content: line });
                continue;
            }

            // Parse datetime - format: 2025/12/01  07:41:00
            // Split date and time manually to avoid timezone shifts
            const dtParts = dateTimeStr.trim().split(/\s+/);
            if (dtParts.length < 2) {
                errors.push({ line: i + 1, error: `Invalid datetime format: ${dateTimeStr}`, content: line });
                continue;
            }

            const [datePart, timePart] = dtParts;
            const [y, mo, d] = datePart.split(/[\/-]/).map(Number);
            const [h, mi, s] = timePart.split(':').map(Number);

            const dateTime = new Date(y, mo - 1, d, h, mi, s || 0);

            if (isNaN(dateTime.getTime())) {
                errors.push({ line: i + 1, error: `Invalid datetime: ${dateTimeStr}`, content: line });
                continue;
            }

            records.push({
                no,
                mchn,
                enNo: enNo.trim(),
                name: name.trim(),
                mode: isNaN(mode) ? null : mode,
                ioMode,
                dateTime
            });
        } catch (error) {
            errors.push({ line: i + 1, error: error.message, content: line });
        }
    }

    return { records, errors };
}

/**
 * Calculate total minutes worked from time strings
 */
export function calculateTotalMinutes(entrada1, saida1, entrada2, saida2) {
    let total = 0;

    if (entrada1 && saida1) {
        const [h1, m1] = entrada1.split(':').map(Number);
        const [h2, m2] = saida1.split(':').map(Number);
        total += (h2 * 60 + m2) - (h1 * 60 + m1);
    }

    if (entrada2 && saida2) {
        const [h1, m1] = entrada2.split(':').map(Number);
        const [h2, m2] = saida2.split(':').map(Number);
        total += (h2 * 60 + m2) - (h1 * 60 + m1);
    }

    return total;
}

/**
 * Format time from Date object to HH:MM string
 */
export function formatTime(date) {
    if (!date) return null;
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Convert HH:MM string to Date object (today's date with specified time)
 */
export function timeStringToDate(timeStr) {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}
