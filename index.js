// index.js

require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("./generated/prisma");  // Path is correct assuming your structure
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Experience Routes
app.post("/experience", authenticateToken, async (req, res) => {
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

app.delete("/experience/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.experience.delete({
            where: { id: id },
        });
        res.status(200).json({ message: "Experience deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete", details: error.message });
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
app.post("/project", authenticateToken, async (req, res) => {
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

app.delete("/project/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.project.delete({
            where: { id: id },
        });
        res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete", details: error.message });
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
app.post("/skill", authenticateToken, async (req, res) => {
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

app.delete("/skill/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.skill.delete({
            where: { id: id },
        });
        res.status(200).json({ message: "Skill deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete", details: error.message });
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

    try {
        const admin = await prisma.admin.findUnique({
            where: { email },
        });

        if (!admin) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Login success! 
        const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Login failed" });
    }
});

//Social Routes
app.post("/social", authenticateToken, async(req, res) => {
    const {instagram, github, linkedin, pinterest} = req.body;
    if (!instagram || !github || !linkedin || !pinterest) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const social = await prisma.social.create({
            data: {instagram, github, linkedin, pinterest}
        })
        res.status(201).json(social);
    } catch (error) {
        console.error("Error creating social:", error);
        res.status(500).json({ error: "Failed to create social", details: error.message });
    }
});

app.put("/social/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { instagram, github, linkedin, pinterest } = req.body;

    try {
        const updatedSocial = await prisma.social.update({
            where: { id: id },
            data: {
                instagram,
                github,
                linkedin,
                pinterest
            },
        });
        res.status(200).json(updatedSocial);
    } catch (error) {
        console.error("Error updating social:", error);
        res.status(500).json({ error: "Failed to update social links", details: error.message });
    }
});

app.get("/social", async(req, res) => {
    try {
        const social = await prisma.social.findFirst();
        res.status(200).json(social);
    } catch (error) {
        console.error("Error fetching social:", error);
        res.status(500).json({ error: "Failed to fetch social", details: error.message });
    }
});

//About Routes

app.post("/about", authenticateToken, async(req, res) => {
    const {skills, description, image} = req.body;
    if (!skills || !description || !image) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const about = await prisma.about.create({
            data: {skills, description, image}
        })
        res.status(201).json(about);
    } catch (error) {
        console.error("Error creating about:", error);
        res.status(500).json({ error: "Failed to create about", details: error.message });
    }
});

app.put("/about/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { skills, description, image } = req.body;

    try {
        const updatedAbout = await prisma.about.update({
            where: { id: id },
            data: {
                skills,
                description,
                image,
            },
        });
        res.status(200).json(updatedAbout);
    } catch (error) {
        console.error("Error updating about section:", error);
        res.status(500).json({ 
            error: "Failed to update about section", 
            details: error.message 
        });
    }
});

app.get("/about", async(req, res) => {
    try {
        const about = await prisma.about.findFirst();
        res.status(200).json(about);
    } catch (error) {
        console.error("Error fetching about:", error);
        res.status(500).json({ error: "Failed to fetch about", details: error.message });
    }
});

// Contact Routes
app.post("/contact", async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const contact = await prisma.contact.create({
            data: { name, email, subject, message },
        });
        res.status(201).json(contact);
    } catch (error) {
        console.error("Error creating contact message:", error);
        res.status(500).json({ error: "Failed to send message", details: error.message });
    }
});

app.get("/contact", async (req, res) => {
    try {
        const contacts = await prisma.contact.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(contacts);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages", details: error.message });
    }
});

app.delete("/contact/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.contact.delete({
            where: { id: id },
        });
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete message", details: error.message });
    }
});