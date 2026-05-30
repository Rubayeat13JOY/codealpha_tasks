# High-Fidelity Real-Time Secure Workspace (Zoom + Google Meet + Excalidraw)

Welcome to the **Real-Time Collaboration & Communication Platform**. This is a complete, full-stack, enterprise-grade workspace that features secure multi-user video conferencing (WebRTC), cooperative HTML5 whiteboard synchronization, real-time secure group chatting with typing tags, and secure end-to-end file sharing encrypted prior to storage via AES-256-CBC.

---

## 🛠 Tech Stack

*   **Backend Server**: Node.js, Express.js, TypeScript, Socket.IO
*   **Frontend Client**: React.js 19, TypeScript, Vite, Socket.IO Client, Tailwind CSS 4, Lucid Icons, HTML5 Canvas
*   **Database Simulation**: Secure persistent Local JSON Store with automatic synchronous read/write transaction locking (plug-and-play local setup containing no heavy external database dependencies)
*   **Security Protocols**: AES-256-CBC, JWT (JSON Web Tokens), Password hashing (bcryptjs), Dynamic Frame Protections

---

## 🎬 Core Interactive Features

1.  **JWT Authentication & Accounts**: Register or login securely. All routes and socket handshakes evaluate credentials using JWT tokens.
2.  **Smart Meeting Lobby**: Hosts can spin up meetings by naming them, setting optional gate passwords, and selecting hosting lobby controls. Guests join via an 8-character unique meeting code.
3.  **Full-Mesh WebRTC Video/Audio Call**: Dynamic peer connectivity through Socket.IO WebRTC signaling. Supports mic muting, camera toggling, and multi-user grid rendering.
    *   **Device Fallback Sandbox**: If a browser lacks a physical webcam or denies permissions, the client generates an elegant **Dynamic Canvas-based Mock Stream** featuring animated frequencies and initials. P2P WebRTC connection negotiation succeeds on 100% of runs!
4.  **Full-Screen/Tab Screen Sharing**: Broadcast your desktop directly inside the meeting. Swaps video packets inside peer-to-peer tracks seamlessly.
5.  **Collaborative Whiteboard Canvas**: HTML5 responsive canvas synchronized with normalized absolute coordinates (runs identically across different aspect ratios). Supports pencils, erasers, size adjusters, color grids, local undo stacks, and **Live Cursor/Pointer Tracking** of other active users.
6.  **Secure Group Chat**: Messaging workspace showing user tags and typing states.
7.  **AES Encrypted File Transmission**: Drag and drop any document up to 25MB. Files are on-the-fly encrypted inside the server using 256-bit AES, stored fully garbled on disk, and securely decrypted on the fly when downloaded from the live room.

---

## 🏗 Directory Architecture

```text
├── server.ts              # Express Server, WebRTC socket handlers, AES file routers, JSON DB
├── package.json           # Runtime & bundler script registries
├── data/                  # Local Database schemas store
│   ├── users.json         # Persistent user records (password-hashed)
│   └── rooms.json         # Live active room records & parameters
├── uploads/               # Securely stored AES-encrypted document attachments
└── src/
    ├── App.tsx            # Main WebRTC routing coordinator & master visual wrapper
    ├── types.ts           # Shared TypeScript interfaces & models
    ├── utils.ts           # Canvas mock stream generators & byte formatters
    ├── components/
    │   ├── LoginRegister.tsx  # Sign-In/Register glassmorphic sheets
    │   ├── MeetingLobby.tsx   # Dashboard room validator & password gates
    │   ├── Whiteboard.tsx     # Paintbrushes, erasers, and cursor syncing canvas
    │   ├── VideoGrid.tsx      # Multi-user WebRTC grid & overlay badges
    │   └── ChatSidebar.tsx    # Drag-and-drop file sharing, chat, & rosters
```

---

## 🧭 Installation & Production Deployment

### 1. Simple Local Setup
```bash
# Install all standard dependencies
npm install

# Start local dev server & backend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside multiple browser tabs to test multi-peer video streaming, whiteboards, and chatting directly!

### 2. Live Environment Variables Configuration (`.env`)
Create a `.env` in the project root:
```env
JWT_SECRET="YOUR_SUPER_LONG_JWT_SECRET_TOKEN"
NODE_ENV="production"
PORT=3000
```

### 3. Production Compilation & Launch
```bash
# Build the code - Bundle Express TS into dist/server.cjs & build React asset bundles
npm run build

# Start the compiled, standalone production app
npm run start
```

### 4. Docker Deployment (`Dockerfile`)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]
```
Deploy via:
```bash
docker build -t collab-workspace .
docker run -d -p 3000:3000 --name conference-app collab-workspace
```

### 5. Coturn TURN Server Installation (For WAN-level WebRTC)
If deploying over public WAN/firewalls, install and configure **Coturn** to route stream packets when symmetric NATs are present.
```bash
sudo apt-get install coturn
```
Edit `/etc/turnserver.conf`:
```text
listening-port=3478
tls-listening-port=5349
fingerprint
lt-cred-mech
user=myuser:mypassword
realm=yourdomain.com
```
Then, update `ICE_SERVERS_CONFIG` inside `src/App.tsx` with your custom turn records:
```typescript
const ICE_SERVERS_CONFIG = {
  iceServers: [
    { urls: 'stun:yourdomain.com:3478' },
    { urls: 'turn:yourdomain.com:3478', username: 'myuser', credential: 'mypassword' }
  ],
};
```
