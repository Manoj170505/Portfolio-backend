// index.js

require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("./generated/prisma");  // Path is correct assuming your structure
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Experience Routes
app.post("/experience", async (req, res) => {
    const { title, company, startDate, endDate, description } = req.body;
    // Basic validation
    if (!title || !company || !startDate || !endDate || !description) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const experience = await prisma.experience.create({
            data: { title, company, startDate, endDate, description },  // Matches schema fields
        });
        res.status(201).json(experience);
    } catch (error) {
        console.error("Error creating experience:", error);
        res.status(500).json({ error: "Failed to create experience", details: error.message });
    }
});

app.get("/experience", async (req, res) => {
    try {
        const experiences = await prisma.experience.findMany();
        res.status(200).json(experiences);
    } catch (error) {
        console.error("Error fetching experiences:", error);
        res.status(500).json({ error: "Failed to fetch experiences", details: error.message });
    }
});

// Project Routes
app.post("/project", async (req, res) => {
    const { name, description, image, link, github } = req.body;
    // Basic validation
    if (!name || !description || !image || !link || !github) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const project = await prisma.project.create({  // Updated to match singular model
            data: { name, description, image, link, github },
        });
        res.status(201).json(project);
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Failed to create project", details: error.message });
    }
});

app.get("/project", async (req, res) => {
    try {
        const projects = await prisma.project.findMany();  // Updated to match singular model
        res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        res.status(500).json({ error: "Failed to fetch projects", details: error.message });
    }
});

// Skill Routes
app.post("/skill", async (req, res) => {
    const { name, category, icon, color } = req.body;
    // Basic validation
    if (!name || !category || !icon || !color) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const skill = await prisma.skill.create({  // Updated to match singular model
            data: { name, category, icon, color },
        });
        res.status(201).json(skill);
    } catch (error) {
        console.error("Error creating skill:", error);
        res.status(500).json({ error: "Failed to create skill", details: error.message });
    }
});

app.get("/skill", async (req, res) => {
    try {
        const skills = await prisma.skill.findMany();  // Updated to match singular model
        res.status(200).json(skills);
    } catch (error) {
        console.error("Error fetching skills:", error);
        res.status(500).json({ error: "Failed to fetch skills", details: error.message });
    }
});

// Gracefully disconnect Prisma on app close
process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Admin Login Route
app.post("/admin/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    console.log(`Admin login attempt:`, req.body);
    try {
        const admin = await prisma.admin.findUnique({
            where: { email },
        });
       if (!admin || admin.password !== password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        res.status(200).json({ message: "Login successful" });
    } catch (error) {
        console.error("Error during admin login:", error);
        res.status(500).json({ error: "Login failed", details: error.message });
    }
});

app.post("/admin/register", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    try {
        const existingAdmin = await prisma.admin.findUnique({
            where: { email },
        }); 
        if (existingAdmin) {
            return res.status(409).json({ error: "Admin with this email already exists" });
        }
        const newAdmin = await prisma.admin.create({
            data: { email, password },
        });
        res.status(201).json({ message: "Admin registered successfully", adminId: newAdmin.id });
    } catch (error) {
        console.error("Error during admin registration:", error);
        res.status(500).json({ error: "Registration failed", details: error.message });
    }
});
