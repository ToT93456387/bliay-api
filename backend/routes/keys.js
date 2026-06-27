const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { authenticateToken } = require('../authMiddleware');

// Helper to check if a user owns a project
async function checkProjectOwner(projectId, userId) {
    const project = await db.get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [projectId, userId]);
    return !!project;
}

// Generate a random key string in LA-XXXX-XXXX-XXXX format
function generateKeyString() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const segment = () => {
        let str = '';
        for (let i = 0; i < 4; i++) {
            str += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return str;
    };
    return `LA-${segment()}-${segment()}-${segment()}`;
}

// GET /api/keys - List all keys for a specific project
router.get('/', authenticateToken, async (req, res) => {
    const { project_id } = req.query;

    if (!project_id) {
        return res.status(400).json({ error: 'Project ID is required.' });
    }

    try {
        const ownsProject = await checkProjectOwner(project_id, req.user.id);
        if (!ownsProject) {
            return res.status(403).json({ error: 'Access denied. You do not own this project.' });
        }

        const keys = await db.all(
            'SELECT * FROM keys WHERE project_id = ? ORDER BY created_at DESC',
            [project_id]
        );
        res.json({ keys });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve keys.' });
    }
});

// POST /api/keys/generate - Generate license keys
router.post('/generate', authenticateToken, async (req, res) => {
    const { project_id, count, duration_days } = req.body;

    if (!project_id || !count) {
        return res.status(400).json({ error: 'Project ID and count are required.' });
    }

    const keyCount = parseInt(count, 10);
    if (isNaN(keyCount) || keyCount < 1 || keyCount > 100) {
        return res.status(400).json({ error: 'Key count must be between 1 and 100.' });
    }

    try {
        const ownsProject = await checkProjectOwner(project_id, req.user.id);
        if (!ownsProject) {
            return res.status(403).json({ error: 'Access denied. You do not own this project.' });
        }

        let expiresAt = null;
        if (duration_days && parseFloat(duration_days) > 0) {
            const ms = parseFloat(duration_days) * 24 * 60 * 60 * 1000;
            expiresAt = new Date(Date.now() + ms).toISOString();
        }

        const generatedKeys = [];
        for (let i = 0; i < keyCount; i++) {
            const keyString = generateKeyString();
            await db.run(
                'INSERT INTO keys (project_id, key_string, expires_at, status) VALUES (?, ?, ?, ?)',
                [project_id, keyString, expiresAt, 'active']
            );
            generatedKeys.push({
                key_string: keyString,
                expires_at: expiresAt,
                status: 'active'
            });
        }

        res.status(201).json({
            message: `Successfully generated ${keyCount} license keys!`,
            keys: generatedKeys
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to generate keys.' });
    }
});

// PUT /api/keys/:id - Update key details (HWID reset, Toggle status, Extend expiration)
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { reset_hwid, status, duration_days } = req.body;

    try {
        // Retrieve the key and verify the developer owns the project it belongs to
        const key = await db.get(
            `SELECT keys.*, projects.user_id FROM keys 
             JOIN projects ON keys.project_id = projects.id 
             WHERE keys.id = ?`,
            [id]
        );

        if (!key) {
            return res.status(404).json({ error: 'Key not found.' });
        }

        if (key.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        if (reset_hwid) {
            await db.run('UPDATE keys SET hwid = NULL, ip = NULL WHERE id = ?', [id]);
        }

        if (status && ['active', 'suspended'].includes(status)) {
            await db.run('UPDATE keys SET status = ? WHERE id = ?', [status, id]);
        }

        if (duration_days !== undefined) {
            let expiresAt = null;
            if (duration_days !== null && parseFloat(duration_days) > 0) {
                const ms = parseFloat(duration_days) * 24 * 60 * 60 * 1000;
                expiresAt = new Date(Date.now() + ms).toISOString();
            }
            await db.run('UPDATE keys SET expires_at = ? WHERE id = ?', [expiresAt, id]);
        }

        const updatedKey = await db.get('SELECT * FROM keys WHERE id = ?', [id]);
        res.json({ message: 'Key updated successfully!', key: updatedKey });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update key.' });
    }
});

// DELETE /api/keys/:id - Delete a license key
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const key = await db.get(
            `SELECT keys.*, projects.user_id FROM keys 
             JOIN projects ON keys.project_id = projects.id 
             WHERE keys.id = ?`,
            [id]
        );

        if (!key) {
            return res.status(404).json({ error: 'Key not found.' });
        }

        if (key.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        await db.run('DELETE FROM keys WHERE id = ?', [id]);
        res.json({ message: 'Key deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete key.' });
    }
});

module.exports = router;
