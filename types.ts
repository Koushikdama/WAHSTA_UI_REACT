

export interface User {
  id: string;
  name: string;
  avatar: string; // URL or color code
  about: string;
  phone: string;
  connectionType?: 'me' | 'following' | 'follower' | 'contact';
}

export type MessageStatus = 'sent' | 'delivered' | 'read';
export type MessageType = 'text' | 'image' | 'voice' | 'video';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO string
  status: MessageStatus;
  type: MessageType;
  duration?: string; // For voice/video
  mediaUrl?: string; // Single media
  mediaUrls?: string[]; // Multiple media for carousel
  isForwarded?: boolean;
  isPinned?: boolean;
  reactions?: Record<string, string>; // userId -> emoji
  replyToId?: string;
  isDeleted?: boolean;
}

export interface Chat {
  id: string;
  contactId: string; // References User
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isGroup: boolean;
  groupName?: string;
  groupParticipants?: string[];
  lastMessageId?: string;
  timestamp: string; // ISO string for sorting
  isArchived?: boolean;
  themeColor?: string; // Outgoing (My) color
  incomingThemeColor?: string; // Incoming (Sender) color
  isLocked?: boolean;
  hiddenDates?: string[]; // Array of date strings that are hidden
}

export interface Call {
  id: string;
  contactId: string;
  type: 'voice' | 'video';
  direction: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration?: string;
}

export interface ActiveCall {
    id: string;
    contactId: string;
    type: 'voice' | 'video';
    status: 'ringing' | 'connected' | 'reconnecting' | 'ended';
    startTime?: number; // timestamp when connected
    isMinimized: boolean;
    isMuted: boolean;
    isVideoEnabled: boolean;
}

export interface StatusUpdate {
  id: string;
  userId: string;
  timestamp: string;
  imageUrl?: string;
  caption?: string;
  viewed: boolean;
}

export interface Channel {
    id: string;
    name: string;
    avatar: string;
    followers: string;
    isVerified: boolean;
}

export interface ChatDocument {
    id: string;
    name: string;
    size: string;
    date: string;
    type: 'pdf' | 'xls' | 'doc' | 'ppt' | 'txt';
}

export interface ChatSettings {
  fontSize: 'small' | 'medium' | 'large';
  appColor: string;
  outgoingBubbleColor: string;
  incomingBubbleColor: string;
}

export interface SecuritySettings {
  dailyLockPassword?: string;
  chatLockPassword?: string;
  isAppLockEnabled: boolean;
}

export interface AppConfig {
    languages: string[];
    appColors: string[];
    bubbleColors: string[];
    reactions: string[];
}

// --- GAME SYSTEM TYPES ---

export type GameType = 'chess' | 'ludo' | 'snake';
export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'abandoned';

export interface GamePlayer {
    userId: string;
    color?: 'white' | 'black' | 'red' | 'blue' | 'green' | 'yellow';
    status: 'invited' | 'joined' | 'playing' | 'left';
    score?: number;
}

export interface Game {
    id: string;
    type: GameType;
    chatId: string;
    status: GameStatus;
    players: GamePlayer[];
    currentTurn: string; // userId
    timestamp: string;
    isMinimized?: boolean;
}

export interface GameConfig {
    snakeAndLadders: {
        snakes: Record<string, number>;
        ladders: Record<string, number>;
    };
    ludo: {
        safeZones: number[];
    }
}