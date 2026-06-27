const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const keyRoutes = require('./routes/keys');
const logRoutes = require('./routes/logs');
const verifyRoutes = require('./routes/verify');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend communication
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// API route registrations
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/keys', keyRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/v1', verifyRoutes);

// Serve static frontend assets in production mode
const frontendBuildPath = path.join(__dirname, 'dist');
app.use(express.static(frontendBuildPath));

// Fallback index.html mapping for React Router routes.
// We use a middleware to capture all non-API routes and serve the frontend client.
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next(); // Pass API routes to their handlers
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
        if (err) {
            res.status(200).send(`
                <body style="background: #0f172a; color: #f8fafc; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
                    <div style="text-align: center; border: 1px solid #1e293b; padding: 2.5rem; border-radius: 12px; background: #1e293b50; backdrop-filter: blur(10px);">
                        <h1 style="color: #06b6d4; margin-top: 0;">why.op Web API</h1>
                        <p>Backend is running successfully on port ${PORT}!</p>
                        <p style="color: #64748b; font-size: 0.875rem;">(Build the frontend project using 'npm run build' to launch the developer dashboard)</p>
                    </div>
                </body>
            `);
        }
    });
});

app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`   SERVER RUNNING ON PORT : ${PORT}      `);
    console.log(`=========================================`);
});
