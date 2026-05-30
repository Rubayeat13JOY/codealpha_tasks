import React, { useRef, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Paintbrush, Eraser, RotateCcw, Trash2, Eye, Compass } from 'lucide-react';

interface WhiteboardProps {
  socket: Socket | null;
  roomId: string;
  userName: string;
  userId: string;
}

interface Point {
  x: number;
  y: number;
}

interface RemoteCursor {
  socketId: string;
  name: string;
  x: number; // 0 to 1
  y: number; // 0 to 1
}

export default function Whiteboard({ socket, roomId, userName, userId }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawing = useRef(false);
  const lastPos = useRef<Point>({ x: 0, y: 0 });

  // Brush settings
  const [color, setColor] = useState('#6366f1'); // Indigo
  const [thickness, setThickness] = useState(4);
  const [isEraser, setIsEraser] = useState(false);
  const [history, setHistory] = useState<string[]>([]); // Base64 canvas states for local undo

  // Remote cursors
  const [remoteCursors, setRemoteCursors] = useState<Map<string, RemoteCursor>>(new Map());

  // Colors list
  const colors = [
    '#6366f1', // Indigo
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#ffffff', // White
  ];

  // Set up responsive canvas sizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Maintain drawing content visually across resize by saving state
      const tempImage = canvas.toDataURL();
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight || 500;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Redraw content on clean slate
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };
        img.src = tempImage;
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial size
    setTimeout(handleResize, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Socket sync listeners
  useEffect(() => {
    if (!socket) return;

    // Listen to remote whiteboard drawings
    socket.on('whiteboard-draw', (data: {
      p1: Point;
      p2: Point;
      color: string;
      thickness: number;
      isEraser: boolean;
    }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Convert relative coords back to absolute
      const x1 = data.p1.x * canvas.width;
      const y1 = data.p1.y * canvas.height;
      const x2 = data.p2.x * canvas.width;
      const y2 = data.p2.y * canvas.height;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = data.isEraser ? '#0f172a' : data.color; // Slate 900 base color for erasing
      ctx.lineWidth = data.thickness;
      ctx.stroke();
    });

    // Clear board remote trigger
    socket.on('clear-board', () => {
      clearLocalBoard();
    });

    // Remote cursors movement sync
    socket.on('whiteboard-cursor-move', (data: { socketId: string; name: string; x: number; y: number }) => {
      setRemoteCursors(prev => {
        const next = new Map(prev);
        if (data.x < 0 || data.y < 0) {
          next.delete(data.socketId); // negative indicates left workspace
        } else {
          next.set(data.socketId, data);
        }
        return next;
      });
    });

    // Remove cursor on disconnected participant
    socket.on('user-disconnected', (data: { socketId: string }) => {
      setRemoteCursors(prev => {
        const next = new Map(prev);
        next.delete(data.socketId);
        return next;
      });
    });

    return () => {
      socket.off('whiteboard-draw');
      socket.off('clear-board');
      socket.off('whiteboard-cursor-move');
    };
  }, [socket]);

  // Push slate state to history stack
  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setHistory(prev => {
      const next = [...prev, canvas.toDataURL()];
      if (next.length > 25) next.shift(); // Bound history size
      return next;
    });
  };

  // Drawing mouse handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    saveState();

    const rect = canvas.getBoundingClientRect();
    isDrawing.current = true;
    lastPos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Send relative cursor pos to other peers
    if (socket) {
      socket.emit('whiteboard-draw-event-raw', {
        roomId,
        event: 'whiteboard-cursor-move',
        payload: {
          socketId: socket.id,
          name: userName,
          x: x / canvas.width,
          y: y / canvas.height,
        }
      });
    }

    if (!isDrawing.current) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#0f172a' : color;
    ctx.lineWidth = thickness;
    ctx.stroke();

    // Broadcast normalized path segment to other meeting members
    if (socket) {
      socket.emit('whiteboard-draw', {
        roomId,
        drawData: {
          p1: { x: lastPos.current.x / canvas.width, y: lastPos.current.y / canvas.height },
          p2: { x: x / canvas.width, y: y / canvas.height },
          color,
          thickness,
          isEraser
        }
      });
    }

    lastPos.current = { x, y };
  };

  const handleMouseUpOrLeave = () => {
    isDrawing.current = false;
    
    // Clear remote indicator on leave
    if (socket) {
      socket.emit('whiteboard-draw-event-raw', {
        roomId,
        event: 'whiteboard-cursor-move',
        payload: {
          socketId: socket.id,
          name: userName,
          x: -1,
          y: -1
        }
      });
    }
  };

  // Touch triggers support for mobile browsers
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || e.touches.length === 0) return;

    saveState();

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    isDrawing.current = true;
    lastPos.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawing.current || e.touches.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = isEraser ? '#0f172a' : color;
    ctx.lineWidth = thickness;
    ctx.stroke();

    if (socket) {
      socket.emit('whiteboard-draw', {
        roomId,
        drawData: {
          p1: { x: lastPos.current.x / canvas.width, y: lastPos.current.y / canvas.height },
          p2: { x: x / canvas.width, y: y / canvas.height },
          color,
          thickness,
          isEraser
        }
      });
    }

    lastPos.current = { x, y };
  };

  // Actions
  const clearLocalBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleClearAll = () => {
    clearLocalBoard();
    if (socket) {
      socket.emit('clear-board', { roomId });
    }
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    setHistory(newHistory);

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      // Wait to let draw paint, then broadcast if necessary, although undo is usually client-controlled
    };
    img.src = previousState;
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent overflow-hidden relative">
      {/* Top Toolbar panel */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white/5 border-b border-white/10 relative z-20 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner backdrop-blur-sm">
            <button
              onClick={() => setIsEraser(false)}
              className={`p-2 rounded-lg transition-all focus:outline-none cursor-pointer ${
                !isEraser ? 'bg-indigo-650 text-white shadow-md shadow-indigo-650/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="Pencil Tool"
            >
              <Paintbrush size={18} />
            </button>
            <button
              onClick={() => setIsEraser(true)}
              className={`p-2 rounded-lg transition-all focus:outline-none cursor-pointer ${
                isEraser ? 'bg-indigo-650 text-white shadow-md shadow-indigo-650/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
              title="Eraser Tool"
            >
              <Eraser size={18} />
            </button>
          </div>

          {/* Color Presets Picker */}
          {!isEraser && (
            <div className="flex items-center gap-2.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 backdrop-blur-sm shadow-inner">
              {colors.map(preset => (
                <button
                  key={preset}
                  onClick={() => setColor(preset)}
                  className={`w-6 h-6 rounded-full border cursor-pointer transition-all ${
                    color === preset ? 'border-white scale-110 saturate-150' : 'border-transparent scale-100 opacity-80 hover:opacity-100 hover:scale-[1.05]'
                  }`}
                  style={{ backgroundColor: preset === '#ffffff' ? '#e2e8f0' : preset }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-6 h-6 p-0 rounded-md border-0 outline-none bg-transparent cursor-pointer"
                title="Custom Color"
              />
            </div>
          )}
        </div>

        {/* Brush Weight Sizer */}
        <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-sm backdrop-blur-sm shadow-inner">
          <span className="text-slate-400 font-semibold tracking-wide">Size:</span>
          <input
            type="range"
            min="1"
            max="25"
            value={thickness}
            onChange={e => setThickness(parseInt(e.target.value))}
            className="w-24 sm:w-32 accent-indigo-500 cursor-pointer"
          />
          <span className="text-slate-300 font-mono w-5 text-right font-medium">{thickness}px</span>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-2.5 bg-white/5 text-slate-400 hover:text-slate-200 border border-white/10 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer hover:bg-white/10 backdrop-blur-sm shadow-sm"
            title="Undo stroke"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={handleClearAll}
            className="p-2.5 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/15 hover:border-transparent rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold backdrop-blur-sm hover:shadow-[0_0_15px_rgba(239,68,68,0.25)]"
            title="Clear canvas entirely"
          >
            <Trash2 size={16} />
            <span className="hidden sm:inline font-sans">Delete Board</span>
          </button>
        </div>
      </div>

      {/* Drawing Sandbox Stage */}
      <div ref={containerRef} className="w-full flex-grow bg-slate-900/15 relative cursor-crosshair overflow-hidden">
        {/* Render remote cursors */}
        {containerRef.current && (Array.from(remoteCursors.values()) as RemoteCursor[]).map(cur => (
          <div
            key={cur.socketId}
            className="absolute pointer-events-none z-10 transition-all duration-75 select-none"
            style={{
              left: `${cur.x * (canvasRef.current?.width || 0)}px`,
              top: `${cur.y * (canvasRef.current?.height || 0)}px`,
            }}
          >
            <Compass size={16} className="text-indigo-400 animate-bounce" />
            <div className="bg-indigo-650 text-white text-[10px] font-semibold px-2 py-1 rounded-xl shadow-lg ml-4 -mt-3 whitespace-nowrap border border-white/10">
              {cur.name}
            </div>
          </div>
        ))}

        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUpOrLeave}
          className="absolute inset-0 block bg-transparent"
        />

        {/* Canvas Empty Overlay Banner */}
        <div className="absolute bottom-4 left-4 pointer-events-none flex items-center gap-2 text-slate-500/80 text-[10px] font-mono select-none tracking-widest uppercase">
          <Eye size={11} />
          <span>REALTIME COLLABORATIVE ACTIVE CANVAS</span>
        </div>
      </div>
    </div>
  );
}
