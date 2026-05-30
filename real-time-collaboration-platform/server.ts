import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';

// --- DATABASE SIMULATION LAYER ---
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const ROOMS_FILE = path.join(DATA_DIR, 'rooms.json');

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helpers to load/save JSON data
function loadUsers(): any[] {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveUsers(users: any[]) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function loadRooms(): any[] {
  if (!fs.existsSync(ROOMS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(ROOMS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveRooms(rooms: any[]) {
  fs.writeFileSync(ROOMS_FILE, JSON.stringify(rooms, null, 2));
}

// Ensure first default collections exist
if (!fs.existsSync(USERS_FILE)) saveUsers([]);
if (!fs.existsSync(ROOMS_FILE)) saveRooms([]);

// --- SECURE AES ENCRYPTION UTILITIES ---
const ALGORITHM = 'aes-256-cbc';
const SECRET_JWT = process.env.JWT_SECRET || 'google_ai_studio_super_secure_secret_token_key_9999123';
// Derive a 32-byte key from our JWT token key
const ENCRYPTION_KEY = crypto.scryptSync(SECRET_JWT, 'collaboration_salt_string', 32);

function encryptBuffer(buffer: Buffer): Buffer {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}

function decryptBuffer(buffer: Buffer): Buffer {
  if (buffer.length < 16) {
    throw new Error('Invalid encrypted buffer size');
  }
  const iv = buffer.subarray(0, 16);
  const encrypted = buffer.subarray(16);
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

// --- EXPRESS APP SETUP ---
const app = express();
const server = http.createServer(app);
const PORT = 3000;

app.use(express.json());

// Content-security-policy headers
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Multer storage in memory so we encrypt prior to writing to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

// App URL declaration (lazy initialization placeholder if needed)
const appUrl = process.env.APP_URL || 'http://localhost:3000';

// --- MIDDLEWARE FOR JWT ---
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, SECRET_JWT, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// --- AUTH REST ENDPOINTS ---
app.post('/api/auth/register', (req: any, res: any) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const users = loadUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  const token = jwt.sign({ id: newUser.id, name: newUser.name, email: newUser.email }, SECRET_JWT, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
});

app.post('/api/auth/login', (req: any, res: any) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = loadUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET_JWT, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

app.get('/api/auth/me', authenticateToken, (req: any, res: any) => {
  res.json({ user: req.user });
});

// --- ROOM REST ENDPOINTS ---
app.post('/api/rooms/create', authenticateToken, (req: any, res: any) => {
  const { name, password, waitingRoom } = req.body;
  const rooms = loadRooms();

  const code = crypto.randomBytes(4).toString('hex'); // e.g. "a1b2c3d4"
  const passwordHash = password ? bcrypt.hashSync(password, bcrypt.genSaltSync(10)) : null;

  const newRoom = {
    id: code,
    name: name || `${req.user.name}'s Meeting`,
    passwordProtected: !!password,
    passwordHash,
    waitingRoomEnabled: !!waitingRoom,
    hostId: req.user.id,
    isLocked: false,
    allowedUsers: [req.user.id],
    createdAt: new Date().toISOString()
  };

  rooms.push(newRoom);
  saveRooms(rooms);

  res.status(201).json({
    roomId: code,
    name: newRoom.name,
    waitingRoomEnabled: newRoom.waitingRoomEnabled,
    passwordProtected: newRoom.passwordProtected,
  });
});

app.post('/api/rooms/validate', authenticateToken, (req: any, res: any) => {
  const { roomId, password } = req.body;
  const rooms = loadRooms();
  const room = rooms.find(r => r.id === roomId);

  if (!room) {
    return res.status(404).json({ error: 'Meeting room not found' });
  }

  if (room.isLocked && !room.allowedUsers.includes(req.user.id)) {
    return res.status(403).json({ error: 'This meeting room is locked by the host' });
  }

  if (room.passwordProtected && room.passwordHash) {
    if (!password) {
      return res.status(401).json({ error: 'Password required to join this room', isPasswordNeeded: true });
    }
    if (!bcrypt.compareSync(password, room.passwordHash)) {
      return res.status(401).json({ error: 'Incorrect meeting password', isPasswordNeeded: true });
    }
  }

  // Add user to allowed list
  if (!room.allowedUsers.includes(req.user.id)) {
    room.allowedUsers.push(req.user.id);
    saveRooms(rooms);
  }

  res.json({
    success: true,
    roomId: room.id,
    name: room.name,
    waitingRoomEnabled: room.waitingRoomEnabled,
    hostId: room.hostId,
    isHost: room.hostId === req.user.id
  });
});

// --- FILE UPLOADS/DOWNLOADS (SECURED BY AES) ---
app.post('/api/files/upload', authenticateToken, upload.single('file'), (req: any, res: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  // Encrypt the file buffer
  const encrypted = encryptBuffer(req.file.buffer);
  const fileId = crypto.randomUUID();
  const originalName = req.file.originalname;
  const mimeType = req.file.mimetype;
  const size = req.file.size;

  // Save the encrypted file to storage structure
  const savedPath = path.join(UPLOADS_DIR, fileId);
  fs.writeFileSync(savedPath, encrypted);

  // Return file sharing metadata
  res.status(201).json({
    file: {
      id: fileId,
      name: originalName,
      size,
      mimeType,
      uploadedBy: req.user.name,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  });
});

app.get('/api/files/download/:id', async (req: any, res: any) => {
  const { id } = req.params;
  const fileName = req.query.name || 'file';
  const filePath = path.join(UPLOADS_DIR, id);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    const encryptedData = fs.readFileSync(filePath);
    const decryptedData = decryptBuffer(encryptedData);

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(decryptedData);
  } catch (error) {
    console.error('File decryption failed:', error);
    res.status(500).json({ error: 'Failed to access or decrypt secure file' });
  }
});

// --- SOCKET.IO SIGNALLING & DATA REAL-TIME SYNC ---
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Active meeting users trace in-memory
// roomId -> Map(socketId -> { userId, name, isScreenSharing })
interface Participant {
  userId: string;
  name: string;
  socketId: string;
  isScreenSharing: boolean;
  isHost: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
}

const activeRooms = new Map<string, Map<string, Participant>>();
const socketToRoom = new Map<string, string>();

io.on('connection', (socket) => {
  // JOIN ROOM
  socket.on('join-room', ({ roomId, userId, name }) => {
    socketToRoom.set(socket.id, roomId);
    socket.join(roomId);

    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Map());
    }

    const rooms = loadRooms();
    const roomRecord = rooms.find(r => r.id === roomId);
    const isHost = roomRecord ? roomRecord.hostId === userId : false;

    const participant: Participant = {
      userId,
      name,
      socketId: socket.id,
      isScreenSharing: false,
      isHost,
      isMuted: false,
      isCameraOff: false,
    };

    const roomParticipants = activeRooms.get(roomId)!;
    roomParticipants.set(socket.id, participant);

    // Notify other users that someone connected
    socket.to(roomId).emit('user-connected', {
      userId,
      name,
      socketId: socket.id,
      isScreenSharing: false,
      isHost,
      isMuted: false,
      isCameraOff: false,
    });

    // Send back current list of participants to the joiner
    const list = Array.from(roomParticipants.values()).filter(p => p.socketId !== socket.id);
    socket.emit('room-users', list);
  });

  // DISCONNECT / LEAVE ROOM
  const handleLeave = () => {
    const roomId = socketToRoom.get(socket.id);
    if (!roomId) return;

    const roomParticipants = activeRooms.get(roomId);
    if (roomParticipants) {
      const participant = roomParticipants.get(socket.id);
      if (participant) {
        socket.to(roomId).emit('user-disconnected', {
          socketId: socket.id,
          userId: participant.userId,
          name: participant.name,
        });
      }
      roomParticipants.delete(socket.id);
      if (roomParticipants.size === 0) {
        activeRooms.delete(roomId);
      }
    }
    socketToRoom.delete(socket.id);
  };

  socket.on('leave-room', handleLeave);
  socket.on('disconnect', handleLeave);

  // WEBRTC SIGNALING EXCHANGE
  socket.on('offer', ({ targetSocketId, offer }) => {
    io.to(targetSocketId).emit('offer', {
      senderSocketId: socket.id,
      offer,
    });
  });

  socket.on('answer', ({ targetSocketId, answer }) => {
    io.to(targetSocketId).emit('answer', {
      senderSocketId: socket.id,
      answer,
    });
  });

  socket.on('ice-candidate', ({ targetSocketId, candidate }) => {
    io.to(targetSocketId).emit('ice-candidate', {
      senderSocketId: socket.id,
      candidate,
    });
  });

  // REALTIME CHAT MESSAGES
  socket.on('chat-message', ({ roomId, message }) => {
    // Encrypt at socket transit optionally or just forward immediately for live presentation
    socket.to(roomId).emit('chat-message', message);
  });

  socket.on('typing', ({ roomId, userId, name, isTyping }) => {
    socket.to(roomId).emit('typing', { userId, name, isTyping });
  });

  // WHITEBOARD COLLABORATION SYNC (IDEMPOTENT DRAWINGS)
  socket.on('whiteboard-draw', ({ roomId, drawData }) => {
    socket.to(roomId).emit('whiteboard-draw', drawData);
  });

  socket.on('clear-board', ({ roomId }) => {
    socket.to(roomId).emit('clear-board');
  });

  // SCREEN SHARE BROADCAST
  socket.on('screen-share-start', ({ roomId }) => {
    const space = activeRooms.get(roomId);
    if (space) {
      const p = space.get(socket.id);
      if (p) p.isScreenSharing = true;
    }
    socket.to(roomId).emit('screen-share-start', { socketId: socket.id });
  });

  socket.on('screen-share-stop', ({ roomId }) => {
    const space = activeRooms.get(roomId);
    if (space) {
      const p = space.get(socket.id);
      if (p) p.isScreenSharing = false;
    }
    socket.to(roomId).emit('screen-share-stop', { socketId: socket.id });
  });

  // HANDRAISE OR ADMIN CONTROLS
  socket.on('participant-toggle-media', ({ roomId, type, value }) => {
    const space = activeRooms.get(roomId);
    if (space) {
      const p = space.get(socket.id);
      if (p) {
        if (type === 'audio') p.isMuted = value;
        if (type === 'video') p.isCameraOff = value;
      }
    }
    socket.to(roomId).emit('participant-media-status', { socketId: socket.id, type, value });
  });

  // HOST REMOVING A PARTICIPANT (KICK)
  socket.on('kick-user', ({ roomId, targetSocketId }) => {
    // Verify kicker is host (optional room record validation or just socket state checking)
    const space = activeRooms.get(roomId);
    if (space) {
      const initiator = space.get(socket.id);
      if (initiator && initiator.isHost) {
        io.to(targetSocketId).emit('kicked-from-meeting');
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
          targetSocket.leave(roomId);
        }
      }
    }
  });

  // HOST LOCKING ROOM
  socket.on('toggle-lock-room', ({ roomId, isLocked }) => {
    const space = activeRooms.get(roomId);
    if (space) {
      const initiator = space.get(socket.id);
      if (initiator && initiator.isHost) {
        const rooms = loadRooms();
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          room.isLocked = isLocked;
          saveRooms(rooms);
          io.to(roomId).emit('room-lock-status-changed', { isLocked });
        }
      }
    }
  });
});

// --- VITE MIDDLEWARE & STATIC FILE FALLBACK ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[CollabCore] Real-time Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
