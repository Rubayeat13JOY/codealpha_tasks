/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User, Project, Team, Task, Comment, Notification, 
  NotionDocument, TaskStatus 
} from "./types";
import Navbar from "./components/Navbar";
import Sidebar, { SidebarTab } from "./components/Sidebar";
import KanbanBoard from "./components/KanbanBoard";
import TaskModal from "./components/TaskModal";
import TeamManagement from "./components/TeamManagement";
import NotionDoc from "./components/NotionDoc";
import GeminiCopilot from "./components/GeminiCopilot";
import ProjectAnalytics from "./components/ProjectAnalytics";

import { 
  Sparkles, Layers, Briefcase, Calendar, AlertTriangle, 
  CheckCircle, Plus, Info, Edit3, X, HelpCircle, Lock, HeartHandshake, FolderDot 
} from "lucide-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "info" | "warning";
}

export default function App() {
  // Authentication & session state
  const [token, setToken] = useState<string | null>(localStorage.getItem("collab_token"));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Core collections
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [documents, setDocuments] = useState<NotionDocument[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Selection states
  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<SidebarTab>("Kanban");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // UIs state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [addTaskColumn, setAddTaskColumn] = useState<TaskStatus>("Todo");
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Login forms state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState<string>("Team Member");

  // Profile configuration editing
  const [profileName, setProfileName] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  // Render Toast Alert Alert
  const addToast = (message: string, type: "success" | "info" | "warning" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // ----------------------------------------------------
  // SSE SYNC PROTOCOL LOOP
  // ----------------------------------------------------
  useEffect(() => {
    if (!token) return;

    const eventSource = new EventSource("/api/events");

    eventSource.onopen = () => {
      console.log("Real-time collaborative SSE synchronization pipeline connected.");
    };

    eventSource.onmessage = (event) => {
      try {
        const { type, payload } = JSON.parse(event.data);

        switch (type) {
          case "user:status":
            setUsers((prev) => 
              prev.map((u) => u.id === payload.userId ? { ...u, status: payload.status } : u)
            );
            break;

          case "user:profile-updated":
            setUsers((prev) => 
              prev.map((u) => u.id === payload.id ? { ...u, name: payload.name, avatarUrl: payload.avatarUrl, role: payload.role } : u)
            );
            if (currentUser && currentUser.id === payload.id) {
              setCurrentUser((prev: any) => prev ? { ...prev, name: payload.name, avatarUrl: payload.avatarUrl } : null);
            }
            break;

          case "project:created":
            setProjects((prev) => [...prev, payload]);
            addToast(`Project page "${payload.name}" formed.`, "success");
            break;

          case "project:updated":
            setProjects((prev) => prev.map((p) => p.id === payload.id ? payload : p));
            break;

          case "project:deleted":
            setProjects((prev) => prev.filter((p) => p.id !== payload));
            break;

          case "task:created":
            setTasks((prev) => {
              if (prev.some((t) => t.id === payload.id)) return prev;
              return [...prev, payload];
            });
            break;

          case "task:updated":
            setTasks((prev) => prev.map((t) => t.id === payload.id ? payload : t));
            setSelectedTask((prev) => prev && prev.id === payload.id ? payload : prev);
            break;

          case "task:moved":
            // payload: { taskId, from status, to status, userName }
            const movedTask = tasks.find((t) => t.id === payload.taskId);
            if (movedTask) {
              addToast(`${payload.userName} moved card: "${movedTask.title}" to ${payload.to}`, "info");
            }
            // Trigger quick records refetch to secure state integrity
            fetchTasks();
            break;

          case "task:deleted":
            setTasks((prev) => prev.filter((t) => t.id !== payload));
            setSelectedTask((prev) => prev && prev.id === payload ? null : prev);
            break;

          case "comment:added":
            // payload: { taskId, comment }
            setTasks((prev) => prev.map((t) => {
              if (t.id === payload.taskId) {
                const commentExists = t.comments?.some((c) => c.id === payload.comment.id);
                if (commentExists) return t;
                return { ...t, comments: [...(t.comments || []), payload.comment] };
              }
              return t;
            }));
            break;

          case "team:created":
            setTeams((prev) => [...prev, payload]);
            addToast(`Collaboration team "${payload.name}" formed.`, "success");
            break;

          case "team:updated":
            setTeams((prev) => prev.map((t) => t.id === payload.id ? payload : t));
            break;

          case "team:chat":
            // payload: { teamId, message }
            setTeams((prev) => prev.map((t) => {
              if (t.id === payload.teamId) {
                const chatExists = t.chat?.some((c) => c.id === payload.message.id);
                if (chatExists) return t;
                return { ...t, chat: [...(t.chat || []), payload.message] };
              }
              return t;
            }));
            break;

          case "document:created":
            setDocuments((prev) => [...prev, payload]);
            break;

          case "document:updated":
            setDocuments((prev) => prev.map((d) => d.id === payload.id ? payload : d));
            break;

          case "document:deleted":
            setDocuments((prev) => prev.filter((d) => d.id !== payload));
            break;

          case "notifications:updated":
            fetchNotifications();
            break;

          default:
            break;
        }
      } catch (err) {
        console.error("Fault in parsing incoming real-time SSE stream", err);
      }
    };

    eventSource.onerror = (err) => {
      console.log("SSE link fell down briefly. Automating reconnection logic...");
    };

    return () => {
      eventSource.close();
    };
  }, [token, tasks, currentUser]);

  // ----------------------------------------------------
  // INITIAL SESSIONS RECOVERY
  // ----------------------------------------------------
  useEffect(() => {
    recoverSession();
  }, [token]);

  const recoverSession = async () => {
    if (!token) {
      setIsAuthLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.id) {
        setCurrentUser(data);
        setProfileName(data.name);
        setProfileAvatar(data.avatarUrl || "");
        
        // Recover subsequent collections
        fetchUsers();
        fetchProjects();
        fetchTasks();
        fetchTeams();
        fetchNotifications();
        fetchDocuments();
      } else {
        // Stale token cleanup
        handleLogoutClean();
      }
    } catch (err) {
      handleLogoutClean();
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogoutClean = () => {
    localStorage.removeItem("collab_token");
    setToken(null);
    setCurrentUser(null);
  };

  // ----------------------------------------------------
  // API CALL COLLECTORS
  // ----------------------------------------------------

  const fetchUsers = async () => {
    const res = await fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setUsers(await res.json());
  };

  const fetchProjects = async () => {
    const res = await fetch("/api/projects", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) {
      const data = await res.json();
      setProjects(data);
      if (data.length > 0 && !activeProjectId) {
        setActiveProjectId(data[0].id);
      }
    }
  };

  const fetchTasks = async () => {
    const res = await fetch("/api/tasks", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setTasks(await res.json());
  };

  const fetchTeams = async () => {
    const res = await fetch("/api/teams", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setTeams(await res.json());
  };

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setNotifications(await res.json());
  };

  const fetchDocuments = async () => {
    const res = await fetch("/api/documents", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setDocuments(await res.json());
  };

  // ----------------------------------------------------
  // AUTH PROCEDURES (LOGIN / REG)
  // ----------------------------------------------------

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem("collab_token", data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        addToast("Signed in successfully. Welcome back!", "success");
      } else {
        alert(data.error || "Login parameters invalid");
      }
    } catch (err) {
      alert("Network failure mapping credentials validation");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, role: regRole })
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem("collab_token", data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        addToast("Account generated successfully. Welcome to Collab!", "success");
      } else {
        alert(data.error || "Registration validation error");
      }
    } catch (err) {
      alert("Failed to transact registration on backend server");
    }
  };

  const handleQuickDemoAccess = async (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await response.json();
      if (response.ok && data.token) {
        localStorage.setItem("collab_token", data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        addToast(`Logged in successfully context ${data.user.name}`, "success");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Quick sign invalid. Restoring link state.");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to sign out of the active session?")) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      handleLogoutClean();
    }
  };

  // ----------------------------------------------------
  //MUTATING OPERATIONS (SERVER CALL PROXIES)
  // ----------------------------------------------------

  const handleMoveTaskColumn = async (taskId: string, targetStatus: TaskStatus) => {
    // Op-to-date optimistic UI change
    setTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: targetStatus } : t));

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });
      if (!response.ok) {
        // Rollback on server validation errors
        fetchTasks();
        addToast("Workflow validation rejection. Reverting Card status.", "warning");
      }
    } catch (err) {
      fetchTasks();
    }
  };

  const handleUpdateTaskFields = async (taskId: string, updatedFields: Partial<Task>) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });
      if (!response.ok) {
        addToast("Error updating task fields", "warning");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setShowAddTaskModal(false);
        setSelectedTask(null);
        addToast("Card deleted successfully.", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (taskId: string, text: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
      if (response.ok) {
        const _newCom = await response.json();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadAttachment = async (taskId: string, file: { name: string; data: string; type: string; size: number }) => {
    addToast(`Uploading file details: ${file.name}...`, "info");
    try {
      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(file)
      });
      if (response.ok) {
        addToast(`File ${file.name} uploaded successfully!`, "success");
      } else {
        const errObj = await response.json();
        addToast(errObj.error || "File size limits. Use smaller logs.", "warning");
      }
    } catch (err) {
      addToast("Failed to upload the file to container server path.", "warning");
    }
  };

  // Creational task backlog
  const handleCreateTaskSubmit = async (title: string, description: string, priority: any, selectedAssignees: string[], tagText: string, dueDate: string) => {
    if (!title.trim() || !activeProject) return;
    const splitTags = tagText.split(",").map((t) => t.trim()).filter((t) => t.length > 0);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: activeProject.id,
          title: title.trim(),
          description: description.trim(),
          status: addTaskColumn,
          priority,
          assignees: selectedAssignees,
          tags: splitTags,
          dueDate
        })
      });

      if (response.ok) {
        setShowAddTaskModal(false);
        addToast(`Milestone card "${title}" appended into board!`, "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Documents updates
  const handleAddDocumentObj = async (title: string, content: string) => {
    if (!activeProject || !title.trim()) return;
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: activeProject.id,
          title: title.trim(),
          content
        })
      });
      if (response.ok) {
        addToast(`Document page "${title}" created.`, "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateDocumentObj = async (docId: string, updates: Partial<NotionDocument>) => {
    try {
      await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteDocumentObj = async (docId: string) => {
    try {
      await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast("Specs page deleted from index.", "success");
    } catch (e) {
      console.error(e);
    }
  };

  // Teams Chats transacting
  const handlePostChatMessageObj = async (teamId: string, text: string) => {
    try {
      await fetch(`/api/teams/${teamId}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTeamObj = async (name: string, description: string, members: string[]) => {
    try {
      await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, members })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateTeamMembersObj = async (teamId: string, members: string[]) => {
    try {
      await fetch(`/api/teams/${teamId}/members`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ members })
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Creational new Project
  const handleCreateProjectSubmit = async (name: string, description: string, deadline: string, visibility: string) => {
    if (!name.trim()) return;
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, deadline, visibility })
      });
      if (res.ok) {
        const item = await res.json();
        setActiveProjectId(item.id);
        setShowAddProjectModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Profile Custom Update
  const handleSaveProfileSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName, avatarUrl: profileAvatar })
      });
      if (response.ok) {
        addToast("User profile configuration synced successfully!", "success");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Dismiss alert notification
  const handleMarkNotifRead = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotifRead = async () => {
    setNotifications([]);
    try {
      await fetch("/api/notifications/read-all", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Add Task Component
  const AddTaskModal = () => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [priority, setPriority] = useState("Medium");
    const [taskAssignees, setTaskAssignees] = useState<string[]>([]);
    const [tagsText, setTagsText] = useState("");
    const [due, setDue] = useState("");

    const handleAssigneeClick = (uid: string) => {
      setTaskAssignees((prev) => 
        prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
      );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-4.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Add Backlog Card ({addTaskColumn})</h4>
            <button onClick={() => setShowAddTaskModal(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">×</button>
          </div>
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Build API endpoint templates"
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
              <textarea
                placeholder="Document active targets or dependencies..."
                rows={3}
                className="w-full text-xs border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Priority</label>
                <select
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Colleague Assignments</label>
              <div className="max-h-24 overflow-y-auto border border-slate-250 p-2 rounded-lg space-y-1.5 bg-slate-50/50">
                {users.map((u) => {
                  const check = taskAssignees.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleAssigneeClick(u.id)}
                      className={`w-full text-xs p-1 px-2.5 rounded flex items-center justify-between hover:bg-white text-left ${check ? "bg-indigo-50 text-indigo-700 font-bold border border-indigo-150" : "text-slate-600 border border-transparent"}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={u.avatarUrl} alt={u.name} className="w-4 h-4 rounded-full border border-slate-100 object-cover" />
                        <span className="truncate">{u.name}</span>
                      </div>
                      {check && <CheckCircle size={12} className="text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tags (Comma parted)</label>
              <input
                type="text"
                placeholder="database, express, critical"
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
              />
            </div>
            <div className="pt-2 flex justify-end gap-3.5">
              <button
                type="button"
                onClick={() => setShowAddTaskModal(false)}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg text-slate-500 font-semibold hover:bg-slate-50 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleCreateTaskSubmit(title, desc, priority, taskAssignees, tagsText, due)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-bold rounded-lg text-xs cursor-pointer"
              >
                Create Backlog Card
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add Project Component
  const AddProjectModal = () => {
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [deadline, setDeadline] = useState("");
    const [visibility, setVisibility] = useState("public");

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Form Project Board</h4>
            <button onClick={() => setShowAddProjectModal(false)} className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer">×</button>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateProjectSubmit(name, desc, deadline, visibility);
            }}
            className="p-5 space-y-4"
          >
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Project Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Beta Customer Portal"
                className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/10 focus:bg-white focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Project Description</label>
              <textarea
                placeholder="Describe scope deadlines or critical metrics..."
                rows={3}
                className="w-full text-xs border border-slate-200 rounded-lg p-3 bg-slate-50/10 focus:bg-white focus:outline-none resize-none"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Deadline Date</label>
                <input
                  type="date"
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Visibility</label>
                <select
                  className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                >
                  <option value="public">Public (Workspace)</option>
                  <option value="private">Private (Invite Only)</option>
                </select>
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Create Board
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // INTERFACE REDIRECT / ROUTER
  // ----------------------------------------------------

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-slate-500 space-y-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono font-bold tracking-wide uppercase">Recovering session buffers...</span>
      </div>
    );
  }

  // Not authenticated? Slide-card registration & login widgets!
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
        
        {/* Floating background blobs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-800/20 overflow-hidden flex flex-col justify-between">
          
          <div className="p-8 text-center space-y-4 border-b border-slate-100">
            <div className="inline-flex p-3 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-150">
              <Layers size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">CollabBoard</h2>
              <p className="text-xs text-slate-400">Pristine Jira, Trello & Notion full-stack workspaces.</p>
            </div>
          </div>

          <div className="p-8">
            {authMode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. pm@collab.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-150 focus:outline-none bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-150 focus:outline-none bg-slate-50/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-xs font-bold transition-all shadow-lg shadow-indigo-100 cursor-pointer"
                >
                  Log In
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">FullName</label>
                  <input
                    type="text"
                    required
                    placeholder="Marcus Aurelius"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-150 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email address</label>
                  <input
                    type="email"
                    required
                    placeholder="pm@collab.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-150 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-150 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">System Role</label>
                  <select
                    className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                  >
                    <option value="Team Member">Team Member (Developer/QA)</option>
                    <option value="Project Manager">Project Manager (Sprints lead)</option>
                    <option value="Admin">Admin (Integrator)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Generate User Account
                </button>
              </form>
            )}

            {/* Account Toggles text */}
            <div className="mt-5 text-center text-xs">
              {authMode === "login" ? (
                <p className="text-slate-500">
                  New on Collab?{" "}
                  <button onClick={() => setAuthMode("register")} className="text-indigo-600 font-bold hover:underline cursor-pointer">
                    Sign Up Free
                  </button>
                </p>
              ) : (
                <p className="text-slate-500">
                  Already have accounts?{" "}
                  <button onClick={() => setAuthMode("login")} className="text-indigo-600 font-bold hover:underline cursor-pointer">
                    Log In
                  </button>
                </p>
              )}
            </div>

            {/* Quick action suggest demo cards */}
            <div className="mt-6 pt-5 border-t border-slate-100 space-y-3.5">
              <div className="flex items-center gap-1.5 justify-center text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">
                <Lock size={10} />
                <span>Instantly explore (Seeded credentials)</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleQuickDemoAccess("admin@collab.com", "admin123")}
                  className="p-2 border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-slate-50/50 text-center transition-all cursor-pointer"
                >
                  <span className="text-[10px] font-black text-slate-700 block">Allison</span>
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Admin</span>
                </button>
                <button
                  onClick={() => handleQuickDemoAccess("pm@collab.com", "pm123")}
                  className="p-2 border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-slate-50/50 text-center transition-all cursor-pointer"
                >
                  <span className="text-[10px] font-black text-slate-700 block">Marcus</span>
                  <span className="text-[8px] text-slate-400 uppercase font-bold">PM</span>
                </button>
                <button
                  onClick={() => handleQuickDemoAccess("tech@collab.com", "tech123")}
                  className="p-2 border border-slate-200 rounded-xl hover:border-indigo-400 hover:bg-slate-50/50 text-center transition-all cursor-pointer"
                >
                  <span className="text-[10px] font-black text-slate-700 block">Dev Joy</span>
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Dev</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch overflow-hidden">
      
      {/* Visual Sliders Toast list */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3 px-4.5 rounded-xl text-xs font-semibold shadow-20 flex items-center justify-between gap-3 animate-fade-in border ${
              t.type === "success" ? "bg-emerald-500 border-emerald-600 text-white" : ""
            } ${
              t.type === "warning" ? "bg-amber-500 border-amber-600 text-white" : ""
            } ${
              t.type === "info" ? "bg-slate-900 border-slate-900 text-white" : ""
            }`}
          >
            <span className="truncate max-w-[250px]">{t.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-white hover:opacity-80 font-bold ml-1 cursor-pointer"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Main Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onLogout={handleLogout}
      />

      {/* Primary content area */}
      <div className="flex-1 flex flex-col overflow-x-hidden h-screen">
        
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          projects={projects}
          activeProject={activeProject}
          onSelectProject={setActiveProjectId}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotifRead}
          onMarkAllNotificationsRead={handleMarkAllNotifRead}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onNavigateToSettings={() => setActiveTab("Settings")}
        />

        {/* Dynamic active screens */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* Quick Info header tags */}
          {activeProject && activeTab !== "Settings" && (
            <div className="flex flex-col sm:flex-row shadow-sm bg-white border border-slate-200 p-4.5 rounded-2xl gap-4 justify-between items-start sm:items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-700">
                  <Briefcase size={16} />
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-800 flex items-center gap-1.5 select-none">
                    <span>{activeProject.name}</span>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">ACTIVE</span>
                  </div>
                  <p className="text-[10.5px] text-slate-400 line-clamp-1">{activeProject.description || "General team assignments"}</p>
                </div>
              </div>

              {/* Deadline & Creational controls */}
              <div className="flex flex-wrap items-center gap-3">
                {activeProject.deadline && (
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50/50 border border-slate-150 rounded-xl p-2 px-3.5 flex items-center gap-1.5">
                    <Calendar size={12} className="text-slate-400" />
                    Target: {activeProject.deadline}
                  </span>
                )}
                
                <button
                  onClick={() => setShowAddProjectModal(true)}
                  className="p-2 px-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 text-slate-500 hover:text-slate-700 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus size={13} /> Project Board
                </button>

                <button
                  onClick={() => {
                    setAddTaskColumn("Todo");
                    setShowAddTaskModal(true);
                  }}
                  className="p-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus size={13} className="text-white" /> Add task
                </button>
              </div>

            </div>
          )}

          {/* ACTIVE GRAPHIC DISPATCH */}
          {!activeProject && activeTab !== "Settings" ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <FolderDot size={32} className="text-slate-300 mb-2 animate-bounce" />
              <div className="font-bold text-xs text-slate-600 mb-1">No Project Board Set Up</div>
              <p className="text-[11px] text-slate-400 mb-3">Begin by forming your initial sprint backlog board</p>
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Create Board +
              </button>
            </div>
          ) : (
            <>
              {activeTab === "Kanban" && activeProject && (
                <KanbanBoard
                  project={activeProject}
                  tasks={tasks}
                  users={users}
                  onTaskClick={setSelectedTask}
                  onAddTask={(col) => {
                    setAddTaskColumn(col);
                    setShowAddTaskModal(true);
                  }}
                  onMoveTask={handleMoveTaskColumn}
                />
              )}

              {activeTab === "Dashboard" && activeProject && (
                <ProjectAnalytics
                  project={activeProject}
                  tasks={tasks}
                  users={users}
                />
              )}

              {activeTab === "Documents" && activeProject && (
                <NotionDoc
                  project={activeProject}
                  documents={documents}
                  onAddDocument={handleAddDocumentObj}
                  onUpdateDocument={handleUpdateDocumentObj}
                  onDeleteDocument={handleDeleteDocumentObj}
                />
              )}

              {activeTab === "Teams" && (
                <TeamManagement
                  teams={teams}
                  users={users}
                  currentUser={currentUser}
                  onPostChatMessage={handlePostChatMessageObj}
                  onCreateTeam={handleCreateTeamObj}
                  onUpdateTeamMembers={handleUpdateTeamMembersObj}
                />
              )}

              {activeTab === "Copilot" && activeProject && (
                <GeminiCopilot
                  project={activeProject}
                  tasks={tasks}
                />
              )}
            </>
          )}

          {activeTab === "Settings" && currentUser && (
            <div className="max-w-xl mx-auto bg-white border border-slate-250 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="pb-3 border-b border-slate-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 font-mono">Stakeholder Configurations</h4>
                <p className="text-[10px] text-slate-400">Manage owner metadata & avatar integrations</p>
              </div>

              <form onSubmit={handleSaveProfileSettings} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email account (Static)</label>
                  <input
                    type="email"
                    disabled
                    className="w-full text-xs border border-slate-205 rounded-lg px-3 py-2 bg-slate-50 cursor-not-allowed text-slate-400"
                    value={currentUser.email}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">FullName</label>
                  <input
                    type="text"
                    required
                    className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Avatar Vector URL</label>
                  <div className="flex gap-3 items-center">
                    <img src={profileAvatar} alt="Vector preview" className="w-12 h-12 rounded-full border bg-slate-100 object-cover" />
                    <input
                      type="text"
                      className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      value={profileAvatar}
                      onChange={(e) => setProfileAvatar(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Workspace role (Static)</label>
                  <div className="text-xs p-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700 font-semibold inline-block uppercase font-mono">
                    {currentUser.role}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>

      </div>

      {/* Creational Dialog popups */}
      {showAddTaskModal && <AddTaskModal />}
      {showAddProjectModal && <AddProjectModal />}

      {/* Visual task popup details inspector */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          users={users}
          onClose={() => setSelectedTask(null)}
          onUpdate={(fields) => handleUpdateTaskFields(selectedTask.id, fields)}
          onDelete={() => handleDeleteTask(selectedTask.id)}
          onAddComment={(text) => handleAddComment(selectedTask.id, text)}
          onUploadAttachment={(file) => handleUploadAttachment(selectedTask.id, file)}
        />
      )}

    </div>
  );
}
