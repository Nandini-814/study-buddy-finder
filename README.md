# 📚 Study Buddy Finder — MERN Full Stack App

A full-stack web application to help students find study partners based on subjects, interests, and availability. Features real-time chat via Socket.io, JWT authentication, smart matching algorithm, and study session scheduling.

---

## 🏗️ Project Structure

```
study-buddy-finder/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, Login
│   │   ├── userController.js      # Profile CRUD
│   │   ├── matchController.js     # Matching algorithm
│   │   ├── chatController.js      # Messages
│   │   └── sessionController.js  # Study sessions
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect
│   ├── models/
│   │   ├── User.js
│   │   ├── Match.js
│   │   ├── Message.js
│   │   └── Session.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── chatRoutes.js
│   │   └── sessionRoutes.js
│   ├── server.js                  # Express + Socket.io entry
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js     # Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── SignupPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── ProfilePage.js
    │   │   ├── BuddiesPage.js
    │   │   ├── ChatPage.js
    │   │   └── SessionsPage.js
    │   ├── components/
    │   │   └── Sidebar.js
    │   ├── utils/
    │   │   ├── api.js             # Axios instance
    │   │   └── socket.js          # Socket.io client
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── .env
    └── package.json
```

---

## ⚙️ Prerequisites

- Node.js v18+ — https://nodejs.org
- MongoDB installed locally OR MongoDB Atlas account
- npm or yarn

---

## 🚀 Setup Instructions

### 1. Install MongoDB (if running locally)

Download from: https://www.mongodb.com/try/download/community  
Start MongoDB service:
```bash
# Windows
net start MongoDB

# Or just run mongod
mongod
```

### 2. Backend Setup

```bash
cd study-buddy-finder/backend
npm install
```

Edit `.env` if needed:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/study-buddy-finder
JWT_SECRET=study_buddy_super_secret_key_2024
NODE_ENV=development
```

Start the backend:
```bash
npm run dev    # with nodemon (auto-restart)
# or
npm start      # without nodemon
```

Backend runs at: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd study-buddy-finder/frontend
npm install
```

Edit `.env` if needed:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the frontend:
```bash
npm start
```

Frontend runs at: **http://localhost:3000**

---

## 🔗 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/users/profile` | Get own profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| GET | `/api/users` | Get all users | Yes |
| GET | `/api/match/find` | Get suggested matches | Yes |
| POST | `/api/match/connect/:userId` | Send connect request | Yes |
| PUT | `/api/match/:matchId` | Accept/Reject request | Yes |
| GET | `/api/match/connections` | Get accepted connections | Yes |
| GET | `/api/match/requests` | Get incoming requests | Yes |
| GET | `/api/chat/conversations` | Get conversations list | Yes |
| GET | `/api/chat/messages/:userId` | Get messages with user | Yes |
| POST | `/api/chat/messages` | Send message (REST) | Yes |
| GET | `/api/sessions` | Get user's sessions | Yes |
| POST | `/api/sessions/create` | Create study session | Yes |
| PUT | `/api/sessions/:id/join` | Join a session | Yes |
| DELETE | `/api/sessions/:id` | Delete session | Yes |

---

## 🔌 Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `user:online` | Client→Server | Register user as online |
| `chat:join` | Client→Server | Join a chat room |
| `chat:message` | Client→Server | Send a message |
| `chat:receive` | Server→Client | Receive a message |
| `chat:typing` | Client→Server | Typing indicator start |
| `chat:stopTyping` | Client→Server | Typing indicator stop |
| `chat:notification` | Server→Client | New message notification |
| `users:online` | Server→Client | Updated online users list |

---

## 🎯 Features

- ✅ JWT Authentication (Login / Signup)
- ✅ Smart Matching Algorithm (subject overlap + availability + teaching/learning complementarity)
- ✅ Real-time Chat with Socket.io (typing indicators, online status)
- ✅ Study Session Scheduler (create, join, invite buddies)
- ✅ Connection Requests (send, accept, reject)
- ✅ Responsive Dark UI with glassmorphism
- ✅ Protected Routes
- ✅ Search & Filter Buddies

---

## 🌐 Using MongoDB Atlas (Cloud)

1. Create free account at https://www.mongodb.com/atlas
2. Create a cluster → Get connection string
3. Replace `MONGO_URI` in `backend/.env`:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/study-buddy-finder?retryWrites=true&w=majority
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, React Router v6, Socket.io-client |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Real-time | Socket.io |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Icons | lucide-react |
