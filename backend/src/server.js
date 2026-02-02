import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/upload.js';
import employeeRoutes from './routes/employee.js';
import workdayRoutes from './routes/workday.js';
import exportRoutes from './routes/export.js';
import holidayRoutes from './routes/holiday.js';
import abonoRoutes from './routes/abono.js';
import reportRoutes from './routes/report.js';
import dashboardRoutes from './routes/dashboard.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow all origins for easier remote access
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/workday', workdayRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/abonos', abonoRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
