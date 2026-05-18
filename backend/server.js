const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/match', require('./routes/matchRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/sessions', require('./routes/sessionRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🚀 Study Buddy Finder API is running!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ==========================
// Socket.io Real-time Chat
// ==========================
const Message = require('./models/Message');
const User = require('./models/User');

const onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User comes online
  socket.on('user:online', async (userId) => {
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true });
    io.emit('users:online', Array.from(onlineUsers.keys()));
    console.log(`👤 User ${userId} is online`);
  });

  // Join a chat room
  socket.on('chat:join', ({ senderId, receiverId }) => {
    const room = [senderId, receiverId].sort().join('_');
    socket.join(room);
    console.log(`💬 Joined room: ${room}`);
  });

  // Send message
  socket.on('chat:message', async ({ senderId, receiverId, message }) => {
    try {
      const room = [senderId, receiverId].sort().join('_');
      const newMessage = await Message.create({ senderId, receiverId, message });
      const populated = await newMessage.populate('senderId', 'name avatar');

      // Emit to both users in the room
      io.to(room).emit('chat:receive', populated);

      // Notify receiver if not in room
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('chat:notification', {
          senderId,
          message,
          senderName: populated.senderId.name,
        });
      }
    } catch (error) {
      console.error('Socket message error:', error.message);
      socket.emit('chat:error', { message: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('chat:typing', ({ senderId, receiverId }) => {
    const room = [senderId, receiverId].sort().join('_');
    socket.to(room).emit('chat:typing', { userId: senderId });
  });

  socket.on('chat:stopTyping', ({ senderId, receiverId }) => {
    const room = [senderId, receiverId].sort().join('_');
    socket.to(room).emit('chat:stopTyping', { userId: senderId });
  });

  // Disconnect
  socket.on('disconnect', async () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        await User.findByIdAndUpdate(userId, { isOnline: false });
        io.emit('users:online', Array.from(onlineUsers.keys()));
        console.log(`❌ User ${userId} went offline`);
        break;
      }
    }
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io ready for real-time connections`);
});
