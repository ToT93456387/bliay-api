const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../authMiddleware');

// POST /register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        // Check if user exists
        const existingUser = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (existingUser) {
            return res.status(400).json({ error: 'Username is already taken.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Generate api key
        const apiKey = 'la_' + crypto.randomBytes(24).toString('hex');

        // Insert user
        await db.run(
            'INSERT INTO users (username, password_hash, api_key) VALUES (?, ?, ?)',
            [username, passwordHash, apiKey]
        );

        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error occurred during registration.' });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    try {
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        if (!user) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid username or password.' });
        }

        // Create JWT
        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                api_key: user.api_key
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error occurred during login.' });
    }
});

// GET /me
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.get('SELECT id, username, api_key, created_at FROM users WHERE id = ?', [req.user.id]);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error.' });
    }
});

module.exports = router;
