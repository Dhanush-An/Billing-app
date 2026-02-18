const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const saleRoutes = require('./routes/saleRoutes');
const customerRoutes = require('./routes/customerRoutes');

const app = express();

// Middleware
const frontendUrl = (process.env.FRONTEND_URL || '').trim();
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? (frontendUrl || true) : true,
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/entities', customerRoutes);

// Health Check / Root Handler
app.get('/', (req, res) => {
    res.send('Billing Software Backend is running successfully!');
});

// Serve frontend in development if needed
if (process.env.NODE_ENV !== 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));

    app.use((req, res) => {
        if (req.path.startsWith('/api')) {
            return res.status(404).json({ message: `API Route not found: ${req.method} ${req.path}` });
        }
        const indexPath = path.join(__dirname, '../../frontend/dist/index.html');
        res.sendFile(indexPath, (err) => {
            if (err) {
                res.status(404).json({ message: "Frontend build not found." });
            }
        });
    });
} else {
    app.use("/api", (req, res) => {
        res.status(404).json({ message: `API Route not found: ${req.method} ${req.originalUrl}` });
    });
}

// Error handling
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
