const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '..')));

const db = new sqlite3.Database(path.join(__dirname, '..', 'webtech.db'));

// --- API คลังคอร์สเรียน ---
app.get('/api/courses', (req, res) => {
    const query = `SELECT * FROM courses`;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const coursesWithLessons = rows.map(course => {
            return new Promise((resolve) => {
                db.all(`SELECT id, title FROM lessons WHERE course_id = ?`, [course.id], (err, lessons) => {
                    course.lessons = lessons || [];
                    resolve(course);
                });
            });
        });

        Promise.all(coursesWithLessons).then(results => res.json(results));
    });
});
app.post('/api/progress/toggle', (req, res) => {
    const { userId, lessonId, isCompleted } = req.body;
    
    const query = `INSERT INTO user_progress (user_id, lesson_id, is_completed) 
                   VALUES (?, ?, ?)
                   ON CONFLICT(user_id, lesson_id) 
                   DO UPDATE SET is_completed = excluded.is_completed`;

    db.run(query, [userId, lessonId, isCompleted ? 1 : 0], function(err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        
        if (isCompleted) {
            db.run(`UPDATE users SET study_hours = study_hours + 0.5 WHERE id = ?`, [userId]);
        }
        
        res.json({ success: true, message: "อัปเดตความคืบหน้าเรียบร้อย" });
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server กำลังรันอยู่ที่ http://localhost:${PORT}`);
});
