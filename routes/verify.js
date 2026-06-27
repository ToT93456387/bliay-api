const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/v1/verify - Roblox Client verification endpoint
router.post('/verify', async (req, res) => {
    const { key, hwid } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';

    if (!key) {
        return res.status(400).json({ 
            success: false, 
            message: 'Verification failed: License key is required.' 
        });
    }

    const clientHwid = hwid || 'Unknown';

    try {
        // 1. Fetch license key
        const license = await db.get('SELECT * FROM keys WHERE key_string = ?', [key]);
        if (!license) {
            // Log failed access
            // We search if the project ID is known. Here we don't have it since key is invalid, 
            // but we can log under a generic "invalid" action if desired, or skip project-specific log.
            return res.status(404).json({ 
                success: false, 
                message: 'Verification failed: License key not found.' 
            });
        }

        const projectId = license.project_id;

        // 2. Check if key is suspended
        if (license.status === 'suspended') {
            await db.run(
                'INSERT INTO logs (project_id, key_id, hwid, ip, action, details) VALUES (?, ?, ?, ?, ?, ?)',
                [projectId, license.id, clientHwid, ip, 'auth_failed_suspended', 'Key has been suspended by developer.']
            );
            return res.status(403).json({ 
                success: false, 
                message: 'Verification failed: This license key is suspended.' 
            });
        }

        // 3. Check expiration
        if (license.expires_at) {
            const expiryDate = new Date(license.expires_at);
            if (expiryDate < new Date()) {
                await db.run(
                    'INSERT INTO logs (project_id, key_id, hwid, ip, action, details) VALUES (?, ?, ?, ?, ?, ?)',
                    [projectId, license.id, clientHwid, ip, 'auth_failed_expired', `Key expired on ${license.expires_at}`]
                );
                return res.status(403).json({ 
                    success: false, 
                    message: 'Verification failed: This license key has expired.' 
                });
            }
        }

        // 4. Fetch the Roblox project script
        const project = await db.get('SELECT * FROM projects WHERE id = ?', [projectId]);
        if (!project) {
            return res.status(404).json({ 
                success: false, 
                message: 'Verification failed: Associated script project not found.' 
            });
        }

        // 5. Check/Bind Hardware ID (HWID)
        if (!license.hwid) {
            // First time use: Bind HWID and IP to key
            await db.run(
                'UPDATE keys SET hwid = ?, ip = ?, last_used = CURRENT_TIMESTAMP WHERE id = ?',
                [clientHwid, ip, license.id]
            );
            await db.run(
                'INSERT INTO logs (project_id, key_id, hwid, ip, action, details) VALUES (?, ?, ?, ?, ?, ?)',
                [projectId, license.id, clientHwid, ip, 'auth_success', 'First-time HWID bind successful.']
            );

            return res.json({
                success: true,
                message: 'Verification successful! Hardware ID linked.',
                script: project.raw_script
            });
        } else if (license.hwid !== clientHwid) {
            // HWID Mismatch
            await db.run(
                'INSERT INTO logs (project_id, key_id, hwid, ip, action, details) VALUES (?, ?, ?, ?, ?, ?)',
                [projectId, license.id, clientHwid, ip, 'auth_failed_hwid', `Blocked mismatch. Stored: ${license.hwid}, Sent: ${clientHwid}`]
            );
            return res.status(403).json({ 
                success: false, 
                message: 'Verification failed: HWID mismatch. Please reset HWID in dashboard.' 
            });
        }

        // 6. Success: valid key + matched HWID
        await db.run(
            'UPDATE keys SET last_used = CURRENT_TIMESTAMP WHERE id = ?',
            [license.id]
        );
        await db.run(
            'INSERT INTO logs (project_id, key_id, hwid, ip, action, details) VALUES (?, ?, ?, ?, ?, ?)',
            [projectId, license.id, clientHwid, ip, 'auth_success', 'Access granted. Successful handshake.']
        );

        res.json({
            success: true,
            message: 'Verification successful!',
            script: project.raw_script
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error during verification.' 
        });
    }
});

module.exports = router;
