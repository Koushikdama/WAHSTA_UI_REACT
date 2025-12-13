
import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Chat, Message, Call, StatusUpdate, GameConfig, Channel, ChatDocument } from '../types';

export interface AppData {
  currentUserId: string;
  users: Record<string, User>;
  chats: Chat[];
  messages: Record<string, Message[]>;
  calls: Call[];
  statusUpdates: StatusUpdate[];
  channels: Channel[];
  chatDocuments: Record<string, ChatDocument[]>;
  gameConfig?: GameConfig;
}

const FALLBACK_DATA: AppData = {
  "currentUserId": "me",
  "users": {
    "me": { "id": "me", "name": "You", "avatar": "https://picsum.photos/seed/me/200", "about": "Available", "phone": "+1 234 567 8900", "connectionType": "me" },
    "u1": { "id": "u1", "name": "Alice Johnson", "avatar": "https://picsum.photos/seed/alice/201", "about": "Busy at work", "phone": "+1 555 0101", "connectionType": "following" }
  },
  "chats": [],
  "messages": {},
  "calls": [],
  "statusUpdates": [],
  "channels": [],
  "chatDocuments": {}
};

export const useChatData = () => {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<AppData>('./data.json');
        
        const enrichedData = response.data;
        // Ensure dummy messages exist for all chats if missing
        if (enrichedData.chats && enrichedData.messages) {
             enrichedData.chats.forEach(chat => {
                if (!enrichedData.messages[chat.id]) {
                    enrichedData.messages[chat.id] = [
                        { 
                            id: `${chat.id}_last`, 
                            chatId: chat.id, 
                            senderId: chat.contactId, 
                            text: 'Start of conversation', 
                            timestamp: chat.timestamp, 
                            status: 'read', 
                            type: 'text' 
                        }
                    ];
                }
             });
        }

        setData(enrichedData);
        setLoading(false);
      } catch (err) {
        console.warn("Failed to fetch chat data, using fallback data due to:", err);
        setData(FALLBACK_DATA);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
};
