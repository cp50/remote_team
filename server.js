require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const { ExpressPeerServer } = require('peer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
    session({
        secret: 'secretkey',
        resave: false,
        saveUninitialized: false,
    })
);
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose
    .connect('mongodb+srv://chris:123@cluster0.l8fqa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.log('❌ Failed to connect to MongoDB:', err));

// Google Generative AI for Summarization
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

const taskRoutes = require('./routes/tasks');
app.use('/tasks', taskRoutes);

const fileRoutes = require('./routes/files');
app.use('/files', fileRoutes);

const calendarRoutes = require('./routes/calendar');
app.use('/calendar', calendarRoutes);

const chatRoutes = require('./routes/chat');
app.use('/chat', chatRoutes);

const videoRoutes = require('./routes/video');
app.use('/video', videoRoutes);

const aiRoutes = require('./routes/ai');
app.use('/api', aiRoutes);

app.get('/aichat', (req, res) => {
    res.render('aichat');
});

// Home route
app.get('/', (req, res) => {
    res.render('index');
});

// PeerJS for video calling
const peerServer = ExpressPeerServer(server, { debug: true });
app.use('/peerjs', peerServer);

// Store active users
const users = {}; // Store usernames with their socket IDs

// Socket.io for Chat and Video Call Integration
io.on("connection", (socket) => {
    console.log("🔗 A user connected:", socket.id);

    // Register user
    socket.on("register-user", (username) => {
        users[username] = socket.id;
        console.log(`✅ User registered: ${username} with socket ID: ${socket.id}`);
    });

    // Handle group chat messages
    socket.on("chat message", (data) => {
        io.emit("chat message", data);
    });

    // Handle private chat messages
    socket.on("private-message", ({ recipientId, message, sender }) => {
        const recipientSocketId = users[recipientId];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit("private-message", { sender, message });
        }
    });

    // Room-based Video Call Handling
    socket.on('create-room', roomId => {
        socket.join(roomId);
        console.log(`Room created: ${roomId}`);
    });

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
        console.log(`User ${userId} joined room: ${roomId}`);
    });

    // Handle user disconnect
    socket.on("disconnect", () => {
        Object.keys(users).forEach((username) => {
            if (users[username] === socket.id) {
                delete users[username];
                console.log(`❌ User disconnected: ${username}`);
            }
        });
    });
});

// API Route for Meeting Summarization
const axios = require("axios");

app.post("/summarize", async (req, res) => {
    try {
        const { transcript } = req.body;

        console.log("Received Transcript:", transcript);

        if (!transcript || transcript.trim() === "") {
            return res.json({ summary: "No conversation data available for summarization." });
        }

        // ✅ Use direct API URL with Gemini 1.5 Flash
        const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GOOGLE_API_KEY}`;

        const prompt = `Summarize this conversation in a clear and concise way: ${transcript}`;

        // ✅ Use Axios to make the API request
        const response = await axios.post(apiUrl, {
            contents: [{ role: "user", parts: [{ text: prompt }] }]
        });

        // ✅ Extract the summary correctly
        const summary = response.data.candidates[0].content.parts[0].text;

        res.json({ summary: summary });

    } catch (error) {
        console.error("Summarization error:", error);
        res.json({ summary: "Error generating summary." });
    }
});



const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Server started on http://localhost:${PORT}`));
