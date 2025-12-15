require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("./generated/prisma");
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
