// Standard helper functions
export function formatBytes(bytes: number, decimals = 2): string {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Generates an elegant animated avatar canvas stream to stand-in for missing or locked camera hardware
export function createMockCameraStream(participantName: string): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d')!;

  let hue = Math.floor(Math.random() * 360);
  let angle = 0;

  // Render loop
  const draw = () => {
    if (!ctx) return;
    
    // Clear background
    ctx.fillStyle = '#0f172a'; // slate-900
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dynamic wave pattern
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.35)`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i += 5) {
      const y = (canvas.height / 2) + Math.sin(i * 0.02 + angle) * 40;
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();

    ctx.strokeStyle = `hsla(${(hue + 60) % 360}, 85%, 60%, 0.2)`;
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i += 5) {
      const y = (canvas.height / 2) + Math.sin(i * 0.015 - angle) * 30;
      if (i === 0) ctx.moveTo(i, y);
      else ctx.lineTo(i, y);
    }
    ctx.stroke();

    // Participant initials circle
    const initials = participantName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Outer glow
    const grad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 90);
    grad.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.1)`);
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
    ctx.fill();

    // Active circle
    ctx.fillStyle = `hsla(${hue}, 70%, 45%, 0.95)`;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.fill();

    // Colored border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Typography
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials || 'ME', centerX, centerY - 2);

    // Mock stream banner
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`CAM SIMULATOR // ${participantName.toUpperCase()}`, canvas.width / 2, canvas.height - 20);

    angle += 0.03;
    requestAnimationFrame(draw);
  };

  draw();

  // Capture canvas media stream
  const stream = (canvas as any).captureStream(30);

  // Add a silence audio track if needed to make WebRTC standard stream happy
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const dst = audioCtx.createMediaStreamDestination();
    oscillator.connect(dst);
    // Don't start sound, just capture silent stream tracks
    const silentAudioTrack = dst.stream.getAudioTracks()[0];
    if (silentAudioTrack) {
      stream.addTrack(silentAudioTrack);
    }
  } catch (e) {
    console.warn('Silent audio generator failed, streaming video-only.', e);
  }

  return stream;
}
