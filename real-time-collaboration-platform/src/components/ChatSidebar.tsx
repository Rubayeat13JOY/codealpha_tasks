import React, { useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { MessageSquare, Users, Send, Paperclip, Download, ShieldCheck, UserMinus } from 'lucide-react';
import { ChatMessage, ParticipantModel, SharedFile } from '../types';
import { formatBytes } from '../utils';

interface ChatSidebarProps {
  socket: Socket | null;
  roomId: string;
  token: string;
  userId: string;
  userName: string;
  participants: ParticipantModel[];
  onKickParticipant: (socketId: string) => void;
  isHost: boolean;
}

export default function ChatSidebar({
  socket,
  roomId,
  token,
  userId,
  userName,
  participants,
  onKickParticipant,
  isHost
}: {
  socket: Socket | null;
  roomId: string;
  token: string;
  userId: string;
  userName: string;
  participants: ParticipantModel[];
  onKickParticipant: (socketId: string) => void;
  isHost: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'chat' | 'users'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  
  // File drag states
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Typing indicators trace
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimer = useRef<NodeJS.Timeout | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to bottom helper
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Socket communication listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('chat-message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('typing', (data: { name: string; isTyping: boolean }) => {
      setTypingUsers(prev => {
        if (data.isTyping) {
          if (prev.includes(data.name)) return prev;
          return [...prev, data.name];
        } else {
          return prev.filter(n => n !== data.name);
        }
      });
    });

    return () => {
      socket.off('chat-message');
      socket.off('typing');
    };
  }, [socket]);

  // Emit typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket) return;

    socket.emit('typing', { roomId, userId, name: userName, isTyping: true });

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { roomId, userId, name: userName, isTyping: false });
    }, 1500);
  };

  // Chat message submit
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: userId,
      senderName: userName,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Emit to socket members
    if (socket) {
      socket.emit('chat-message', { roomId, message: newMsg });
    }

    // Add locally immediately
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    if (socket) {
      socket.emit('typing', { roomId, userId, name: userName, isTyping: false });
    }
  };

  // Secure AES encrypted files uploads
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Automatically broadcast newly shared file info inside the room chat
      const fileMsg: ChatMessage = {
        id: crypto.randomUUID(),
        senderId: userId,
        senderName: userName,
        text: `Shared a secure encrypted file: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        file: data.file
      };

      if (socket) {
        socket.emit('chat-message', { roomId, message: fileMsg });
      }

      setMessages(prev => [...prev, fileMsg]);
    } catch (err: any) {
      console.error(err);
      alert('Secure File Upload failed. Limit size 25MB.');
    } finally {
      setUploading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent border-l border-white/10 font-sans shadow-xl">
      {/* Sidebar Tabs */}
      <div className="flex border-b border-white/10 p-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-indigo-650 text-white shadow-md shadow-indigo-650/25 border border-indigo-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <MessageSquare size={14} />
          <span>Meeting Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-indigo-650 text-white shadow-md shadow-indigo-650/25 border border-indigo-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Users size={14} />
          <span>Members ({participants.length + 1})</span>
        </button>
      </div>

      {/* TAB 1: REAL-TIME CHAT & ENCRYPTED FILE SYSTEM */}
      {activeTab === 'chat' && (
        <div
          className={`flex-grow flex flex-col overflow-hidden relative ${
            dragActive ? 'bg-indigo-600/5 border-2 border-dashed border-indigo-500/50' : ''
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          {/* Chat history list */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <MessageSquare size={32} className="opacity-30 mb-2" />
                <p className="text-xs">No messages yet in this room.</p>
                <p className="text-[10px] text-slate-600 mt-1">Both chat and files are secured by end-to-end transport encryption.</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMe = msg.senderId === userId;
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline gap-1.5 mb-1 text-[11px] text-slate-400 font-medium">
                      <span>{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    {msg.file ? (
                      /* Render AES Shared File item template */
                      <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-sm max-w-[90%] flex flex-col gap-2 font-sans backdrop-blur-sm animate-fade-in">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-xl border border-indigo-500/10">
                            <Paperclip size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate max-w-[160px]" title={msg.file.name}>
                              {msg.file.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{formatBytes(msg.file.size)}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-2 mt-1">
                          <span className="text-[10px] font-semibold text-emerald-455 flex items-center gap-1 font-mono uppercase tracking-wide">
                            <ShieldCheck size={11} />
                            <span>AES Encrypted</span>
                          </span>
                          <a
                            href={`/api/files/download/${msg.file.id}?name=${encodeURIComponent(msg.file.name)}`}
                            download
                            className="bg-indigo-650 hover:bg-indigo-600 text-white rounded-xl p-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all border border-indigo-500/20 shadow-sm shadow-indigo-650/15"
                            title="Securely decrypt and download file"
                          >
                            <Download size={13} />
                          </a>
                        </div>
                      </div>
                    ) : (
                      /* Plain text chat bubble */
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-xs max-w-[85%] select-text leading-relaxed font-sans shadow-sm animate-fade-in ${
                          isMe
                            ? 'bg-indigo-650 text-white rounded-tr-sm border border-indigo-500/20'
                            : 'bg-white/5 text-slate-200 rounded-tl-sm border border-white/10'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Live Typing element */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-slate-400 text-[10px] font-medium font-sans">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span>{typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Secure file uploading progress banner */}
          {uploading && (
            <div className="px-4 py-2 bg-indigo-500/10 border-t border-b border-indigo-500/15 flex items-center justify-between text-xs text-indigo-400 animate-pulse font-mono">
              <span>Encrypting & uploading attachment...</span>
              <span className="w-4 h-4 border-2 border-indigo-400/40 border-t-indigo-400 rounded-full animate-spin" />
            </div>
          )}          {/* Chat input deck */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 flex items-center gap-2 relative bg-transparent backdrop-blur-md">
            {/* hidden secure input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={triggerFileInput}
              className="p-2.5 bg-white/5 text-slate-405 hover:text-slate-205 rounded-xl hover:bg-white/10 transition-all cursor-pointer border border-white/10"
              title="Upload encrypted document (25MB max)"
            >
              <Paperclip size={16} />
            </button>

            <input
              type="text"
              required
              value={inputText}
              onChange={handleInputChange}
              placeholder="Type secure connection message..."
              className="flex-grow px-3.5 py-2.5 bg-white/5 border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-505 focus:ring-1 focus:ring-indigo-500 text-xs rounded-xl backdrop-blur-sm"
            />

            <button
              type="submit"
              className="p-2.5 bg-indigo-650 hover:bg-indigo-600 active:scale-95 text-white rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer transition-all flex items-center justify-center border border-indigo-500/20"
              title="Send"
            >
              <Send size={15} />
            </button>
          </form>

          {/* Drag overlay feedback label */}
          {dragActive && (
            <div className="absolute inset-0 bg-[#0c0e15]/85 backdrop-blur-md pointer-events-none flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-500/30 rounded-2xl m-2 animate-fade-in">
              <Paperclip size={40} className="text-indigo-400 mb-2 animate-bounce" />
              <p className="text-sm font-bold text-white mb-0.5">Drop file anywhere</p>
              <p className="text-xs text-slate-400">Secure AES-256 upload encryption activated</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE ROOM PEERS LIST */}
      {activeTab === 'users' && (
        <div className="flex-grow p-4 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
            <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Active Attendees</span>
            <span className="text-xs text-slate-350 font-mono font-bold bg-white/5 px-2.5 py-0.5 rounded-xl border border-white/10 shadow-sm">
              {participants.length + 1}
            </span>
          </div>

          {/* Render local creator/viewer */}
          <div className="flex items-center justify-between p-3 flex-wrap bg-white/5 rounded-2xl border border-white/10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-650 text-white font-bold text-xs flex items-center justify-center border border-white/20 shadow-md shadow-indigo-655/10">
                ME
              </div>
              <div>
                <p className="text-xs font-semibold text-white truncate max-w-[150px]">{userName}</p>
                <p className="text-[10px] text-indigo-400 font-mono mt-0.5">Session Creator</p>
              </div>
            </div>
            {isHost && (
              <span className="text-[9px] bg-amber-500/15 text-amber-300 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border border-amber-500/20">
                Host
              </span>
            )}
          </div>

          {/* Render peers */}
          {participants.map(p => {
            const initial = p.name[0]?.toUpperCase() || 'U';
            return (
              <div key={p.socketId} className="flex items-center justify-between p-3 flex-wrap bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 text-slate-300 font-bold text-xs flex items-center justify-center border border-white/10">
                    {initial}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 truncate max-w-[150px] block">{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">WebRTC Connection Live</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {p.isHost && (
                    <span className="text-[9px] bg-amber-500/15 text-amber-300 font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border border-amber-500/20">
                      Host
                    </span>
                  )}

                  {isHost && !p.isHost && (
                    <button
                      onClick={() => onKickParticipant(p.socketId)}
                      className="p-1.5 text-rose-455 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/10 hover:border-transparent rounded-xl transition-all cursor-pointer shadow-sm"
                      title="Kick attendee from meeting"
                    >
                      <UserMinus size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
