const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../authMiddleware');

// GET /api/logs?project_id=X - Get audit/verification logs
router.get('/', authenticateToken, async (req, res) => {
    const { project_id } = req.query;

    if (!project_id) {
        return res.status(400).json({ error: 'Project ID is required.' });
    }

    try {
        // Validate project ownership
        const project = await db.get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [project_id, req.user.id]);
        if (!project) {
            return res.status(403).json({ error: 'Access denied. You do not own this project.' });
        }

        const logs = await db.all(
            `SELECT logs.*, keys.key_string FROM logs 
             LEFT JOIN keys ON logs.key_id = keys.id 
             WHERE logs.project_id = ? 
             ORDER BY logs.created_at DESC 
             LIMIT 100`,
            [project_id]
        );
        res.json({ logs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve logs.' });
    }
});

module.exports = router;
