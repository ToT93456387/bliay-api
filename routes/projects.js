const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../authMiddleware');

// GET /api/projects - List all projects of user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const projects = await db.all(
            'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json({ projects });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to retrieve projects.' });
    }
});

// POST /api/projects - Create new project
router.post('/', authenticateToken, async (req, res) => {
    const { name, description, raw_script } = req.body;

    if (!name || !raw_script) {
        return res.status(400).json({ error: 'Name and raw script payload are required.' });
    }

    try {
        const result = await db.run(
            'INSERT INTO projects (user_id, name, description, raw_script) VALUES (?, ?, ?, ?)',
            [req.user.id, name, description || '', raw_script]
        );
        const newProject = await db.get('SELECT * FROM projects WHERE id = ?', [result.id]);
        res.status(201).json({ message: 'Project created successfully!', project: newProject });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create project.' });
    }
});

// PUT /api/projects/:id - Update existing project
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, description, raw_script } = req.body;

    try {
        const project = await db.get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        const updatedName = name !== undefined ? name : project.name;
        const updatedDescription = description !== undefined ? description : project.description;
        const updatedScript = raw_script !== undefined ? raw_script : project.raw_script;

        await db.run(
            'UPDATE projects SET name = ?, description = ?, raw_script = ? WHERE id = ?',
            [updatedName, updatedDescription, updatedScript, id]
        );

        const updatedProject = await db.get('SELECT * FROM projects WHERE id = ?', [id]);
        res.json({ message: 'Project updated successfully!', project: updatedProject });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update project.' });
    }
});

// DELETE /api/projects/:id - Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const project = await db.get('SELECT * FROM projects WHERE id = ? AND user_id = ?', [id, req.user.id]);
        if (!project) {
            return res.status(404).json({ error: 'Project not found.' });
        }

        await db.run('DELETE FROM projects WHERE id = ?', [id]);
        res.json({ message: 'Project deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete project.' });
    }
});

module.exports = router;
