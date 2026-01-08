/**
 * Parse TXT file from biometric punch clock
 * Expected format:
 * EnNo    Name            IOMd    DateTime
 * 001     João Silva      0       2026-01-08 08:00:00
 */
export function parsePunchFile(fileContent) {
    const lines = fileContent.split('\n').filter(line => line.trim());
    const records = [];
    const errors = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
            // Split by multiple spaces or tabs
            const parts = line.split(/\s+/);

            if (parts.length < 4) {
                errors.push({ line: i + 1, error: 'Invalid format', content: line });
                continue;
            }

            const enNo = parts[0];
            const ioMode = parseInt(parts[parts.length - 3]);
            const dateStr = parts[parts.length - 2];
            const timeStr = parts[parts.length - 1];

            // Name is everything between enNo and ioMode
            const name = parts.slice(1, parts.length - 3).join(' ');

            // Validate
            if (!enNo || !name || isNaN(ioMode) || !dateStr || !timeStr) {
                errors.push({ line: i + 1, error: 'Missing required fields', content: line });
                continue;
            }

            // Parse datetime
            const dateTime = new Date(`${dateStr} ${timeStr}`);
            if (isNaN(dateTime.getTime())) {
                errors.push({ line: i + 1, error: 'Invalid datetime', content: line });
                continue;
            }

            records.push({
                enNo: enNo.trim(),
                name: name.trim(),
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
