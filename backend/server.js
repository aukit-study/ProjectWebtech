require('dotenv').config();
const express = require('express');
const path = require('path');
const { initDatabase } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

initDatabase()
    .then((databaseInstance) => {
        app.locals.db = databaseInstance;

        const authRoutes = require('./src/routes/authRoutes');
        const courseRoutes = require('./src/routes/courseRoutes');
        const adminRoutes = require('./src/routes/adminRoutes');
        const { handleError } = require('./src/middleware/errorMiddleware');
        
        app.use('/api/auth', authRoutes);
        app.use('/api/courses', courseRoutes);
        app.use('/api/admin', adminRoutes);
        
        // 🛡️ Global Error Handler (ต้องอยู่หลัง API routes เสมอ)
        app.use(handleError);
        
        app.listen(PORT, () => {
            console.log(`=======================================================`);
            console.log(`🚀 TurnPro Live Server is running!`);
            console.log(`💻 ลองเข้าใช้งานหน้าเว็บได้ที่: http://localhost:${PORT}`);
            console.log(`💾 SQLite Database Structure is running!`);
            console.log(`=======================================================`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to initialize database:', err);
        process.exit(1);
    });