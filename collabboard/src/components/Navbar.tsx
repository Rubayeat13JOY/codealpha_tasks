/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Project, User, Notification } from "../types";
import { 
  Bell, ChevronDown, LogOut, Settings, Layers, Folder, 
  HelpCircle, User as UserIcon, Search, Menu, CheckSquare, Sparkles 
} from "lucide-react";

interface NavbarProps {
  currentUser: User | null;
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (projId: string) => void;
  notifications: Notification[];
  onMarkNotificationRead: (notifId: string) => void;
  onMarkAllNotificationsRead: () => void;
  onLogout: () => void;
  onToggleSidebar: () => void;
  onNavigateToSettings: () => void;
}

export default function Navbar({
  currentUser,
  projects,
  activeProject,
  onSelectProject,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onLogout,
  onToggleSidebar,
  onNavigateToSettings
}: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between shadow-sm backdrop-blur-md bg-white/95">
      
      {/* Left Project Toggle Header */}
      <div className="flex items-center gap-4">
        
        {/* Toggle burger on mobile */}
        <button
          onClick={onToggleSidebar}
          className="p-1 px-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 lg:hidden transition-all cursor-pointer"
        >
          <Menu size={16} />
        </button>

        {/* Project workspace switcher combo dropdown */}
        <div className="relative flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
            <Layers size={16} />
          </div>
          
          <div className="flex flex-col text-left">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Workspace scope</span>
            <div className="flex items-center gap-1.5 group cursor-pointer select-none">
              <select
                value={activeProject?.id || ""}
                onChange={(e) => onSelectProject(e.target.value)}
                className="text-xs font-black text-slate-700 bg-transparent border-none p-0 pr-6 focus:ring-0 focus:outline-none cursor-pointer hover:text-indigo-600 transition-colors"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id} className="font-semibold text-slate-700 bg-white">
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Right controls panel */}
      <div className="flex items-center gap-4">
        
        {/* Alerts bell notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifMenu(!showNotifMenu);
              setShowUserMenu(false);
            }}
            className={`p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer relative ${
              unreadCount > 0 ? "bg-slate-50/50" : ""
            }`}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-mono font-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel Box */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-slate-100">
              
              <div className="p-3.5 bg-slate-50/50 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      onMarkAllNotificationsRead();
                      setShowNotifMenu(false);
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs italic">
                    All caught up! No new notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        onMarkNotificationRead(notif.id);
                        setShowNotifMenu(false);
                      }}
                      className="p-3 hover:bg-slate-50 transition-all text-left text-xs cursor-pointer flex items-start gap-2.5"
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.type === "task_assigned" && <CheckSquare size={13} className="text-blue-500" />}
                        {notif.type === "chat" && <Bell size={13} className="text-indigo-500" />}
                        {notif.type === "mention" && <Sparkles size={13} className="text-amber-500 animate-pulse" />}
                        {notif.type === "general" && <Bell size={13} className="text-slate-500" />}
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="font-bold text-slate-700 truncate">{notif.title}</div>
                        <p className="text-slate-500 text-[10.5px] leading-tight text-wrap">{notif.message}</p>
                        <span className="text-[8px] font-mono text-slate-400 block pt-0.5">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>

        {/* User control bubble */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifMenu(false);
              }}
              className="flex items-center gap-2.5 p-1.5 pl-3 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer text-left select-none bg-slate-50/10"
            >
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-bold text-slate-700 leading-none">{currentUser.name}</span>
                <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider mt-0.5 font-bold">
                  {currentUser.role}
                </span>
              </div>
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full border border-white shadow-sm object-cover"
              />
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {/* User Dropdown Box */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in divide-y divide-slate-100">
                <div className="p-3 bg-slate-50/50 flex flex-col">
                  <span className="font-bold text-xs text-slate-700 truncate select-none">{currentUser.name}</span>
                  <span className="text-[10px] text-slate-400 truncate select-none">{currentUser.email}</span>
                </div>
                
                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => {
                      onNavigateToSettings();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 text-left p-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all text-xs cursor-pointer font-medium"
                  >
                    <Settings size={14} className="text-slate-400" />
                    UserProfile Settings
                  </button>
                </div>

                <div className="p-1.5">
                  <button
                    onClick={() => {
                      onLogout();
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 text-left p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-all text-xs cursor-pointer font-bold"
                  >
                    <LogOut size={14} className="text-rose-400" />
                    Secure Logout
                  </button>
                </div>

              </div>
            )}
          </div>
        )}

      </div>

    </header>
  );
}
