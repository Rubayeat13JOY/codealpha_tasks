/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Task, Project, User } from "../types";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { 
  CheckCircle, Briefcase, Flame, Users, Calendar, TrendingUp 
} from "lucide-react";

interface ProjectAnalyticsProps {
  project: Project;
  tasks: Task[];
  users: User[];
}

const COLORS = ["#3b82f6", "#f59e0b", "#a855f7", "#10b981", "#ef4444"];

export default function ProjectAnalytics({
  project,
  tasks,
  users
}: ProjectAnalyticsProps) {
  const projectTasks = tasks.filter((t) => t.projectId === project.id);

  // 1. Calculations
  const totalTasks = projectTasks.length;
  const completedTasks = projectTasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = projectTasks.filter((t) => t.status === "In Progress").length;
  const reviewTasks = projectTasks.filter((t) => t.status === "Review").length;
  const todoTasks = projectTasks.filter((t) => t.status === "Todo").length;

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const urgentCount = projectTasks.filter((t) => t.priority === "Urgent").length;
  const activeBlockers = projectTasks.filter((t) => t.priority === "Urgent" && t.status !== "Completed").length;
  
  const teamMembersCount = project.members?.length || 0;

  // 2. Data format for Column Status BarChart
  const statusData = [
    { name: "Todo", "Tasks Count": todoTasks, fill: "#3b82f6" },
    { name: "In Progress", "Tasks Count": inProgressTasks, fill: "#f59e0b" },
    { name: "Review", "Tasks Count": reviewTasks, fill: "#a855f7" },
    { name: "Completed", "Tasks Count": completedTasks, fill: "#10b981" }
  ];

  // 3. Data format for Priority Distributions PieChart
  const lowCount = projectTasks.filter((t) => t.priority === "Low").length;
  const mediumCount = projectTasks.filter((t) => t.priority === "Medium").length;
  const highCount = projectTasks.filter((t) => t.priority === "High").length;

  const priorityData = [
    { name: "Urgent", value: urgentCount },
    { name: "High", value: highCount },
    { name: "Medium", value: mediumCount },
    { name: "Low", value: lowCount }
  ].filter((item) => item.value > 0);

  // 4. Productivity / Completion Trend mock
  const trendData = [
    { week: "Wk 21", Completed: Math.round(completedTasks * 0.2), Total: Math.round(totalTasks * 0.6) },
    { week: "Wk 22", Completed: Math.round(completedTasks * 0.4), Total: Math.round(totalTasks * 0.8) },
    { week: "Wk 23", Completed: Math.round(completedTasks * 0.7), Total: totalTasks },
    { week: "Wk 24", Completed: completedTasks, Total: totalTasks }
  ];

  return (
    <div className="grid grid-cols-12 gap-5">
      
      {/* 1. Completion Rate Card (takes 3 columns) */}
      <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between transition-all hover:shadow-md duration-300 min-h-[160px]">
        <div className="flex items-center justify-between pointer-events-none select-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Completion Rate</span>
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={18} />
          </div>
        </div>
        <div className="my-2">
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{completionPercentage}%</div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            {completedTasks} of {totalTasks} milestones completed
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      </div>

      {/* 2. Total Project Cards Card (takes 3 columns) */}
      <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between transition-all hover:shadow-md duration-300 min-h-[160px]">
        <div className="flex items-center justify-between pointer-events-none select-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Project Cards</span>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Briefcase size={18} />
          </div>
        </div>
        <div className="my-2">
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{totalTasks}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            {inProgressTasks} in progress, {reviewTasks} in review
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? ((inProgressTasks + reviewTasks) / totalTasks) * 100 : 0}%` }}></div>
        </div>
      </div>

      {/* 3. Roadblocks Card (takes 3 columns) */}
      <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between transition-all hover:shadow-md duration-300 min-h-[160px]">
        <div className="flex items-center justify-between pointer-events-none select-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Roadblocks</span>
          <div className={`p-2 rounded-xl ${activeBlockers > 0 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-100 text-slate-500"}`}>
            <Flame size={18} />
          </div>
        </div>
        <div className="my-2">
          <div className={`text-3xl font-extrabold tracking-tight ${activeBlockers > 0 ? "text-rose-600" : "text-slate-800"}`}>
            {activeBlockers}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Uncompleted urgent priority issues
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
          <div className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${totalTasks > 0 ? (activeBlockers / totalTasks) * 100 : 0}%` }}></div>
        </div>
      </div>

      {/* 4. Active Collaborators Card (takes 3 columns) */}
      <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between transition-all hover:shadow-md duration-300 min-h-[160px]">
        <div className="flex items-center justify-between pointer-events-none select-none">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Collaborators</span>
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={18} />
          </div>
        </div>
        <div className="my-2">
          <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{teamMembersCount}</div>
          <div className="text-[10px] text-slate-400 font-medium mt-1">
            Assigned developers on board scope
          </div>
        </div>
        <div className="flex -space-x-1.5 overflow-hidden mt-1 select-none">
          {project.members && users.filter(u => project.members.includes(u.id)).slice(0, 5).map((u) => (
            <img key={u.id} className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover border border-slate-100" src={u.avatarUrl} alt={u.name} />
          ))}
          {project.members && project.members.length > 5 && (
            <div className="inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white bg-slate-100 text-[9px] font-bold text-slate-500 border border-slate-200">
              +{project.members.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* State counts Bar Chart (takes 8 columns) */}
      <div className="col-span-12 lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between pointer-events-none select-none">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-750">Workflow Column Counts</h4>
          <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wide">Updated - Realtime</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1e293b", borderRadius: "10px", border: "0", color: "#fff", padding: "8px 12px" }}
                labelStyle={{ fontWeight: "bold", fontSize: "11px", color: "#94a3b8" }}
                itemStyle={{ fontSize: "12px", color: "#fff" }}
              />
              <Bar dataKey="Tasks Count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority distributions Pie Chart (takes 4 columns) */}
      <div className="col-span-12 lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
        <div className="pointer-events-none select-none">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-755">Priority Allocation</h4>
          <p className="text-[10px] text-slate-400">Distribution of backlogs by severity value</p>
        </div>
        
        <div className="h-40 relative flex items-center justify-center">
          {priorityData.length === 0 ? (
            <span className="text-xs text-slate-400 italic">No tasks logged in board</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderRadius: "8px", border: "0", color: "#fff", padding: "6px 10px" }}
                  itemStyle={{ fontSize: "11px", color: "#fff" }}
                />
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
          
          {/* Center label */}
          {totalTasks > 0 && (
            <div className="absolute text-center select-none pointer-events-none">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total</span>
              <div className="text-2xl font-extrabold text-slate-800 tracking-tight">{totalTasks}</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-600 font-medium">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
            <span className="truncate">Urgent ({urgentCount})</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
            <span className="truncate">High ({highCount})</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#a855f7]" />
            <span className="truncate">Med ({mediumCount})</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
            <span className="truncate">Low ({lowCount})</span>
          </div>
        </div>
      </div>

      {/* Progress trend mapping Area Chart (takes 12 columns) */}
      <div className="col-span-12 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 select-none pointer-events-none">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-750">Historical Scope Burnup</h4>
            <p className="text-[10px] text-slate-400">Charting completed milestones relative to overall sprint backlog</p>
          </div>
          <span className="text-[10px] font-bold uppercase text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg">
            <TrendingUp size={12} />
            +18% Velocity
          </span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.08}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", borderRadius: "10px", border: "0", color: "#fff", padding: "8px 12px" }}
              />
              <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
              <Area type="monotone" dataKey="Completed" stroke="#10b981" fillOpacity={1} fill="url(#colorComp)" strokeWidth={2} />
              <Area type="monotone" dataKey="Total" stroke="#6366f1" fillOpacity={1} fill="url(#colorTot)" strokeWidth={1} strokeDasharray="4 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
