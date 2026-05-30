/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  X, Calendar, AlertCircle, Tag, CheckSquare, Plus, Trash2, 
  Paperclip, MessageSquare, User, Clock, ChevronRight, FileUp
} from "lucide-react";
import { Task, User as UserType, Subtask, Comment } from "../types";

interface TaskModalProps {
  task: Task;
  users: UserType[];
  onClose: () => void;
  onUpdate: (updatedFields: Partial<Task>) => void;
  onDelete: () => void;
  onAddComment: (text: string) => void;
  onUploadAttachment: (file: { name: string; data: string; type: string; size: number }) => void;
}

export default function TaskModal({
  task,
  users,
  onClose,
  onUpdate,
  onDelete,
  onAddComment,
  onUploadAttachment
}: TaskModalProps) {
  const [commentText, setCommentText] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle comment input submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText("");
  };

  // Toggle subtask status
  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    const updatedSubtasks = task.subtasks.map((st) => 
      st.id === subtaskId ? { ...st, completed } : st
    );
    onUpdate({ subtasks: updatedSubtasks });
  };

  // Delete subtask
  const handleSubtaskDelete = (subtaskId: string) => {
    const updatedSubtasks = task.subtasks.filter((st) => st.id !== subtaskId);
    onUpdate({ subtasks: updatedSubtasks });
  };

  // Add new subtask
  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSt: Subtask = {
      id: "sub_" + Math.random().toString(36).substring(2, 9),
      title: newSubtaskTitle.trim(),
      completed: false
    };
    onUpdate({ subtasks: [...(task.subtasks || []), newSt] });
    setNewSubtaskTitle("");
  };

  // Assignee toggles
  const handleAssigneeToggle = (userId: string) => {
    const updatedAssignees = task.assignees.includes(userId)
      ? task.assignees.filter((id) => id !== userId)
      : [...task.assignees, userId];
    onUpdate({ assignees: updatedAssignees });
  };

  // Handle local file selection -> read Base64 -> trigger callback
  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      onUploadAttachment({
        name: file.name,
        data: base64Data,
        type: file.type,
        size: file.size
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Map assignee ids to Users
  const assignedUsers = users.filter((u) => task.assignees.includes(u.id));
  const remainingUsers = users.filter((u) => !task.assignees.includes(u.id));

  // Subtask progress
  const completedSubtasksCount = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalSubtasksCount = task.subtasks?.length || 0;
  const subtaskProgress = totalSubtasksCount > 0 
    ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header toolbar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-1 rounded bg-slate-200 text-slate-700 uppercase font-medium">
              {task.status}
            </span>
            <span className="text-xs font-mono px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-medium">
              {task.id}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this task?")) {
                  onDelete();
                }
              }}
              title="Delete Task"
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Left Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Task Title</label>
              <input
                type="text"
                value={task.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="w-full text-xl font-bold text-slate-800 border-none px-0 py-1 focus:ring-0 focus:outline-none border-b border-transparent hover:border-slate-300 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</label>
              <textarea
                value={task.description}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="No description specified. Click here to add context..."
                rows={4}
                className="w-full text-sm text-slate-600 border border-slate-100 rounded-lg p-3 bg-slate-50/20 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all resize-none"
              />
            </div>

            {/* Subtasks checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare size={16} className="text-slate-500" />
                  <h4 className="text-sm font-semibold text-slate-700">Subtasks & Milestones</h4>
                </div>
                <span className="text-xs font-mono text-slate-500 font-medium">
                  {completedSubtasksCount}/{totalSubtasksCount} ({subtaskProgress}%)
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>

              {/* Subtasks listing */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {task.subtasks?.map((st) => (
                  <div key={st.id} className="group flex items-center justify-between p-2 rounded-lg hover:bg-slate-50/80 transition-all border border-transparent hover:border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer select-none text-sm text-slate-600 flex-1">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={(e) => handleSubtaskToggle(st.id, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 transition-all"
                      />
                      <span className={st.completed ? "line-through text-slate-400" : "text-slate-600"}>
                        {st.title}
                      </span>
                    </label>
                    <button
                      onClick={() => handleSubtaskDelete(st.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Subtask Form */}
              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <input
                  type="text"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a milestone/subtask..."
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-1 text-xs font-semibold cursor-pointer"
                >
                  <Plus size={14} /> Add
                </button>
              </form>
            </div>

            {/* Comment System */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-slate-500" />
                <h4 className="text-sm font-semibold text-slate-700">Team Conversation</h4>
              </div>

              {/* Chat replies */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {task.comments?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">No discussions posted yet. Start the synchronization here!</p>
                ) : (
                  task.comments?.map((com) => (
                    <div key={com.id} className="flex gap-3 text-sm">
                      <img
                        src={com.authorAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(com.authorName)}`}
                        alt={com.authorName}
                        className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50 object-cover mt-0.5"
                      />
                      <div className="flex-1 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 text-xs">{com.authorName}</span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock size={10} />
                            {new Date(com.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed text-wrap">{com.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply field */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Discuss task progress, mention updates..."
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold text-xs cursor-pointer"
                >
                  Send
                </button>
              </form>
            </div>

          </div>

          {/* Right Parameters Sidebar */}
          <div className="space-y-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100 self-start">
            
            {/* Status Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">COLUMN STATUS</label>
              <select
                value={task.status}
                onChange={(e) => onUpdate({ status: e.target.value as any })}
                className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">PRIORITY RATING</label>
              <select
                value={task.priority}
                onChange={(e) => onUpdate({ priority: e.target.value as any })}
                className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Due date input */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">DUE DATE</label>
              <div className="relative">
                <Calendar size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                  onChange={(e) => onUpdate({ dueDate: e.target.value })}
                  className="w-full text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Assignees listing */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">ASSIGNEES ({assignedUsers.length})</label>
              
              {/* Active assignees bubbles */}
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {assignedUsers.length === 0 ? (
                  <span className="text-[11px] text-slate-400 italic">Unassigned</span>
                ) : (
                  assignedUsers.map((u) => (
                    <div key={u.id} className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-0.5 text-xs text-slate-600">
                      <img src={u.avatarUrl} alt={u.name} className="w-4 h-4 rounded-full border border-slate-100 object-cover" />
                      <span className="truncate max-w-[80px]">{u.name.split(" ")[0]}</span>
                      <button onClick={() => handleAssigneeToggle(u.id)} className="hover:text-red-500 ml-0.5 font-bold cursor-pointer">×</button>
                    </div>
                  ))
                )}
              </div>

              {/* Dropdown checklist */}
              <div className="max-h-28 overflow-y-auto border border-slate-200/60 rounded-lg p-1.5 bg-white space-y-1">
                {remainingUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleAssigneeToggle(u.id)}
                    className="w-full flex items-center gap-2 text-left p-1 rounded hover:bg-indigo-50/50 text-slate-600 transition-all text-xs cursor-pointer"
                  >
                    <Plus size={10} className="text-slate-400" />
                    <img src={u.avatarUrl} alt={u.name} className="w-4 h-4 rounded-full border border-slate-100 object-cover" />
                    <span>{u.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Attachments & Files manager */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">ATTACHMENTS & SPEC-FILES</label>
              
              {/* List existing */}
              <div className="space-y-1.5 mb-2.5 max-h-24 overflow-y-auto">
                {task.attachments?.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No attachments</p>
                ) : (
                  task.attachments?.map((at) => (
                    <a
                      key={at.id}
                      href={at.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                    >
                      <span className="flex items-center gap-1.5 truncate max-w-[140px]">
                        <Paperclip size={11} className="text-slate-400" />
                        <span className="truncate">{at.name}</span>
                      </span>
                      <span className="text-[9px] font-mono text-slate-400">
                        {(at.size / 1024).toFixed(0)}kb
                      </span>
                    </a>
                  ))
                )}
              </div>

              {/* Grab drop area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
                  isDragOver ? "border-indigo-600 bg-indigo-50/50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                />
                <FileUp size={16} className="mx-auto text-slate-400 mb-1" />
                <p className="text-[10px] text-slate-500 font-semibold tracking-wide">Drag files here or click to upload</p>
                <p className="text-[8px] text-slate-400 mt-0.5">Supports images, pdfs, layouts</p>
              </div>
            </div>

            {/* Task Activity Logs */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">TASK ACTIVITY FEED</label>
              <div className="max-h-24 overflow-y-auto border border-slate-200/60 rounded-lg p-2 bg-white space-y-2">
                {task.activities?.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic">No recorded logs</p>
                ) : (
                  task.activities?.map((act) => (
                    <div key={act.id} className="text-[10px] text-slate-500 leading-normal border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                      <span className="font-semibold text-slate-700">{act.userName}</span>{" "}
                      {act.action}
                      <div className="text-[8px] font-mono text-slate-400 mt-0.5">
                        {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
