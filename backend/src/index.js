"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('Starting server...');
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config();
// Import routes using dynamic imports or type them as any for now since they are .js files
// Setting them to 'any' to avoid "missing module" errors while they remain .js
const authRoutes = require('../dist/routes/auth');
const employeeRoutes = require('../dist/routes/employees');
const attendanceRoutes = require('../dist/routes/attendance');
const leaveRoutes = require('../dist/routes/leaves');
const payrollRoutes = require('../dist/routes/payroll');
const announcementRoutes = require('../dist/routes/announcements');
const reportRoutes = require('../dist/routes/reports');
const app = (0, express_1.default)();
// Middleware
// Middleware
const frontendUrl = (process.env.FRONTEND_URL || '').trim();
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production' ? (frontendUrl || true) : true,
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/reports', reportRoutes);
// Health Check / Root Handler for Render
app.get('/', (req, res) => {
    res.send('HRMS Backend is running successfully!');
});
// Only serve static files and SPA catch-all in development
// Vercel handles this via vercel.json rewrites
if (process.env.NODE_ENV !== 'production') {
    app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend/dist')));
    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) {
            console.log(`[Route Error] API 404: ${req.method} ${req.path}`);
            return res.status(404).json({ message: `API Route not found: ${req.method} ${req.path}` });
        }
        const indexPath = path_1.default.join(__dirname, '../../frontend/dist/index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                res.status(404).json({ message: "Frontend build not found. Please run 'npm run build' or use dev server." });
            }
        });
    });
}
else {
    // In production (Vercel/Render), just have a simple API 404
    app.use("/api", (req, res) => {
        console.log(`[Route Error] API 404: ${req.method} ${req.originalUrl}`);
        res.status(404).json({ message: `API Route not found: ${req.method} ${req.originalUrl}` });
    });
}
// Error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
});
const PORT = process.env.PORT || 5000;
// Only start the server if we're not running in a serverless environment
// Only start the server if we're not running in a serverless environment
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('VERCEL:', process.env.VERCEL);
console.log('RENDER:', process.env.RENDER);
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL || process.env.RENDER) {
    console.log('Starting app.listen on port:', PORT);
    app.listen(Number(PORT), () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}
else {
    console.log('Skipping app.listen (serverless environment)');
}
// Export for Vercel
module.exports = app;
