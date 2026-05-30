import { useRef, useEffect } from 'react';
import { Mic, MicOff, Video, VideoOff, ScreenShare, ScreenShareOff, LogOut, Lock, Unlock, Users, Trash } from 'lucide-react';
import { ParticipantModel } from '../types';

interface VideoGridProps {
  participants: ParticipantModel[];
  localStream: MediaStream | null;
  isAudioMuted: boolean;
  isCamOff: boolean;
  isSharingScreen: boolean;
  roomName: string;
  roomId: string;
  isHost: boolean;
  isLocked: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onLeaveMeeting: () => void;
  onToggleLock: () => void;
  onKickParticipant: (socketId: string) => void;
}

// Sub-component to attach and render streams cleanly
function VideoStreamPlayer({
  stream,
  name,
  isLocal,
  isMuted,
  isCameraOff,
  isHostUser
}: {
  stream: MediaStream | null;
  name: string;
  isLocal: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  isHostUser?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="relative w-full h-full bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-lg group backdrop-blur-sm">
      {isCameraOff || !stream ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent select-none">
          <div className="w-16 h-16 rounded-full bg-indigo-650 text-white font-bold text-lg flex items-center justify-center border border-white/20 shadow-lg mb-2 shadow-indigo-500/20">
            {initials || 'P'}
          </div>
          <span className="text-xs font-semibold text-slate-300">{name} {isLocal && '(You)'}</span>
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover rounded-2xl bg-slate-950/40"
        />
      )}

      {/* Media Overlay Badges */}
      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-xl text-[11px] font-semibold text-white flex items-center gap-1.5 border border-white/10 max-w-[85%] truncate shadow-md">
        {isLocal && <span className="text-indigo-400">You:</span>}
        <span className="truncate">{name}</span>
        {isHostUser && <span className="bg-amber-500/20 border border-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 rounded-lg">Host</span>}
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none">
        {isMuted && (
          <div className="p-1.5 bg-rose-600/90 text-white rounded-xl shadow-md border border-white/10 backdrop-blur-sm">
            <MicOff size={11} />
          </div>
        )}
        {isCameraOff && (
          <div className="p-1.5 bg-rose-600/90 text-white rounded-xl shadow-md border border-white/10 backdrop-blur-sm">
            <VideoOff size={11} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoGrid({
  participants,
  localStream,
  isAudioMuted,
  isCamOff,
  isSharingScreen,
  roomName,
  roomId,
  isHost,
  isLocked,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onLeaveMeeting,
  onToggleLock,
  onKickParticipant,
}: VideoGridProps) {
  
  // Decide screen grid density mapping
  const totalStreams = (localStream ? 1 : 0) + participants.length;

  const getGridClass = () => {
    if (totalStreams <= 1) return 'grid-cols-1';
    if (totalStreams === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (totalStreams <= 4) return 'grid-cols-2';
    return 'grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden relative font-sans">
      {/* Top Banner Header Info */}
      <div className="flex items-center justify-between px-6 py-4 bg-white/5 border-b border-white/10 backdrop-blur-md">
        <div>
          <h2 className="text-base font-bold text-white tracking-wide">{roomName}</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5 select-all">
            <span>Code: <strong className="text-indigo-400">{roomId}</strong></span>
          </div>
        </div>

        {/* Status markers & Host controllers */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold bg-white/5 px-2.5 py-1 rounded-xl border border-white/10 backdrop-blur-sm">
            <Users size={12} />
            <span>{totalStreams} Active</span>
          </div>

          {isHost && (
            <button
              onClick={onToggleLock}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer backdrop-blur-md shadow-sm ${
                isLocked
                  ? 'bg-rose-500/15 text-rose-400 border-rose-500/20 hover:bg-rose-500/25'
                  : 'bg-emerald-500/15 text-emerald-450 border-emerald-500/20 hover:bg-emerald-500/25'
              }`}
            >
              {isLocked ? <Lock size={12} /> : <Unlock size={12} />}
              <span>{isLocked ? 'Room Locked' : 'Room Public'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid conference display */}
      <div className="flex-grow p-4 overflow-y-auto flex items-center justify-center bg-transparent">
        {totalStreams === 0 ? (
          <div className="text-center p-8 select-none bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
            <Video size={48} className="text-slate-600 block mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-medium text-slate-400">Establishing camera streams...</p>
          </div>
        ) : (
          <div className={`grid ${getGridClass()} gap-4 w-full h-full max-h-[500px]`}>
            {/* 1. Local video player */}
            {localStream && (
              <VideoStreamPlayer
                stream={localStream}
                name="You"
                isLocal={true}
                isMuted={isAudioMuted}
                isCameraOff={isCamOff}
                isHostUser={isHost}
              />
            )}

            {/* 2. Remote participants video list */}
            {participants.map(p => (
              <div key={p.socketId} className="relative w-full h-full">
                <VideoStreamPlayer
                  stream={p.stream || null}
                  name={p.name}
                  isLocal={false}
                  isMuted={p.isMuted}
                  isCameraOff={p.isCameraOff}
                  isHostUser={p.isHost}
                />
                
                {/* Host kick controls */}
                {isHost && (
                  <button
                    onClick={() => onKickParticipant(p.socketId)}
                    className="absolute top-3 left-3 bg-red-600 hover:bg-red-500 text-white p-1.5 rounded-lg shadow-md hover:scale-105 active:scale-95 cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
                    title="Kick participant"
                  >
                    <Trash size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom meeting action control deck */}
      <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-center gap-3 relative z-10 flex-wrap backdrop-blur-md shadow-md">
        <button
          onClick={onToggleAudio}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            isAudioMuted
              ? 'bg-rose-650 text-white border-rose-500/30 shadow-md shadow-rose-500/10'
              : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm shadow-sm'
          }`}
          title={isAudioMuted ? 'Unmute Mic' : 'Mute Mic'}
        >
          {isAudioMuted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <button
          onClick={onToggleVideo}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            isCamOff
              ? 'bg-rose-650 text-white border-rose-500/30 shadow-md shadow-rose-500/10'
              : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm shadow-sm'
          }`}
          title={isCamOff ? 'Turn Cam On' : 'Turn Cam Off'}
        >
          {isCamOff ? <VideoOff size={16} /> : <Video size={16} />}
        </button>

        <button
          onClick={onToggleScreenShare}
          className={`p-3 rounded-xl border transition-all cursor-pointer ${
            isSharingScreen
              ? 'bg-indigo-650 text-white border-indigo-500/30'
              : 'bg-white/10 text-slate-200 border-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm shadow-sm'
          }`}
          title={isSharingScreen ? 'Stop Screen Share' : 'Share Screen'}
        >
          {isSharingScreen ? <ScreenShareOff size={16} /> : <ScreenShare size={16} />}
        </button>

        <div className="h-6 w-[1px] bg-white/10 my-auto" />

        <button
          onClick={onLeaveMeeting}
          className="p-3 bg-rose-600/80 hover:bg-rose-600 hover:scale-[1.02] active:scale-[0.98] border border-rose-500/20 text-white font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer text-xs shadow-md shadow-rose-600/10 backdrop-blur-sm"
          title="Disconnect call"
        >
          <LogOut size={15} />
          <span>Exit Room</span>
        </button>
      </div>
    </div>
  );
}
