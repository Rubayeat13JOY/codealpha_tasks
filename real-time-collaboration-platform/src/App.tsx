import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Video, Paintbrush, MessageSquare, Monitor, CheckCircle, ShieldAlert, X } from 'lucide-react';
import LoginRegister from './components/LoginRegister';
import MeetingLobby from './components/MeetingLobby';
import VideoGrid from './components/VideoGrid';
import Whiteboard from './components/Whiteboard';
import ChatSidebar from './components/ChatSidebar';
import { UserModel, ParticipantModel } from './types';
import { createMockCameraStream } from './utils';

const ICE_SERVERS_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
  ],
};

export default function App() {
  // Navigation & Authentication states
  const [token, setToken] = useState<string>(() => localStorage.getItem('collab_token') || '');
  const [user, setUser] = useState<UserModel | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  // Active meeting room states
  const [activeRoomId, setActiveRoomId] = useState<string>('');
  const [activeRoomName, setActiveRoomName] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Layout states inside meeting
  const [workspaceTab, setWorkspaceTab] = useState<'video' | 'whiteboard'>('video');

  // Multi-user audio/video references & states
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);

  // Participants (WebRTC live sessions) state
  const [participants, setParticipants] = useState<ParticipantModel[]>([]);

  // Socket connection references
  const [socket, setSocket] = useState<Socket | null>(null);

  // WebRTC tracking references
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // Persistent alerts
  const [toast, setToast] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(null);

  // Verify token on load
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setIsAuthenticating(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          handleLogout();
        }
      } catch (e) {
        console.error('Session validation failing:', e);
      } finally {
        setIsAuthenticating(false);
      }
    };
    fetchUser();
  }, [token]);

  // Toast auto-dismiss timeout
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle successful sign in/sign up
  const handleAuthSuccess = (newToken: string, authenticatedUser: UserModel) => {
    localStorage.setItem('collab_token', newToken);
    setToken(newToken);
    setUser(authenticatedUser);
    showToast('success', `Welcome back, ${authenticatedUser.name}!`);
  };

  // Sign out / clear session
  const handleLogout = () => {
    localStorage.removeItem('collab_token');
    setToken('');
    setUser(null);
    showToast('info', 'Secure connection closed cleanly.');
  };

  // Toast trigger
  const showToast = (type: 'success' | 'info' | 'error', message: string) => {
    setToast({ type, message });
  };

  // --- WEBRTC SIGNALING HANDLERS ---
  const handleJoinMeetingSuccess = async (room: { roomId: string; name: string; isHost: boolean }) => {
    setActiveRoomId(room.roomId);
    setActiveRoomName(room.name);
    setIsHost(room.isHost);
    setWorkspaceTab('video');

    // First, start camera & mic devices
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      showToast('success', 'Camera and audio devices connected.');
    } catch (err) {
      console.warn('Physical camera/mic not found or blocked. Spawning stream sandbox mock.', err);
      stream = createMockCameraStream(user?.name || 'User');
      showToast('info', 'Hardware camera not found. Initiated video avatar backup.');
    }

    setLocalStream(stream);
    localStreamRef.current = stream;

    // Connect socket cleanly
    const newSocket = io();
    setSocket(newSocket);

    // Prompt server connection room register
    newSocket.emit('join-room', {
      roomId: room.roomId,
      userId: user?.id,
      name: user?.name
    });

    // LISTEN FOR RECONNECTED USERS IN THE CONFERENCE
    newSocket.on('room-users', (usersList: any[]) => {
      usersList.forEach(u => {
        // Establish peer connection for each existing user (calling them)
        initiateWebRTCConnection(newSocket, u.socketId, u.name, true, u.isHost);
      });
    });

    newSocket.on('user-connected', (newUser: { socketId: string; name: string; isHost: boolean }) => {
      // Create Peer on incoming user connection (waiting for offer)
      initiateWebRTCConnection(newSocket, newUser.socketId, newUser.name, false, newUser.isHost);
      showToast('info', `${newUser.name} connected to the room.`);
    });

    newSocket.on('user-disconnected', (oldUser: { socketId: string; name: string }) => {
      // Tear down peer connection
      const pc = peersRef.current.get(oldUser.socketId);
      if (pc) {
        pc.close();
        peersRef.current.delete(oldUser.socketId);
      }
      setParticipants(prev => prev.filter(p => p.socketId !== oldUser.socketId));
      showToast('info', `${oldUser.name} left the room.`);
    });

    // WebRTC signaling routers
    newSocket.on('offer', async ({ senderSocketId, offer }) => {
      const pc = peersRef.current.get(senderSocketId);
      if (!pc) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        newSocket.emit('answer', { targetSocketId: senderSocketId, answer });
      } catch (err) {
        console.error('Error handling WebRTC SDP offer:', err);
      }
    });

    newSocket.on('answer', async ({ senderSocketId, answer }) => {
      const pc = peersRef.current.get(senderSocketId);
      if (!pc) return;

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      } catch (err) {
        console.error('Error handling WebRTC SDP answer:', err);
      }
    });

    newSocket.on('ice-candidate', async ({ senderSocketId, candidate }) => {
      const pc = peersRef.current.get(senderSocketId);
      if (!pc) return;

      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error('Error adding remote ICE candidate:', err);
      }
    });

    newSocket.on('participant-media-status', ({ socketId, type, value }) => {
      setParticipants(prev => prev.map(p => {
        if (p.socketId === socketId) {
          if (type === 'audio') return { ...p, isMuted: value };
          if (type === 'video') return { ...p, isCameraOff: value };
        }
        return p;
      }));
    });

    newSocket.on('room-lock-status-changed', ({ isLocked: nextLockState }) => {
      setIsLocked(nextLockState);
      showToast('info', `Meeting is now ${nextLockState ? 'locked' : 'public'}.`);
    });

    newSocket.on('kicked-from-meeting', () => {
      showToast('error', 'You were removed from the meeting by the Host.');
      leaveMeetingRoom();
    });
  };

  // --- WEBRTC CONNECTION MAKER ---
  const initiateWebRTCConnection = async (
    activeSocket: Socket,
    remoteSocketId: string,
    remoteName: string,
    isCaller: boolean,
    peerIsHost: boolean
  ) => {
    const pc = new RTCPeerConnection(ICE_SERVERS_CONFIG);
    peersRef.current.set(remoteSocketId, pc);

    // Create participant entry immediately to register connection
    setParticipants(prev => {
      const exists = prev.find(p => p.socketId === remoteSocketId);
      if (exists) return prev;
      return [...prev, {
        userId: '',
        name: remoteName,
        socketId: remoteSocketId,
        isScreenSharing: false,
        isHost: peerIsHost,
        isMuted: false,
        isCameraOff: false,
      }];
    });

    // Handle local media tracks sending
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Capture remote streams
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setParticipants(prev => prev.map(p => {
        if (p.socketId === remoteSocketId) {
          return { ...p, stream: remoteStream };
        }
        return p;
      }));
    };

    // Candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        activeSocket.emit('ice-candidate', {
          targetSocketId: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    // If caller, negotiate offer immediately
    if (isCaller) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        activeSocket.emit('offer', { targetSocketId: remoteSocketId, offer });
      } catch (err) {
        console.error('WebRTC offer negotiation error:', err);
      }
    }
  };

  // Toggle audio track state locally & notify peers
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        const nextMute = !isAudioMuted;
        audioTrack.enabled = !nextMute;
        setIsAudioMuted(nextMute);
        if (socket) {
          socket.emit('participant-toggle-media', { roomId: activeRoomId, type: 'audio', value: nextMute });
        }
      }
    }
  };

  // Toggle video track state locally & notify peers
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const nextCamOff = !isCamOff;
        videoTrack.enabled = !nextCamOff;
        setIsCamOff(nextCamOff);
        if (socket) {
          socket.emit('participant-toggle-media', { roomId: activeRoomId, type: 'video', value: nextCamOff });
        }
      }
    }
  };

  // Full screen sharing broadcast
  const toggleScreenShare = async () => {
    if (isSharingScreen) {
      // STOP SHARE
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
      screenStreamRef.current = null;
      setIsSharingScreen(false);

      if (socket) {
        socket.emit('screen-share-stop', { roomId: activeRoomId });
      }

      // Restore camera video tracks inside all peers
      if (localStreamRef.current) {
        const cameraTrack = localStreamRef.current.getVideoTracks()[0];
        peersRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && cameraTrack) {
            sender.replaceTrack(cameraTrack);
          }
        });
      }
      showToast('info', 'Screen share closed.');
    } else {
      // START SHARE
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        setIsSharingScreen(true);

        if (socket) {
          socket.emit('screen-share-start', { roomId: activeRoomId });
        }

        const screenVideoTrack = screenStream.getVideoTracks()[0];
        showToast('success', 'Screen sharing session initiated.');

        // On share stop by clicking operating native banner
        screenVideoTrack.onended = () => {
          toggleScreenShare(); // restore clean webcam
        };

        // Replace video tracks in peers with screen share tracks
        peersRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender && screenVideoTrack) {
            sender.replaceTrack(screenVideoTrack);
          }
        });
      } catch (err) {
        console.error('Screen capture permission rejected/failed:', err);
      }
    }
  };

  // Kick attendee (host control only)
  const kickParticipant = (peerSocketId: string) => {
    if (socket && isHost) {
      socket.emit('kick-user', { roomId: activeRoomId, targetSocketId: peerSocketId });
      showToast('info', 'Eject command issued.');
    }
  };

  // Room lock toggling (host control only)
  const toggleRoomLock = () => {
    if (socket && isHost) {
      const nextLocked = !isLocked;
      socket.emit('toggle-lock-room', { roomId: activeRoomId, isLocked: nextLocked });
    }
  };

  // Clean-up and leave completely
  const leaveMeetingRoom = () => {
    // 1. Disconnect socket
    if (socket) {
      socket.emit('leave-room');
      socket.disconnect();
    }
    setSocket(null);

    // 2. Shut down tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    localStreamRef.current = null;
    screenStreamRef.current = null;

    setLocalStream(null);
    setIsSharingScreen(false);
    setIsAudioMuted(false);
    setIsCamOff(false);

    // 3. Clear Peer connections
    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();

    setParticipants([]);
    setActiveRoomId('');
    setActiveRoomName('');
    setIsHost(false);
    setIsLocked(false);

    showToast('info', 'Disconnected from meeting workspace.');
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0c10] text-slate-200 flex flex-col selection:bg-indigo-600/40 selection:text-white overflow-x-hidden relative">
      
      {/* Dynamic ambient blur background backdrops */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/3 w-1/3 h-1/3 bg-indigo-500/5 rounded-full blur-[120px]"></div>
      </div>

      {/* PERSISTENT BEAUTIFUL NAV DECK WITH GLASSMORPHISM */}
      <header className="w-full h-16 border-b border-white/5 bg-white/5 backdrop-blur-md px-6 flex items-center justify-between relative z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
            <Monitor size={18} className="animate-spin-slow" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold tracking-tight text-white">Full-Mesh Workspace</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Secured Room Sync // v1.2</span>
            </div>
          </div>
        </div>

        {/* User Info / Connection indicators */}
        <div className="flex items-center gap-3">
          {activeRoomId && (
            <div className="hidden md:flex items-center gap-2 text-xs bg-white/5 backdrop-blur-md rounded-xl px-3.5 py-1.5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-300 font-medium">Session: <strong className="text-white">{activeRoomName}</strong></span>
            </div>
          )}

          {user && (
            <div className="flex items-center gap-2.5 bg-white/5 backdrop-blur-md border border-white/5 rounded-xl px-3.5 py-1.5">
              <div className="w-6 h-6 rounded-full bg-indigo-600 border border-white/10 flex items-center justify-center text-xs font-semibold text-white">
                {user.name[0]?.toUpperCase()}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-200">{user.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* STYLISH GLOBAL REAL-TIME TRANSACTION TOAST */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4.5 py-3 bg-slate-900/90 border border-indigo-500/15 rounded-xl shadow-2xl text-xs font-medium backdrop-blur-md animate-fade-in text-white/95">
          {toast.type === 'success' ? (
            <CheckCircle size={15} className="text-emerald-400" />
          ) : toast.type === 'error' ? (
            <ShieldAlert size={15} className="text-rose-400" />
          ) : (
            <Monitor size={15} className="text-sky-400" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-500 hover:text-slate-400 p-0.5 ml-1 transition-all focus:outline-none cursor-pointer"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* CORE DISPLAY WINDOW */}
      <main className="flex-grow w-full flex items-center justify-center p-4 relative z-10">
        {isAuthenticating ? (
          <div className="text-center p-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5">
            <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs text-slate-450 font-mono tracking-widest uppercase">Validating secure workspace token...</p>
          </div>
        ) : !token ? (
          /* SECTION 1: AUTHENTICATION STAGE */
          <LoginRegister onSuccess={handleAuthSuccess} />
        ) : !activeRoomId ? (
          /* SECTION 2: LOBBY STANDBY DECK */
          <MeetingLobby
            token={token}
            userName={user?.name || 'User'}
            onJoinSuccess={handleJoinMeetingSuccess}
            onLogout={handleLogout}
          />
        ) : (
          /* SECTION 3: IMMERSIVE MULTI-USER WORKSPACE (BOARD + VIDEO + SECURED CHAT) */
          <div className="w-full h-[calc(100vh-140px)] max-h-[820px] grid grid-cols-1 lg:grid-cols-12 gap-5 relative z-10 antialiased p-2">
            
            {/* LEFT AREA: Workspace switcher (toggles between dynamic video layouts and drawing boards) */}
            <div className="lg:col-span-8 flex flex-col h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
              {/* Workspace Navigation tab deck */}
              <div className="p-2 border-b border-white/10 bg-white/5 flex items-center gap-1.5 justify-start relative z-40">
                <button
                  onClick={() => setWorkspaceTab('video')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    workspaceTab === 'video'
                      ? 'bg-white/10 text-white border border-white/10 backdrop-blur-sm shadow-sm'
                      : 'text-slate-450 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Video size={13} />
                  <span>Interactive Video Conference Grid</span>
                </button>
                <button
                  onClick={() => setWorkspaceTab('whiteboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    workspaceTab === 'whiteboard'
                      ? 'bg-white/10 text-white border border-white/10 backdrop-blur-sm shadow-sm'
                      : 'text-slate-450 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Paintbrush size={13} />
                  <span>Collaborative Design Workspace</span>
                </button>
              </div>

              {/* Active Workspace container */}
              <div className="flex-grow overflow-hidden relative">
                {workspaceTab === 'video' ? (
                  <VideoGrid
                    participants={participants}
                    localStream={localStream}
                    isAudioMuted={isAudioMuted}
                    isCamOff={isCamOff}
                    isSharingScreen={isSharingScreen}
                    roomName={activeRoomName}
                    roomId={activeRoomId}
                    isHost={isHost}
                    isLocked={isLocked}
                    onToggleAudio={toggleAudio}
                    onToggleVideo={toggleVideo}
                    onToggleScreenShare={toggleScreenShare}
                    onLeaveMeeting={leaveMeetingRoom}
                    onToggleLock={toggleRoomLock}
                    onKickParticipant={kickParticipant}
                  />
                ) : (
                  <Whiteboard
                    socket={socket}
                    roomId={activeRoomId}
                    userId={user?.id || ''}
                    userName={user?.name || 'User'}
                  />
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR: Chat, uploads and members details */}
            <div className="lg:col-span-4 h-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
              <ChatSidebar
                socket={socket}
                roomId={activeRoomId}
                token={token}
                userId={user?.id || ''}
                userName={user?.name || 'User'}
                participants={participants}
                onKickParticipant={kickParticipant}
                isHost={isHost}
              />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
