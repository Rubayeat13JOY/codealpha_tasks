/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  BarChart2, LayoutGrid, FileText, Users, Sparkles, 
  Settings, FolderKanban, ChevronLeft, ChevronRight, Layers, LogOut 
} from "lucide-react";

export type SidebarTab = "Dashboard" | "Kanban" | "Documents" | "Teams" | "Copilot" | "Settings";

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
  onLogout
}: SidebarProps) {
  
  const MENU_ITEMS = [
    { id: "Dashboard" as SidebarTab, label: "Dashboard Hub", icon: BarChart2, color: "text-blue-500", desc: "Interactive statistics" },
    { id: "Kanban" as SidebarTab, label: "Kanban Board", icon: LayoutGrid, color: "text-indigo-500", desc: "Scrum & Sprint cards" },
    { id: "Documents" as SidebarTab, label: "Notion Documents", icon: FileText, color: "text-emerald-500", desc: "Specs page authoring" },
    { id: "Teams" as SidebarTab, label: "Teams Directory", icon: Users, color: "text-purple-500", desc: "Collaborators & chats" },
    { id: "Copilot" as SidebarTab, label: "Gemini Copilot", icon: Sparkles, color: "text-amber-500", desc: "AI milestone guidance" },
    { id: "Settings" as SidebarTab, label: "Profile Settings", icon: Settings, color: "text-slate-500", desc: "Owner configurations" }
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-50 lg:static flex flex-col bg-white border-r border-slate-200/85 text-slate-500 transition-all duration-300 ${
        isOpen ? "w-64 translate-x-0" : "w-0 lg:w-20 -translate-x-full lg:translate-x-0"
      }`}
    >
      
      {/* Sidebar Brand header logo */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <FolderKanban size={16} />
          </div>
          {isOpen && (
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-slate-800 text-sm tracking-tight">CollabBoard</span>
              <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400 font-bold">Workspace v2.1</span>
            </div>
          )}
        </div>
 
        {/* Small desktop collapse trigger */}
        <button
          onClick={onToggle}
          className="hidden lg:flex p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
        >
          {isOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
        </button>
      </div>
 
      {/* Navigation middle buttons lists */}
      <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
        {MENU_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
 
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                // Auto collapse sidebar on mobile upon navigation click
                if (window.innerWidth < 1024) {
                  onToggle();
                }
              }}
              className={`w-full flex items-center p-3 rounded-xl transition-all text-left relative cursor-pointer group ${
                isActive 
                  ? "bg-indigo-600/10 text-indigo-700" 
                  : "hover:bg-slate-50 hover:text-slate-850"
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <Icon size={16} className={`${isActive ? item.color : "text-slate-400 group-hover:text-slate-600"}`} />
                {isOpen && (
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold tracking-wide ${isActive ? "text-indigo-700" : "text-slate-600"}`}>{item.label}</span>
                    <span className="text-[8px] font-medium text-slate-400 tracking-wider group-hover:text-slate-500 mt-0.5">{item.desc}</span>
                  </div>
                )}
              </div>
 
              {/* Sidebar active item sidebar highlight */}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-l" />
              )}
            </button>
          );
        })}
      </nav>
 
      {/* Footer Log out */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        {isOpen && (
          <div className="px-2 pb-2 text-[10px] text-slate-400 font-medium">
            Project context is synced in real-time.
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all font-semibold text-xs cursor-pointer"
        >
          <LogOut size={13} />
          {isOpen && <span>Secure Logout</span>}
        </button>
      </div>

    </aside>
  );
}
