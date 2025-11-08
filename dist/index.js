import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
dotenv.config();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the DevOps API",
        version: "1.0.0",
        endpoints: {
            home: "GET /",
            health: "GET /health",
            users: {
                getAll: "GET /users",
                create: "POST /users"
            }
        }
    });
});
// Health endpoint
app.get('/health', (req, res) => {
    res.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: "connected"
    });
});
app.get('/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        console.log('Retrieved users:', users);
        res.json({
            success: true,
            data: users,
            count: users.length
        });
    }
    catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch users',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Add new user endpoint
app.post('/users', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({
                success: false,
                error: 'Username is required'
            });
        }
        const newUser = await prisma.user.create({
            data: {
                username
            }
        });
        console.log('Created new user:', newUser);
        res.status(201).json({
            success: true,
            data: newUser,
            message: 'User created successfully'
        });
    }
    catch (error) {
        console.error('Error creating user:', error);
        // Handle unique constraint violation
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return res.status(409).json({
                success: false,
                error: 'Username already exists'
            });
        }
        res.status(500).json({
            success: false,
            error: 'Failed to create user',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
app.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
    console.log('Available endpoints:');
    console.log('- GET  /        (Home)');
    console.log('- GET  /health  (Health check)');
    console.log('- GET  /users   (Get all users)');
    console.log('- POST /users   (Create new user)');
});
//# sourceMappingURL=index.js.map