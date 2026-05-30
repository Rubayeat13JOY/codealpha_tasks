import React, { useState } from 'react';
import { Video, Keyboard, Shield, Settings, Users, LogIn, ArrowRight, ShieldAlert } from 'lucide-react';

interface MeetingLobbyProps {
  token: string;
  userName: string;
  onJoinSuccess: (roomDetails: { roomId: string; name: string; isHost: boolean }) => void;
  onLogout: () => void;
}

export default function MeetingLobby({ token, userName, onJoinSuccess, onLogout }: MeetingLobbyProps) {
  // Creating States
  const [createName, setCreateName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [waitingRoom, setWaitingRoom] = useState(false);
  
  // Joining States
  const [joinCode, setJoinCode] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [passwordRequired, setPasswordRequired] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: createName.trim() || undefined,
          password: createPassword || undefined,
          waitingRoom
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      // Automatically join newly created room
      onJoinSuccess({
        roomId: data.roomId,
        name: data.name,
        isHost: true
      });
    } catch (err: any) {
      setError(err.message || 'Room creation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!joinCode) {
      setError('Please enter a valid room code');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/rooms/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: joinCode.trim().toLowerCase(),
          password: joinPassword || undefined
        })
      });

      const data = await response.json();

      if (response.status === 401 && data.isPasswordNeeded) {
        setPasswordRequired(true);
        setError('Password protected meeting. Please provide the room key.');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to join room');
      }

      onJoinSuccess({
        roomId: data.roomId,
        name: data.name,
        isHost: data.isHost
      });
    } catch (err: any) {
      setError(err.message || 'Room validation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10 font-sans p-4">
      {/* Decorative center orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* LEFT: CREATE MEETING */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-white/5 rounded-xl text-indigo-400 border border-white/10 shadow-inner">
            <Video size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Create a Meeting</h3>
            <p className="text-xs text-slate-400">Generate a secure room instantly</p>
          </div>
        </div>

        <form onSubmit={handleCreateRoom} className="space-y-4 flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wide mb-1.5">Meeting Name</label>
              <input
                type="text"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                placeholder="Ex. Marketing Standup"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Shield size={12} className="text-emerald-400" />
                <span>Room Password (Optional)</span>
              </label>
              <input
                type="password"
                value={createPassword}
                onChange={e => setCreatePassword(e.target.value)}
                placeholder="Add gate password"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all text-sm backdrop-blur-sm"
              />
            </div>

            <div className="flex items-center gap-2.5 py-1">
              <input
                type="checkbox"
                id="waitingRoom"
                checked={waitingRoom}
                onChange={e => setWaitingRoom(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-650 bg-white/5 border-white/10 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="waitingRoom" className="text-xs text-slate-400 font-medium cursor-pointer flex items-center gap-1.5 selection:bg-transparent">
                <Users size={13} className="text-sky-450" />
                <span>Enable Host Controls Lobby</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-indigo-650 hover:bg-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm border border-indigo-500/20"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Launch New Meeting</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* RIGHT: JOIN MEETING */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-white/5 rounded-xl text-emerald-450 border border-white/10 shadow-inner">
            <Keyboard size={22} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Join Meeting</h3>
            <p className="text-xs text-slate-400">Enter code to enter the space</p>
          </div>
        </div>

        <form onSubmit={handleJoinRoom} className="space-y-4 flex-grow flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-405 uppercase tracking-wide mb-1.5">Meeting Code</label>
              <input
                type="text"
                required
                value={joinCode}
                onChange={e => {
                  setJoinCode(e.target.value);
                  setPasswordRequired(false);
                }}
                placeholder="Ex. a1b2c3d4"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all font-mono tracking-wider text-sm backdrop-blur-sm"
              />
            </div>

            {passwordRequired && (
              <div className="animate-fade-in space-y-1.5">
                <label className="block text-xs font-semibold text-red-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                  <ShieldAlert size={12} />
                  <span>Room is Password Protected</span>
                </label>
                <input
                  type="password"
                  required
                  value={joinPassword}
                  onChange={e => setJoinPassword(e.target.value)}
                  placeholder="Enter meeting key"
                  className="w-full px-4 py-2.5 bg-white/5 border border-red-500/30 rounded-xl text-red-200 placeholder-slate-555 focus:outline-none focus:border-red-500 transition-all text-sm backdrop-blur-sm"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-emerald-650 hover:bg-emerald-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer text-sm border border-emerald-500/20"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Enter Meeting Ready Room</span>
                <LogIn size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Shared central messaging / logout bar */}
      <div className="col-span-1 md:col-span-2 flex flex-col sm:flex-row items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mt-1 shadow-md">
        <div className="flex items-center gap-3 mb-3 sm:mb-0">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-slate-400">
            Logged in as <strong className="text-slate-200 font-semibold">{userName}</strong>
          </span>
        </div>
        <button
          onClick={onLogout}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold tracking-wide border border-rose-500/20 hover:border-rose-500/40 px-3.5 py-1.5 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 cursor-pointer transition-all focus:outline-none shadow-sm"
        >
          Disconnect Account
        </button>
      </div>

      {error && (
        <div className="col-span-1 md:col-span-2 text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-sans">
          {error}
        </div>
      )}
    </div>
  );
}
