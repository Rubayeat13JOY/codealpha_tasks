/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Project, Task, User, TaskStatus, TaskPriority 
} from "../types";
import { 
  Plus, Search, UserCheck, Calendar, Filter, ChevronDown, 
  ArrowUpRight, Clock, CheckSquare, MessageSquare, Tag, AlertCircle 
} from "lucide-react";

interface KanbanBoardProps {
  project: Project;
  tasks: Task[];
  users: User[];
  onTaskClick: (task: Task) => void;
  onAddTask: (column: TaskStatus) => void;
  onMoveTask: (taskId: string, targetStatus: TaskStatus) => void;
}

const COLUMNS: { key: TaskStatus; label: string; colorClass: string; bgClass: string; borderClass: string }[] = [
  { key: "Todo", label: "Todo", colorClass: "text-blue-600 bg-blue-50 border-blue-100", bgClass: "bg-slate-50/50", borderClass: "hover:border-slate-300" },
  { key: "In Progress", label: "In Progress", colorClass: "text-amber-600 bg-amber-50 border-amber-100", bgClass: "bg-slate-50/50", borderClass: "hover:border-slate-300" },
  { key: "Review", label: "Review", colorClass: "text-purple-600 bg-purple-50 border-purple-100", bgClass: "bg-slate-50/50", borderClass: "hover:border-slate-300" },
  { key: "Completed", label: "Completed", colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100", bgClass: "bg-slate-50/50", borderClass: "hover:border-slate-300" }
];

const PRIORITY_BADGES: Record<TaskPriority, { text: string; css: string }> = {
  Low: { text: "Low", css: "bg-slate-100 text-slate-700" },
  Medium: { text: "Med", css: "bg-blue-50 text-blue-700" },
  High: { text: "High", css: "bg-amber-50 text-amber-700" },
  Urgent: { text: "Urgent", css: "bg-rose-50 text-rose-700 animate-pulse" }
};

export default function KanbanBoard({
  project,
  tasks,
  users,
  onTaskClick,
  onAddTask,
  onMoveTask
}: KanbanBoardProps) {
  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "All">("All");
  const [assigneeFilter, setAssigneeFilter] = useState<string | "All">("All");

  // Filtering Logic
  const filteredTasks = tasks.filter((t) => {
    const matchesProj = t.projectId === project.id;
    const matchesQuery = t.title.toLowerCase().includes(query.toLowerCase()) || 
                         t.description.toLowerCase().includes(query.toLowerCase()) ||
                         t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()));
    const matchesPriority = priorityFilter === "All" || t.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === "All" || t.assignees.includes(assigneeFilter);
    return matchesProj && matchesQuery && matchesPriority && matchesAssignee;
  });

  // Native HTML5 Drag events
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onMoveTask(taskId, targetStatus);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      
      {/* Board controls search & filters bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-white p-4.5 rounded-2xl border border-slate-200/95 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cards, descriptions, tags..."
            className="w-full text-xs pl-9 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
          />
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Priority filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-slate-400" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center gap-1.5">
            <UserCheck size={13} className="text-slate-400" />
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wide">Assignee:</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 max-w-[150px] cursor-pointer"
            >
              <option value="All">All Members</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* Grid columns container */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start flex-1 min-h-[500px]">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.key);

          return (
            <div
              key={col.key}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.key)}
              className={`flex flex-col max-h-[70vh] rounded-2xl border border-slate-200 p-4.5 min-h-[450px] transition-all ${col.bgClass}`}
            >
              
              {/* Column details header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/70">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${col.colorClass}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {colTasks.length}
                  </span>
                </div>
                
                <button
                  onClick={() => onAddTask(col.key)}
                  className="p-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-400 hover:text-indigo-600 shadow-sm transition-all cursor-pointer"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Cards vertical stack */}
              <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 pb-4">
                {colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-400 bg-white/40">
                    <CheckSquare size={16} className="text-slate-300 mb-1" />
                    <span className="text-[10px] font-medium tracking-wide">Empty Column</span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    // Collect assignees details
                    const taskUsers = users.filter((u) => task.assignees.includes(u.id));
                    const totalSub = task.subtasks?.length || 0;
                    const compSub = task.subtasks?.filter((s) => s.completed).length || 0;
                    
                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onTaskClick(task)}
                        className="group bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-400 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 duration-300"
                      >
                        
                        {/* priority & issue info */}
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-[9px] font-mono font-medium px-1.5 py-0.5 rounded ${PRIORITY_BADGES[task.priority].css}`}>
                            {PRIORITY_BADGES[task.priority].text}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 font-semibold uppercase">
                            {task.id}
                          </span>
                        </div>

                        {/* Card body title & text */}
                        <h4 className="text-xs font-bold text-slate-800 line-clamp-2 md:leading-normal group-hover:text-indigo-600 transition-colors mb-1.5">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-[10px] text-slate-500 line-clamp-2 mb-3">
                            {task.description}
                          </p>
                        )}

                        {/* Interactive metadata footer */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100/80">
                          
                          {/* Calendar & subtasks */}
                          <div className="flex items-center gap-2.5 text-[10px] font-mono font-medium text-slate-400">
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Calendar size={10} className="text-slate-400" />
                                {task.dueDate.split("-").slice(1).join("/")}
                              </span>
                            )}
                            {totalSub > 0 && (
                              <span className="flex items-center gap-1 text-slate-400 font-semibold bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                                <CheckSquare size={10} className="text-indigo-500" />
                                {compSub}/{totalSub}
                              </span>
                            )}
                            {task.comments?.length > 0 && (
                              <span className="flex items-center gap-0.5">
                                <MessageSquare size={10} />
                                {task.comments.length}
                              </span>
                            )}
                          </div>

                          {/* Member icons pile */}
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {taskUsers.slice(0, 3).map((u) => (
                              <img
                                key={u.id}
                                src={u.avatarUrl}
                                alt={u.name}
                                title={u.name}
                                className="inline-block w-4.5 h-4.5 rounded-full ring-2 ring-white border border-slate-100 object-cover"
                              />
                            ))}
                            {taskUsers.length > 3 && (
                              <span className="inline-flex items-center justify-center w-4.5 h-4.5 text-[8px] font-bold text-slate-500 bg-slate-100 rounded-full ring-2 ring-white border border-slate-200">
                                +{taskUsers.length - 3}
                              </span>
                            )}
                          </div>

                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
