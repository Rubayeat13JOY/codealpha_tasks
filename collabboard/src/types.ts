/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = "Admin" | "Project Manager" | "Team Member";

export interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  projectId?: string;
  taskId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: "online" | "offline";
  activity: UserActivity[];
  createdAt: string;
}

export type ProjectStatus = "Planning" | "Active" | "Completed" | "Archived";

export interface Project {
  id: string;
  name: string;
  description: string;
  deadline: string;
  status: ProjectStatus;
  visibility: "public" | "private";
  members: string[]; // User IDs
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  members: string[]; // User IDs
  chat: ChatMessage[];
  createdAt: string;
}

export type TaskStatus = "Todo" | "In Progress" | "Review" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface TaskActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignees: string[]; // User IDs
  tags: string[];
  subtasks: Subtask[];
  attachments: Attachment[];
  comments: Comment[];
  activities: TaskActivity[];
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: "task_assigned" | "due_date" | "mention" | "general" | "chat";
  projectId?: string;
  taskId?: string;
  createdAt: string;
}

export interface NotionDocument {
  id: string;
  projectId: string;
  title: string;
  content: string; // Markdown or raw text content
  lastEditedBy: string; // User ID
  lastEditedByName: string;
  lastEditedAt: string;
}
