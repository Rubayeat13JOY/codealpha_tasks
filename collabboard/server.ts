/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "db.json");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ----------------------------------------------------
// DB INIT & HELPER SEEDING
// ----------------------------------------------------

interface DatabaseSchema {
  users: any[];
  projects: any[];
  teams: any[];
  tasks: any[];
  notifications: any[];
  documents: any[];
}

const SECRETS_SALT = "collab_board_2026_salt";

function hashPassword(password: string): string {
  return crypto.createHmac("sha256", SECRETS_SALT).update(password).digest("hex");
}

function generateId(): string {
  return crypto.randomUUID();
}

function loadDatabase(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    const defaultDb: DatabaseSchema = {
      users: [],
      projects: [],
      teams: [],
      tasks: [],
      notifications: [],
      documents: []
    };
    // Seed initial users
    const users = [
      {
        id: "usr_admin",
        name: "Allison Vance",
        email: "admin@collab.com",
        passwordHash: hashPassword("admin123"),
        role: "Admin",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop",
        status: "offline",
        activity: [],
        createdAt: new Date().toISOString()
      },
      {
        id: "usr_pm",
        name: "Marcus Aurelius",
        email: "pm@collab.com",
        passwordHash: hashPassword("pm123"),
        role: "Project Manager",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
        status: "offline",
        activity: [],
        createdAt: new Date().toISOString()
      },
      {
        id: "usr_tech",
        name: "Joy Rubayeat",
        email: "tech@collab.com",
        passwordHash: hashPassword("tech123"),
        role: "Team Member",
        avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop",
        status: "offline",
        activity: [],
        createdAt: new Date().toISOString()
      }
    ];

    const teams = [
      {
        id: "team_phoenix",
        name: "Phoenix Innovators",
        description: "Core product development group focused on SaaS delivery & UX.",
        members: ["usr_admin", "usr_pm", "usr_tech"],
        chat: [
          {
            id: generateId(),
            senderId: "usr_pm",
            senderName: "Marcus Aurelius",
            text: "Hello team! Welcome to the new workspace. Check out the Alpha Launchpad board.",
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: generateId(),
            senderId: "usr_tech",
            senderName: "Joy Rubayeat",
            text: "Excited to collaborate here! I will start analyzing the database design task.",
            timestamp: new Date(Date.now() - 1800000).toISOString()
          }
        ],
        createdAt: new Date().toISOString()
      }
    ];

    const projects = [
      {
        id: "proj_alpha",
        name: "Alpha Launchpad",
        description: "Modernizing the customer onboarding portal and real-time kanban features.",
        deadline: "2026-08-30",
        status: "Active",
        visibility: "public",
        members: ["usr_admin", "usr_pm", "usr_tech"],
        createdAt: new Date().toISOString()
      }
    ];

    const tasks = [
      {
        id: "task_1",
        projectId: "proj_alpha",
        title: "Design Relational Schema",
        description: "Develop a persistent data layout supporting projects, comments, and collaborative records.",
        status: "Completed",
        priority: "High",
        dueDate: "2026-06-15",
        assignees: ["usr_tech"],
        tags: ["database", "backend"],
        subtasks: [
          { id: "sub_1", title: "Map out entity hierarchies", completed: true },
          { id: "sub_2", title: "Define validation triggers", completed: true }
        ],
        attachments: [],
        comments: [
          {
            id: "com_11",
            taskId: "task_1",
            authorId: "usr_pm",
            authorName: "Marcus Aurelius",
            text: "Great work completing this! Excellent layout design.",
            createdAt: new Date(Date.now() - 7200000).toISOString()
          }
        ],
        activities: [
          { id: generateId(), userId: "usr_tech", userName: "Joy Rubayeat", action: "Created task", timestamp: new Date(Date.now() - 86400000).toISOString() },
          { id: generateId(), userId: "usr_tech", userName: "Joy Rubayeat", action: "Moved status to Completed", timestamp: new Date(Date.now() - 7200000).toISOString() }
        ],
        createdAt: new Date().toISOString()
      },
      {
        id: "task_2",
        projectId: "proj_alpha",
        title: "Build Event Stream Synchronization",
        description: "Establish Express-based SSE synchronization loops for broadcasting project modifications.",
        status: "In Progress",
        priority: "High",
        dueDate: "2026-06-20",
        assignees: ["usr_tech", "usr_admin"],
        tags: ["realtime", "sockets"],
        subtasks: [
          { id: "sub_3", title: "Implement clients connection collection", completed: true },
          { id: "sub_4", title: "Add broadcast trigger on DB write", completed: false }
        ],
        attachments: [],
        comments: [],
        activities: [],
        createdAt: new Date().toISOString()
      },
      {
        id: "task_3",
        projectId: "proj_alpha",
        title: "Integrate Interactive Docs",
        description: "Add a Notion-style markdown page manager that supports auto-saving team proposals.",
        status: "Todo",
        priority: "Medium",
        dueDate: "2026-07-05",
        assignees: ["usr_admin"],
        tags: ["documentation", "notion"],
        subtasks: [],
        attachments: [],
        comments: [],
        activities: [],
        createdAt: new Date().toISOString()
      },
      {
        id: "task_4",
        projectId: "proj_alpha",
        title: "Gemini Copilot Analytics",
        description: "Enable our LLM intelligence to build checklists, summarize team comments, and compile reviews.",
        status: "Review",
        priority: "Urgent",
        dueDate: new Date().toISOString().split("T")[0],
        assignees: ["usr_pm", "usr_tech"],
        tags: ["ai", "copilot"],
        subtasks: [
          { id: "sub_5", title: "Include @google/genai package on node", completed: true },
          { id: "sub_6", title: "Create server-side logic and validation routes", completed: true },
          { id: "sub_7", title: "Design chat widget with system instructions", completed: false }
        ],
        attachments: [],
        comments: [],
        activities: [],
        createdAt: new Date().toISOString()
      }
    ];

    const documents = [
      {
        id: "doc_1",
        projectId: "proj_alpha",
        title: "Alpha Requirements & Specs",
        content: `## Customer Onboarding Portal Spec\n\nThis document outlines requirements for the Alpha launch. All project tasks must target these checkpoints:\n\n### Key Milestones\n1. **Realtime Board**: Team members can drag/drop cards to update colleagues immediately.\n2. **Rich Workspace**: Incorporate lightweight pages for planning documents.\n3. **Gemini Guidance**: Analyze comments and subtasks to surface blockers.\n\n### Open Questions\n* What is the response latency on SSE under network throttling?`,
        lastEditedBy: "usr_pm",
        lastEditedByName: "Marcus Aurelius",
        lastEditedAt: new Date().toISOString()
      }
    ];

    defaultDb.users = users;
    defaultDb.teams = teams;
    defaultDb.projects = projects;
    defaultDb.tasks = tasks;
    defaultDb.documents = documents;

    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDb, null, 2));
    return defaultDb;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
}

function saveDatabase(db: DatabaseSchema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ----------------------------------------------------
// JWT OR SECURE TOKEN AUTH SYSTEM (CRYPTO-BASED)
// ----------------------------------------------------

function signToken(payload: { userId: string; role: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 86400000 })).toString("base64url"); // 1 day
  const signature = crypto.createHmac("sha256", SECRETS_SALT).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): { userId: string; role: string; email: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const computedSig = crypto.createHmac("sha256", SECRETS_SALT).update(`${header}.${body}`).digest("base64url");
    if (signature !== computedSig) return null;

    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    if (payload.exp < Date.now()) return null; // Expired
    return payload;
  } catch (err) {
    return null;
  }
}

// Ensure database loads the seed data on startup
const db = loadDatabase();

// ----------------------------------------------------
// SSE REAL-TIME SYNC STATE
// ----------------------------------------------------

interface SseClient {
  id: string;
  res: any;
}
let sseClients: SseClient[] = [];

function broadcastSseEvent(type: string, payload: any) {
  const dataString = JSON.stringify({ type, payload });
  sseClients.forEach((c) => {
    try {
      c.res.write(`data: ${dataString}\n\n`);
    } catch (e) {
      // Clean up failed sockets
    }
  });
}

// ----------------------------------------------------
// GEMINI copilot setup
// ----------------------------------------------------

let genAI: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// ----------------------------------------------------
// EXPRESS APP CONFIGURATION
// ----------------------------------------------------

const app = express();
app.use(express.json({ limit: "50mb" })); // Support base64 image submissions

// Request authentication middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing authorization token" });
  }
  const token = authHeader.split(" ")[1];
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
  req.user = payload;
  next();
}

// Real-time Event Stream (SSE)
app.get("/api/events", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive"
  });
  res.write("retry: 10000\n\n");

  const clientId = generateId();
  sseClients.push({ id: clientId, res });

  req.on("close", () => {
    sseClients = sseClients.filter((c) => c.id !== clientId);
  });
});

// ----------------------------------------------------
// AUTH ENDPOINTS
// ----------------------------------------------------

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password required" });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const newUser = {
    id: "usr_" + generateId().replace(/-/g, "").substring(0, 10),
    name,
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    role: role || "Team Member",
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
    status: "offline",
    activity: [],
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDatabase(db);

  const token = signToken({ userId: newUser.id, role: newUser.role, email: newUser.email });
  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status
    }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  user.status = "online";
  saveDatabase(db);

  broadcastSseEvent("user:status", { userId: user.id, status: "online" });

  const token = signToken({ userId: user.id, role: user.role, email: user.email });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      status: "online"
    }
  });
});

app.get("/api/auth/me", authenticate, (req: any, res) => {
  const user = db.users.find((u) => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    status: user.status
  });
});

app.post("/api/auth/logout", authenticate, (req: any, res) => {
  const user = db.users.find((u) => u.id === req.user.userId);
  if (user) {
    user.status = "offline";
    saveDatabase(db);
    broadcastSseEvent("user:status", { userId: user.id, status: "offline" });
  }
  res.json({ success: true });
});

// ----------------------------------------------------
// USERS ENDPOINTS
// ----------------------------------------------------

app.get("/api/users", authenticate, (req, res) => {
  const sanitized = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl,
    status: u.status
  }));
  res.json(sanitized);
});

app.put("/api/users/profile", authenticate, (req: any, res) => {
  const user = db.users.find((u) => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  const { name, avatarUrl, role } = req.body;
  if (name) user.name = name;
  if (avatarUrl) user.avatarUrl = avatarUrl;
  if (role) {
    // Only admins can change roles
    if (req.user.role === "Admin") {
      user.role = role;
    }
  }

  saveDatabase(db);
  broadcastSseEvent("user:profile-updated", {
    id: user.id,
    name: user.name,
    avatarUrl: user.avatarUrl,
    role: user.role
  });

  res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl,
    status: user.status
  });
});

// ----------------------------------------------------
// PROJECT ENDPOINTS
// ----------------------------------------------------

app.get("/api/projects", authenticate, (req, res) => {
  // If private, filter projects where user is a member, otherwise permit
  res.json(db.projects);
});

app.post("/api/projects", authenticate, (req: any, res) => {
  const { name, description, deadline, visibility } = req.body;
  if (!name) return res.status(400).json({ error: "Project name is required" });

  const newProj = {
    id: "proj_" + generateId().replace(/-/g, "").substring(0, 10),
    name,
    description: description || "",
    deadline: deadline || "",
    status: "Planning",
    visibility: visibility || "public",
    members: [req.user.userId],
    createdAt: new Date().toISOString()
  };

  db.projects.push(newProj);
  saveDatabase(db);

  broadcastSseEvent("project:created", newProj);
  res.status(201).json(newProj);
});

app.put("/api/projects/:id", authenticate, (req: any, res) => {
  const proj = db.projects.find((p) => p.id === req.params.id);
  if (!proj) return res.status(404).json({ error: "Project not found" });

  const { name, description, deadline, status, visibility, members } = req.body;
  if (name !== undefined) proj.name = name;
  if (description !== undefined) proj.description = description;
  if (deadline !== undefined) proj.deadline = deadline;
  if (status !== undefined) proj.status = status;
  if (visibility !== undefined) proj.visibility = visibility;
  if (members !== undefined) proj.members = members;

  saveDatabase(db);
  broadcastSseEvent("project:updated", proj);
  res.json(proj);
});

app.delete("/api/projects/:id", authenticate, (req, res) => {
  const index = db.projects.findIndex((p) => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Project not found" });

  db.projects.splice(index, 1);
  // Also clean up connected tasks
  db.tasks = db.tasks.filter((t) => t.projectId !== req.params.id);

  saveDatabase(db);
  broadcastSseEvent("project:deleted", req.params.id);
  res.json({ success: true });
});

// ----------------------------------------------------
// TASK ENDPOINTS
// ----------------------------------------------------

app.get("/api/tasks", authenticate, (req, res) => {
  res.json(db.tasks);
});

app.post("/api/tasks", authenticate, (req: any, res) => {
  const { projectId, title, description, status, priority, dueDate, assignees, tags } = req.body;
  if (!projectId || !title) return res.status(400).json({ error: "Project ID & Title required" });

  const newTask = {
    id: "task_" + generateId().replace(/-/g, "").substring(0, 10),
    projectId,
    title,
    description: description || "",
    status: status || "Todo",
    priority: priority || "Medium",
    dueDate: dueDate || "",
    assignees: assignees || [],
    tags: tags || [],
    subtasks: [],
    attachments: [],
    comments: [],
    activities: [
      {
        id: generateId(),
        userId: req.user.userId,
        userName: db.users.find((u) => u.id === req.user.userId)?.name || "User",
        action: "created the task",
        timestamp: new Date().toISOString()
      }
    ],
    createdAt: new Date().toISOString()
  };

  db.tasks.push(newTask);
  saveDatabase(db);

  // Send assign notifications
  if (assignees && assignees.length > 0) {
    assignees.forEach((uid: string) => {
      if (uid !== req.user.userId) {
        db.notifications.push({
          id: generateId(),
          userId: uid,
          title: "New Task Assigned",
          message: `You have been assigned to: "${title}"`,
          read: false,
          type: "task_assigned",
          projectId,
          taskId: newTask.id,
          createdAt: new Date().toISOString()
        });
      }
    });
    saveDatabase(db);
    broadcastSseEvent("notifications:updated", null);
  }

  broadcastSseEvent("task:created", newTask);
  res.status(201).json(newTask);
});

app.put("/api/tasks/:id", authenticate, (req: any, res) => {
  const task = db.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const { title, description, status, priority, dueDate, assignees, tags, subtasks } = req.body;
  const userObj = db.users.find((u) => u.id === req.user.userId);
  const userName = userObj ? userObj.name : "User";

  let statusChanged = false;
  let prevStatus = task.status;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined && status !== task.status) {
    statusChanged = true;
    prevStatus = task.status;
    task.status = status;
    task.activities.push({
      id: generateId(),
      userId: req.user.userId,
      userName,
      action: `moved status from ${prevStatus} to ${status}`,
      timestamp: new Date().toISOString()
    });
  }
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (tags !== undefined) task.tags = tags;
  if (subtasks !== undefined) task.subtasks = subtasks;

  if (assignees !== undefined) {
    const oldAssignees = task.assignees || [];
    task.assignees = assignees;

    // Check newly assigned
    assignees.forEach((uid: string) => {
      if (!oldAssignees.includes(uid) && uid !== req.user.userId) {
        db.notifications.push({
          id: generateId(),
          userId: uid,
          title: "Assigned to Task",
          message: `You were assigned: "${task.title}"`,
          read: false,
          type: "task_assigned",
          projectId: task.projectId,
          taskId: task.id,
          createdAt: new Date().toISOString()
        });
      }
    });
  }

  saveDatabase(db);
  broadcastSseEvent("task:updated", task);
  if (statusChanged) {
    broadcastSseEvent("task:moved", {
      taskId: task.id,
      from: prevStatus,
      to: status,
      userId: req.user.userId,
      userName
    });
  }
  res.json(task);
});

app.delete("/api/tasks/:id", authenticate, (req, res) => {
  const index = db.tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Task not found" });

  const task = db.tasks[index];
  db.tasks.splice(index, 1);
  saveDatabase(db);

  broadcastSseEvent("task:deleted", task.id);
  res.json({ success: true });
});

// Comments
app.post("/api/tasks/:id/comments", authenticate, (req: any, res) => {
  const task = db.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Comment text required" });

  const currentUser = db.users.find((u) => u.id === req.user.userId);
  const newComment = {
    id: "com_" + generateId().replace(/-/g, "").substring(0, 10),
    taskId: task.id,
    authorId: req.user.userId,
    authorName: currentUser ? currentUser.name : "User",
    authorAvatar: currentUser?.avatarUrl,
    text,
    createdAt: new Date().toISOString()
  };

  task.comments = task.comments || [];
  task.comments.push(newComment);

  task.activities.push({
    id: generateId(),
    userId: req.user.userId,
    userName: currentUser ? currentUser.name : "User",
    action: "added a comment",
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  broadcastSseEvent("task:updated", task);
  broadcastSseEvent("comment:added", { taskId: task.id, comment: newComment });

  // Notifications for other task members or assignees
  const notifyGroup = new Set([...(task.assignees || []), ...task.comments.map((c: any) => c.authorId)]);
  notifyGroup.delete(req.user.userId);

  notifyGroup.forEach((uid) => {
    db.notifications.push({
      id: generateId(),
      userId: uid,
      title: "New Task Comment",
      message: `${currentUser ? currentUser.name : "Team Member"} commented on "${task.title}": "${text.substring(0, 25)}..."`,
      read: false,
      type: "mention",
      projectId: task.projectId,
      taskId: task.id,
      createdAt: new Date().toISOString()
    });
  });
  saveDatabase(db);
  broadcastSseEvent("notifications:updated", null);

  res.status(201).json(newComment);
});

// File upload attachment (Mock/Real inline uploads)
app.post("/api/tasks/:id/attachments", authenticate, (req: any, res) => {
  const task = db.tasks.find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  const { name, data, type, size } = req.body; // base64 encoded document/image
  if (!name || !data) return res.status(400).json({ error: "File name and content data required" });

  // Save base64 data to local uploads dir
  const fileExtension = name.split(".").pop();
  const fileBaseName = generateId();
  const diskFileName = `${fileBaseName}.${fileExtension}`;
  const diskPath = path.join(UPLOADS_DIR, diskFileName);

  try {
    const base64Clean = data.split(";base64,").pop();
    fs.writeFileSync(diskPath, Buffer.from(base64Clean, "base64"));
  } catch (err) {
    return res.status(500).json({ error: "Failed to write file buffer onto disk" });
  }

  const fileUrl = `/uploads/${diskFileName}`;
  const newAttach = {
    id: generateId(),
    name,
    url: fileUrl,
    type: type || "application/octet-stream",
    size: size || 0
  };

  task.attachments = task.attachments || [];
  task.attachments.push(newAttach);

  const currentUser = db.users.find((u) => u.id === req.user.userId);
  task.activities.push({
    id: generateId(),
    userId: req.user.userId,
    userName: currentUser ? currentUser.name : "User",
    action: `uploaded attachment "${name}"`,
    timestamp: new Date().toISOString()
  });

  saveDatabase(db);
  broadcastSseEvent("task:updated", task);
  res.status(201).json(newAttach);
});

// Static URL direct map for uploads folder
app.use("/uploads", express.static(UPLOADS_DIR));

// ----------------------------------------------------
// TEAMS / GROUP ENDPOINTS
// ----------------------------------------------------

app.get("/api/teams", authenticate, (req, res) => {
  res.json(db.teams);
});

app.post("/api/teams", authenticate, (req: any, res) => {
  const { name, description, members } = req.body;
  if (!name) return res.status(400).json({ error: "Team name is required" });

  const initialMembers = members || [];
  if (!initialMembers.includes(req.user.userId)) {
    initialMembers.push(req.user.userId);
  }

  const newTeam = {
    id: "team_" + generateId().replace(/-/g, "").substring(0, 10),
    name,
    description: description || "",
    members: initialMembers,
    chat: [],
    createdAt: new Date().toISOString()
  };

  db.teams.push(newTeam);
  saveDatabase(db);

  broadcastSseEvent("team:created", newTeam);
  res.status(201).json(newTeam);
});

app.post("/api/teams/:id/chat", authenticate, (req: any, res) => {
  const team = db.teams.find((t) => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Message text is mandatory" });

  const currentUser = db.users.find((u) => u.id === req.user.userId);
  const msg = {
    id: generateId(),
    senderId: req.user.userId,
    senderName: currentUser ? currentUser.name : "User",
    senderAvatar: currentUser?.avatarUrl,
    text,
    timestamp: new Date().toISOString()
  };

  team.chat = team.chat || [];
  team.chat.push(msg);

  // Limit chats array size just for lightweight persistence
  if (team.chat.length > 200) {
    team.chat.shift();
  }

  saveDatabase(db);
  broadcastSseEvent("team:chat", { teamId: team.id, message: msg });

  // Notifications for offline members
  team.members.forEach((uid: string) => {
    if (uid !== req.user.userId) {
      const isOnline = db.users.find((u) => u.id === uid)?.status === "online";
      if (!isOnline) {
        db.notifications.push({
          id: generateId(),
          userId: uid,
          title: "Team Chat Message",
          message: `${currentUser ? currentUser.name : "Someone"} in ${team.name}: "${text.substring(0, 30)}"`,
          read: false,
          type: "chat",
          createdAt: new Date().toISOString()
        });
      }
    }
  });
  saveDatabase(db);
  broadcastSseEvent("notifications:updated", null);

  res.status(201).json(msg);
});

// Invite / Manage Members
app.put("/api/teams/:id/members", authenticate, (req: any, res) => {
  const team = db.teams.find((t) => t.id === req.params.id);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const { members } = req.body;
  if (!members) return res.status(400).json({ error: "Members array is required" });

  team.members = members;
  saveDatabase(db);

  broadcastSseEvent("team:updated", team);
  res.json(team);
});

// ----------------------------------------------------
// NOTIFICATION ENDPOINTS
// ----------------------------------------------------

app.get("/api/notifications", authenticate, (req: any, res) => {
  const unread = db.notifications.filter((n) => n.userId === req.user.userId);
  res.json(unread);
});

app.put("/api/notifications/:id/read", authenticate, (req: any, res) => {
  const notif = db.notifications.find((n) => n.id === req.params.id && n.userId === req.user.userId);
  if (!notif) return res.status(404).json({ error: "Notification not found" });

  notif.read = true;
  // Sweep read items older than 1 hour to keep memory footprint compact
  db.notifications = db.notifications.filter((n) => !n.read || (Date.now() - new Date(n.createdAt).getTime()) < 3600000);

  saveDatabase(db);
  res.json({ success: true });
});

app.put("/api/notifications/read-all", authenticate, (req: any, res) => {
  db.notifications.forEach((n) => {
    if (n.userId === req.user.userId) {
      n.read = true;
    }
  });
  db.notifications = db.notifications.filter((n) => !n.read || (Date.now() - new Date(n.createdAt).getTime()) < 3600000);

  saveDatabase(db);
  res.json({ success: true });
});

// ----------------------------------------------------
// NOTION-STYLE DOCUMENTS ENDPOINTS
// ----------------------------------------------------

app.get("/api/documents", authenticate, (req, res) => {
  res.json(db.documents);
});

app.post("/api/documents", authenticate, (req: any, res) => {
  const { projectId, title, content } = req.body;
  if (!projectId || !title) return res.status(400).json({ error: "Project ID & Document Title are required" });

  const currentUser = db.users.find((u) => u.id === req.user.userId);
  const newDoc = {
    id: "doc_" + generateId().replace(/-/g, "").substring(0, 10),
    projectId,
    title,
    content: content || "",
    lastEditedBy: req.user.userId,
    lastEditedByName: currentUser ? currentUser.name : "User",
    lastEditedAt: new Date().toISOString()
  };

  db.documents.push(newDoc);
  saveDatabase(db);

  broadcastSseEvent("document:created", newDoc);
  res.status(201).json(newDoc);
});

app.put("/api/documents/:id", authenticate, (req: any, res) => {
  const doc = db.documents.find((d) => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: "Document not found" });

  const { title, content } = req.body;
  const currentUser = db.users.find((u) => u.id === req.user.userId);

  if (title !== undefined) doc.title = title;
  if (content !== undefined) doc.content = content;

  doc.lastEditedBy = req.user.userId;
  doc.lastEditedByName = currentUser ? currentUser.name : "User";
  doc.lastEditedAt = new Date().toISOString();

  saveDatabase(db);
  broadcastSseEvent("document:updated", doc);
  res.json(doc);
});

app.delete("/api/documents/:id", authenticate, (req, res) => {
  const index = db.documents.findIndex((d) => d.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Document not found" });

  const docId = db.documents[index].id;
  db.documents.splice(index, 1);
  saveDatabase(db);

  broadcastSseEvent("document:deleted", docId);
  res.json({ success: true });
});

// ----------------------------------------------------
// GEMINI INTELLIGENT DISCUSSIONS & CHECKS ENDPOINT
// ----------------------------------------------------

app.post("/api/gemini/copilot", authenticate, async (req: any, res) => {
  const { prompt, projectId, context } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt message is required" });

  if (!genAI) {
    return res.status(200).json({
      text: "The Gemini AI Copilot is currently offline. Please configure your API secret in **Settings > Secrets** in the AI Studio UI."
    });
  }

  try {
    const proj = db.projects.find((p) => p.id === projectId);
    const projTasks = db.tasks.filter((t) => t.projectId === projectId);
    const relatedDocs = db.documents.filter((d) => d.projectId === projectId);

    const contextPayload = `
PROJECT CONTEXT:
* Name: ${proj ? proj.name : "General Workspace"}
* Description: ${proj ? proj.description : "No explicit description"}
* Tasks status list:
  ${projTasks.map((t) => `- [${t.status}] ${t.title} (Priority: ${t.priority}, Due: ${t.dueDate}, Subtasks: ${t.subtasks.filter((s) => s.completed).length}/${t.subtasks.length} completed)`).join("\n  ")}

* Documents Outline:
  ${relatedDocs.map((d) => `- "${d.title}"`).join("\n  ")}

${context ? `ADDITIONAL CONTEXT:\n${context}` : ""}
`;

    const model = "gemini-3.5-flash";
    const result = await genAI.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [
            { text: `System directive: You are the team's expert Project Assistant Copilot inside CollabBoard. Your output should be very helpful, well-structured in clean markdown, containing direct advice. Do not use pseudo-intellectual buzzwords or "AI slop" headers. Help answer the user query regarding the project.\n\n${contextPayload}\n\nUser Question: ${prompt}` }
          ]
        }
      ],
      config: {
        temperature: 0.7
      }
    });

    res.json({ text: result.text });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "Internal generation failed" });
  }
});

// ----------------------------------------------------
// VITE CLIENT INTEGRATION MIDDLEWARE
// ----------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server and Vite rendering bootloader listening on http://localhost:${PORT}`);
  });
}

startServer();
