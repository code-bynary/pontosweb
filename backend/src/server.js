import express from 'express';
import cors from 'cors';
import uploadRoutes from './routes/upload.js';
import employeeRoutes from './routes/employee.js';
import workdayRoutes from './routes/workday.js';
import exportRoutes from './routes/export.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/workday', workdayRoutes);
app.use('/api/export', exportRoutes);

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
