const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// API Endpoints

// Register
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ id: this.lastID, username });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            const match = await bcrypt.compare(password, row.password);
            if (match) {
                res.json({ id: row.id, username: row.username });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

// Upload Video
app.post('/api/upload', (req, res) => {
    upload.single('video')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json({ error: err.message });
        } else if (err) {
            return res.status(500).json({ error: err.message });
        }

        const { title, description, uploaderId, tags } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const filename = req.file.filename;
        const tagsStr = tags || '';

        db.run(`INSERT INTO videos (title, description, filename, uploaderId, tags) VALUES (?, ?, ?, ?, ?)`,
            [title, description, filename, uploaderId, tagsStr],
            function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ id: this.lastID, message: 'Video uploaded successfully' });
            }
        );
    });
});

// List Videos
app.get('/api/videos', (req, res) => {
    db.all(`SELECT videos.*, users.username as uploaderName FROM videos LEFT JOIN users ON videos.uploaderId = users.id ORDER BY videos.id DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get Video Details
app.get('/api/videos/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT videos.*, users.username as uploaderName FROM videos LEFT JOIN users ON videos.uploaderId = users.id WHERE videos.id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ error: 'Video not found' });
        }
    });
});

// Record View
app.post('/api/videos/:id/view', (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
        // Just ignore if no user logged in, or maybe track anonymous views later
        return res.status(200).send();
    }

    // Input validation: Ensure id is a number (or integer)
    if (!/^\d+$/.test(id)) {
        return res.status(400).json({ error: 'Invalid video ID' });
    }

    db.run(`INSERT INTO views (userId, videoId) VALUES (?, ?)`, [userId, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'View recorded' });
    });
});

// Recommendations Endpoint
app.get('/api/recommendations', (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        // If no user, just return random or latest videos
        db.all(`SELECT videos.*, users.username as uploaderName FROM videos LEFT JOIN users ON videos.uploaderId = users.id ORDER BY RANDOM() LIMIT 5`, [], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        });
        return;
    }

    // Recommendation Logic:
    // 1. Get tags of videos watched by user.
    // 2. Find other videos with matching tags that user hasn't watched recently (or at all).
    // For simplicity: Find videos with same tags as most recently watched videos.

    const query = `
        SELECT DISTINCT v.*, u.username as uploaderName
        FROM videos v
        JOIN users u ON v.uploaderId = u.id
        WHERE v.id NOT IN (SELECT videoId FROM views WHERE userId = ?)
        AND (
            v.tags LIKE (
                SELECT '%' || tags || '%' FROM videos
                WHERE id IN (SELECT videoId FROM views WHERE userId = ? ORDER BY timestamp DESC LIMIT 5)
                ORDER BY RANDOM() LIMIT 1
            )
            OR
            v.tags LIKE (
                SELECT '%' || tags || '%' FROM videos
                WHERE id IN (SELECT videoId FROM views WHERE userId = ? ORDER BY timestamp DESC LIMIT 5)
                ORDER BY RANDOM() LIMIT 1
            )
        )
        ORDER BY RANDOM()
        LIMIT 5
    `;

    // Fallback if the query is too complex or returns nothing: Just return random videos excluding watched ones.

    // Let's implement a simpler "Watched X, recommend others with similar tags"
    // Fetch user's view history first
    db.all(`SELECT videoId FROM views WHERE userId = ? ORDER BY timestamp DESC LIMIT 10`, [userId], (err, viewRows) => {
        if (err) return res.status(500).json({ error: err.message });

        const watchedVideoIds = viewRows.map(r => r.videoId);

        // If no history, return random
        if (watchedVideoIds.length === 0) {
             db.all(`SELECT videos.*, users.username as uploaderName FROM videos LEFT JOIN users ON videos.uploaderId = users.id ORDER BY RANDOM() LIMIT 5`, [], (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json(rows);
            });
            return;
        }

        // Get tags of last watched video
        db.get(`SELECT tags FROM videos WHERE id = ?`, [watchedVideoIds[0]], (err, video) => {
             const placeholders = watchedVideoIds.map(() => '?').join(',');

             if (err || !video) {
                 // Fallback
                 db.all(`SELECT videos.*, users.username as uploaderName FROM videos LEFT JOIN users ON videos.uploaderId = users.id WHERE videos.id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 5`, watchedVideoIds, (err, rows) => {
                     if(err) return res.status(500).json({error: err.message});
                     res.json(rows);
                 });
                 return;
             }

             const tags = video.tags.split(',').map(t => t.trim());
             // Simple search for any of these tags
             const tagPlaceholders = tags.map(() => `tags LIKE ?`).join(' OR ');
             const params = [...tags.map(t => `%${t}%`), ...watchedVideoIds];

             // exclude watched
             const excludeClause = `AND id NOT IN (${placeholders})`;

             const sql = `SELECT videos.*, users.username as uploaderName FROM videos LEFT JOIN users ON videos.uploaderId = users.id WHERE (${tagPlaceholders}) ${excludeClause} LIMIT 5`;

             db.all(sql, params, (err, recRows) => {
                 if (err) {
                      // Fallback
                     db.all(`SELECT videos.*, users.username as uploaderName FROM videos LEFT JOIN users ON videos.uploaderId = users.id WHERE videos.id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT 5`, watchedVideoIds, (err, rows) => {
                         if(err) return res.status(500).json({error: err.message});
                         res.json(rows);
                     });
                     return;
                 }

                 if (recRows.length < 5) {
                     // Fill with random videos if recommendations are not enough
                     const randomParams = [...watchedVideoIds, 5 - recRows.length];
                      db.all(`SELECT videos.*, users.username as uploaderName FROM videos LEFT JOIN users ON videos.uploaderId = users.id WHERE videos.id NOT IN (${placeholders}) ORDER BY RANDOM() LIMIT ?`, randomParams, (err, randomRows) => {
                         if(err) return res.status(500).json({error: err.message});
                         res.json([...recRows, ...randomRows]);
                     });
                 } else {
                     res.json(recRows);
                 }
             });
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
