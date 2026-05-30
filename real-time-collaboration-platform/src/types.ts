export interface UserModel {
  id: string;
  name: string;
  email: string;
}

export interface RoomModel {
  id: string;
  name: string;
  passwordProtected: boolean;
  waitingRoomEnabled: boolean;
  hostId: string;
  isHost: boolean;
}

export interface SharedFile {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  file?: SharedFile;
}

export interface DrawPoint {
  x: number;
  y: number;
}

export interface WhiteboardStroke {
  points: DrawPoint[];
  color: string;
  thickness: number;
  isEraser: boolean;
}

export interface ParticipantModel {
  userId: string;
  name: string;
  socketId: string;
  isScreenSharing: boolean;
  isHost: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  stream?: MediaStream;
}
