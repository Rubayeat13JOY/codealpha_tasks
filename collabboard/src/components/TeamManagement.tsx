/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { Team, User, ChatMessage } from "../types";
import { 
  Users, MessageSquare, Plus, Send, Shield, UserPlus, 
  Trash2, Mail, ExternalLink, Calendar, Check, Circle 
} from "lucide-react";

interface TeamManagementProps {
  teams: Team[];
  users: User[];
  currentUser: User | null;
  onPostChatMessage: (teamId: string, text: string) => void;
  onCreateTeam: (name: string, description: string, members: string[]) => void;
  onUpdateTeamMembers: (teamId: string, members: string[]) => void;
}

export default function TeamManagement({
  teams,
  users,
  currentUser,
  onPostChatMessage,
  onCreateTeam,
  onUpdateTeamMembers
}: TeamManagementProps) {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Team state
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [teamMembers, setTeamMembers] = useState<string[]>([]);

  // Invite dropdown states
  const [searchEmail, setSearchEmail] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const selectedTeam = teams.find((t) => t.id === selectedTeamId) || teams[0];

  // Set default selected team if none
  useEffect(() => {
    if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Autoscroll chats
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTeam?.chat]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedTeam) return;
    onPostChatMessage(selectedTeam.id, chatInput.trim());
    setChatInput("");
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    
    // Auto-include current user in new team
    const membersList = [...teamMembers];
    if (currentUser && !membersList.includes(currentUser.id)) {
      membersList.push(currentUser.id);
    }

    onCreateTeam(teamName, teamDesc, membersList);
    setTeamName("");
    setTeamDesc("");
    setTeamMembers([]);
    setShowCreateModal(false);
  };

  const toggleInviteMember = (userId: string) => {
    setTeamMembers((prev) => 
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleRemoveMember = (userId: string) => {
    if (!selectedTeam) return;
    if (userId === currentUser?.id) {
      alert("You cannot remove yourself from the team.");
      return;
    }
    const updated = selectedTeam.members.filter((id) => id !== userId);
    onUpdateTeamMembers(selectedTeam.id, updated);
  };

  const handleAddMemberByClick = (userId: string) => {
    if (!selectedTeam) return;
    if (selectedTeam.members.includes(userId)) return;
    const updated = [...selectedTeam.members, userId];
    onUpdateTeamMembers(selectedTeam.id, updated);
  };

  // Lists of users matching various criteria
  const teamUsers = selectedTeam ? users.filter((u) => selectedTeam.members.includes(u.id)) : [];
  const inviteCandidates = selectedTeam ? users.filter((u) => !selectedTeam.members.includes(u.id)) : users;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch h-[72vh]">
      
      {/* Teams listing sidebar panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">Teams Directory</h4>
            <button
              onClick={() => setShowCreateModal(true)}
              className="p-1 px-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus size={12} /> New
            </button>
          </div>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {teams.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No teams formed yet.</p>
            ) : (
              teams.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTeamId(t.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedTeamId === t.id
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100"
                      : "bg-slate-50 border-slate-100 hover:border-slate-300 text-slate-600 hover:bg-slate-100/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={14} className={selectedTeamId === t.id ? "text-white" : "text-indigo-600"} />
                    <span className="font-bold text-xs truncate">{t.name}</span>
                  </div>
                  <p className={`text-[10px] line-clamp-1 truncate ${selectedTeamId === t.id ? "text-indigo-100" : "text-slate-400"}`}>
                    {t.description || "Project collaboration group"}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Global info cards */}
        {selectedTeam && (
          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl space-y-1.5">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Active Workspace</span>
            <div className="font-bold text-xs text-slate-700">{selectedTeam.name}</div>
            <p className="text-[10px] text-slate-500 leading-normal">{selectedTeam.description}</p>
          </div>
        )}

      </div>

      {/* Main live interactive workspace */}
      {selectedTeam ? (
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          
          {/* Chat pane */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <MessageSquare size={16} className="text-indigo-600" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-slate-800">{selectedTeam.name} Live Chat</h4>
                <p className="text-[10px] text-slate-400">Streamed conversations inside team</p>
              </div>
            </div>

            {/* Bubble logs */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
              {selectedTeam.chat?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <span className="text-3xl mb-1">💬</span>
                  <p className="text-xs italic">No messages standard here yet.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Send a message to say hello to the group!</p>
                </div>
              ) : (
                selectedTeam.chat?.map((msg) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex gap-3 text-xs ${isMe ? "flex-row-reverse" : ""}`}>
                      <img
                        src={msg.senderAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(msg.senderName)}`}
                        alt={msg.senderName}
                        className="w-8 h-8 rounded-full border border-slate-100 bg-slate-50 object-cover"
                      />
                      <div className="max-w-[70%]">
                        <div className={`flex items-center gap-1.5 mb-1 ${isMe ? "justify-end" : ""}`}>
                          <span className="font-semibold text-slate-700 text-[10px]">{msg.senderName}</span>
                          <span className="text-[8px] font-mono text-slate-400">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className={`p-3 rounded-2xl border ${
                          isMe 
                            ? "bg-indigo-600 border-indigo-600 text-white rounded-tr-none shadow-sm shadow-indigo-100/50" 
                            : "bg-slate-50 border-slate-100 text-slate-600 rounded-tl-none"
                        }`}>
                          <p className="leading-snug text-wrap">{msg.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Form input messaging */}
            <form onSubmit={handleSendChat} className="p-4 border-t border-slate-100/80 bg-slate-50/50 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={`Message #${selectedTeam.name.toLowerCase()}...`}
                className="flex-1 text-xs border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center cursor-pointer"
              >
                <Send size={15} />
              </button>
            </form>

          </div>

          {/* Members manager column */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between overflow-hidden">
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-150">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 text-wrap">Collaborators ({teamUsers.length})</h4>
              </div>

              {/* Members lists */}
              <div className="space-y-2.5 overflow-y-auto max-h-[30vh] pr-0.5">
                {teamUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-1.5 rounded-lg border border-transparent hover:border-slate-100 hover:bg-slate-50/50 transition-all">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full border border-slate-100 object-cover" />
                        <Circle size={8} className={`absolute -right-0.5 -bottom-0.5 rounded-full ring-2 ring-white ${u.status === "online" ? "fill-emerald-500 stroke-emerald-500" : "fill-slate-300 stroke-slate-300"}`} />
                      </div>
                      <div className="space-y-0.5 max-w-[100px]">
                        <div className="font-bold text-[11px] text-slate-700 truncate select-none">{u.name}</div>
                        <div className="text-[9px] text-slate-400 capitalize">{u.role}</div>
                      </div>
                    </div>
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleRemoveMember(u.id)}
                        className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-all cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Invite candidate area */}
            <div className="pt-4 border-t border-slate-150 space-y-3">
              <div className="space-y-0.5">
                <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Quick Team Invite</h5>
                <p className="text-[9px] text-slate-400 leading-normal">Assign remaining project developers directly</p>
              </div>

              <div className="space-y-1 max-h-32 overflow-y-auto border border-slate-100 p-1.5 rounded-lg bg-slate-50/50">
                {inviteCandidates.length === 0 ? (
                  <p className="text-[10px] text-slate-400 italic text-center py-2">All employees are already on team</p>
                ) : (
                  inviteCandidates.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleAddMemberByClick(u.id)}
                      className="w-full flex items-center justify-between text-left p-1.5 rounded hover:bg-white text-slate-600 transition-all text-[11px] cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img src={u.avatarUrl} alt={u.name} className="w-5 h-5 rounded-full border border-white object-cover" />
                        <span className="truncate">{u.name}</span>
                      </div>
                      <span className="text-[9px] font-bold text-indigo-600 hover:underline">Add +</span>
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>
      ) : (
        <div className="lg:col-span-3 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-400 italic">Form or select an active team to trigger chat panels</p>
        </div>
      )}

      {/* Creational Dialog popup */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Form Collaborative Team</h4>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">×</button>
            </div>
            <form onSubmit={handleCreateTeamSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Team Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Phoenix Innovators"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  placeholder="Describe team mission or project scope..."
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  rows={3}
                  className="w-full text-xs border border-slate-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Members check */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Include Initial Members</label>
                <div className="max-h-24 overflow-y-auto border border-slate-150 p-2 rounded-lg space-y-1.5">
                  {users.filter((u) => u.id !== currentUser?.id).map((u) => {
                    const isSelect = teamMembers.includes(u.id);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleInviteMember(u.id)}
                        className={`w-full flex items-center justify-between p-1.5 rounded text-left text-xs transition-colors cursor-pointer ${
                          isSelect ? "bg-indigo-50 text-indigo-700 font-semibold" : "hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img src={u.avatarUrl} alt={u.name} className="w-4 h-4 rounded-full border border-slate-100 object-cover" />
                          <span>{u.name}</span>
                        </div>
                        {isSelect && <Check size={12} className="text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 border border-slate-200 rounded-lg text-slate-500 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
