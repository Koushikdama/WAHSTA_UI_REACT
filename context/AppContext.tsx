
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Chat, Message, MessageType, ChatSettings, SecuritySettings, Call, StatusUpdate, GameConfig, Channel, ChatDocument, AppConfig, StatusPrivacyType, GroupRole, GroupSettings, PollData } from '../types';
import { useChatData } from '../hooks/useChatData';

interface AppContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: string;
  setLanguage: (lang: string) => void;
  logoEffect: 'none' | 'shine' | 'wave';
  setLogoEffect: (effect: 'none' | 'shine' | 'wave') => void;
  chatSettings: ChatSettings;
  updateChatSettings: (settings: Partial<ChatSettings>) => void;
  securitySettings: SecuritySettings;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
  statusPrivacy: StatusPrivacyType;
  setStatusPrivacy: (privacy: StatusPrivacyType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentUser: User;
  currentUserId: string;
  users: Record<string, User>;
  updateUserProfile: (name: string, about: string, avatar: string) => void;
  chats: Chat[];
  messages: Record<string, Message[]>;
  calls: Call[];
  statusUpdates: StatusUpdate[];
  channels: Channel[];
  chatDocuments: Record<string, ChatDocument[]>;
  drafts: Record<string, string>;
  setDraft: (chatId: string, text: string) => void;
  gameConfig?: GameConfig;
  appConfig?: AppConfig;
  startChat: (contactId: string) => string;
  createGroup: (groupName: string, participantIds: string[]) => string;
  addGroupParticipants: (chatId: string, participantIds: string[]) => void;
  updateGroupSettings: (chatId: string, settings: Partial<GroupSettings>) => void;
  updateGroupRole: (chatId: string, userId: string, role: GroupRole) => void;
  addMessage: (chatId: string, text: string, type: MessageType, replyToId?: string, mediaUrl?: string, duration?: string, pollData?: PollData) => void;
  votePoll: (chatId: string, messageId: string, optionIds: string[]) => void;
  deleteMessages: (chatId: string, messageIds: string[], deleteForEveryone: boolean) => void;
  toggleArchiveChat: (chatId: string) => void;
  togglePinChat: (chatId: string) => void;
  togglePinMessage: (chatId: string, messageId: string) => void;
  addReaction: (chatId: string, messageId: string, emoji: string) => void;
  updateChatTheme: (chatId: string, color: string, type: 'outgoing' | 'incoming') => void;
  toggleChatLock: (chatId: string) => void;
  toggleDateLock: (chatId: string, dateString: string) => void;
  addStatusUpdate: (status: StatusUpdate) => void;
  deleteStatusUpdate: (statusId: string) => void;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_CHAT_SETTINGS: ChatSettings = {
    fontSize: 'medium',
    appColor: '#008069',
    outgoingBubbleColor: '#D9FDD3',
    incomingBubbleColor: '#FFFFFF',
    chatListBackgroundImage: null,
    contactInfoBackgroundImage: null,
    translationLanguage: 'Spanish'
};

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
    dailyLockPassword: '1234',
    chatLockPassword: '0000',
    isAppLockEnabled: false
};

const DEFAULT_USER: User = { id: 'me', name: 'User', avatar: '', about: '', phone: '' };

export const AppProvider = ({ children }: React.PropsWithChildren) => {
  const { data, loading: dataLoading } = useChatData();

  // Auth State - Default to TRUE to bypass login for testing
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  const [language, setLanguage] = useState<string>(() => {
    return localStorage.getItem('language') || 'English';
  });

  const [logoEffect, setLogoEffect] = useState<'none' | 'shine' | 'wave'>('none');
  
  const [chatSettings, setChatSettings] = useState<ChatSettings>(() => {
      const saved = localStorage.getItem('chatSettings');
      return saved ? JSON.parse(saved) : DEFAULT_CHAT_SETTINGS;
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() => {
      const saved = localStorage.getItem('securitySettings');
      return saved ? JSON.parse(saved) : DEFAULT_SECURITY_SETTINGS;
  });

  const [statusPrivacy, setStatusPrivacy] = useState<StatusPrivacyType>(() => {
      return (localStorage.getItem('statusPrivacy') as StatusPrivacyType) || 'contacts';
  });

  const [searchQuery, setSearchQuery] = useState('');
  
  // State for data that might be modified
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [calls, setCalls] = useState<Call[]>([]);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [chatDocuments, setChatDocuments] = useState<Record<string, ChatDocument[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // Initialize data when fetched
  useEffect(() => {
    if (data) {
        // Current User
        const savedUser = localStorage.getItem('currentUser');
        setCurrentUser(savedUser ? JSON.parse(savedUser) : data.users[data.currentUserId] || DEFAULT_USER);
        
        // Users (Static for now)
        setUsers(data.users);

        // Chats (LocalStorage or Data)
        // Enrich existing groups with roles if missing
        const enrichedChats = data.chats.map(c => {
            if (c.isGroup && !c.groupRoles) {
                const roles: Record<string, GroupRole> = {};
                c.groupParticipants?.forEach((pid) => {
                    // Mock logic: 'me' is owner for c5 (created by me), 'u5' is admin everywhere else
                    if (c.id === 'c5' && pid === 'me') roles[pid] = 'owner';
                    else if (pid === 'u5') roles[pid] = 'admin';
                    else roles[pid] = 'member';
                });
                
                // Fallback: Make first participant owner if none exists
                if (!Object.values(roles).includes('owner') && c.groupParticipants && c.groupParticipants.length > 0) {
                    roles[c.groupParticipants[0]] = 'owner';
                }

                return { 
                    ...c, 
                    groupRoles: roles,
                    groupSettings: { 
                        editInfo: 'all', 
                        sendMessages: 'all', 
                        addMembers: 'all', 
                        approveMembers: false 
                    } as GroupSettings
                };
            }
            return c;
        });

        setChats(enrichedChats);
        setMessages(data.messages);
        setCalls(data.calls);
        setStatusUpdates(data.statusUpdates);
        setChannels(data.channels || []);
        setChatDocuments(data.chatDocuments || {});
    }
  }, [data]);

  // Sync Theme & CSS Vars
  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Sync Chat Settings
  useEffect(() => {
      localStorage.setItem('chatSettings', JSON.stringify(chatSettings));
      const root = document.documentElement;
      root.style.setProperty('--wa-teal', chatSettings.appColor);
      root.style.setProperty('--wa-teal-dark', chatSettings.appColor);
      root.style.setProperty('--wa-bubble-out', chatSettings.outgoingBubbleColor);
      root.style.setProperty('--wa-bubble-in', chatSettings.incomingBubbleColor);
  }, [chatSettings]);

  // Sync Security Settings
  useEffect(() => {
      localStorage.setItem('securitySettings', JSON.stringify(securitySettings));
  }, [securitySettings]);

  // Sync Status Privacy
  useEffect(() => {
      localStorage.setItem('statusPrivacy', statusPrivacy);
  }, [statusPrivacy]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const login = () => {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated');
  };

  const updateChatSettings = (newSettings: Partial<ChatSettings>) => {
      setChatSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateSecuritySettings = (newSettings: Partial<SecuritySettings>) => {
      setSecuritySettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updateUserProfile = (name: string, about: string, avatar: string) => {
    const updated = { ...currentUser, name, about, avatar };
    setCurrentUser(updated);
    localStorage.setItem('currentUser', JSON.stringify(updated));
  };

  const setDraft = (chatId: string, text: string) => {
      setDrafts(prev => {
          if (!text) {
              const newState = { ...prev };
              delete newState[chatId];
              return newState;
          }
          return { ...prev, [chatId]: text };
      });
  };

  const startChat = (contactId: string): string => {
    const existingChat = chats.find(c => c.contactId === contactId && !c.isGroup);
    if (existingChat) return existingChat.id;

    const newChatId = `c_${Date.now()}`;
    const newChat: Chat = {
        id: newChatId,
        contactId: contactId,
        unreadCount: 0,
        isPinned: false,
        isMuted: false,
        isGroup: false,
        timestamp: new Date().toISOString()
    };

    setChats([newChat, ...chats]);
    setMessages(prev => ({ ...prev, [newChatId]: [] }));
    
    return newChatId;
  };

  const createGroup = (groupName: string, participantIds: string[]): string => {
      const newChatId = `c_g_${Date.now()}`;
      const groupRoles: Record<string, GroupRole> = {};
      
      // Creator is owner
      groupRoles[currentUser.id] = 'owner';
      participantIds.forEach(id => groupRoles[id] = 'member');

      const newChat: Chat = {
          id: newChatId,
          contactId: '', // No single contact ID for group
          unreadCount: 0,
          isPinned: false,
          isMuted: false,
          isGroup: true,
          groupName: groupName,
          groupParticipants: [...participantIds, currentUser.id],
          groupRoles: groupRoles,
          groupSettings: { 
              editInfo: 'all', 
              sendMessages: 'all', 
              addMembers: 'all', 
              approveMembers: false 
          },
          timestamp: new Date().toISOString()
      };

      setChats([newChat, ...chats]);
      
      // Add initial system message
      const sysMsgId = `m_${Date.now()}`;
      setMessages(prev => ({
          ...prev,
          [newChatId]: [{
              id: sysMsgId,
              chatId: newChatId,
              senderId: 'system',
              text: `You created group "${groupName}"`,
              timestamp: new Date().toISOString(),
              status: 'read',
              type: 'text',
              isPinned: false
          }]
      }));

      return newChatId;
  };

  const addGroupParticipants = (chatId: string, participantIds: string[]) => {
      setChats(prev => prev.map(c => {
          if (c.id === chatId && c.isGroup) {
              const currentParticipants = c.groupParticipants || [];
              const newIds = participantIds.filter(id => !currentParticipants.includes(id));
              if (newIds.length === 0) return c;

              const updatedParticipants = [...currentParticipants, ...newIds];
              const updatedRoles = { ...c.groupRoles };
              newIds.forEach(id => {
                  updatedRoles[id] = 'member';
              });

              return {
                  ...c,
                  groupParticipants: updatedParticipants,
                  groupRoles: updatedRoles
              };
          }
          return c;
      }));

      // Add system message
      if (participantIds.length > 0) {
          const names = participantIds.map(id => users[id]?.name || 'Someone').join(', ');
          const sysMsgId = `m_add_${Date.now()}`;
          
          setMessages(prev => ({
              ...prev,
              [chatId]: [...(prev[chatId] || []), {
                  id: sysMsgId,
                  chatId,
                  senderId: 'system',
                  text: `You added ${names}`,
                  timestamp: new Date().toISOString(),
                  status: 'read',
                  type: 'text',
                  isPinned: false
              }]
          }));
      }
  };

  const updateGroupSettings = (chatId: string, settings: Partial<GroupSettings>) => {
      setChats(prev => prev.map(c => {
          if (c.id === chatId && c.isGroup) {
              return { ...c, groupSettings: { ...c.groupSettings!, ...settings } };
          }
          return c;
      }));
  };

  const updateGroupRole = (chatId: string, userId: string, role: GroupRole) => {
      setChats(prev => prev.map(c => {
          if (c.id === chatId && c.isGroup) {
              return { 
                  ...c, 
                  groupRoles: { ...c.groupRoles, [userId]: role } 
              };
          }
          return c;
      }));
  };

  const addMessage = (chatId: string, text: string, type: MessageType, replyToId?: string, mediaUrl?: string, duration?: string, pollData?: PollData) => {
      const newMessage: Message = {
          id: `m_${Date.now()}`,
          chatId,
          senderId: currentUser.id,
          text,
          timestamp: new Date().toISOString(),
          status: 'sent',
          type,
          replyToId,
          mediaUrl,
          duration,
          pollData
      };

      setMessages(prev => ({
          ...prev,
          [chatId]: [...(prev[chatId] || []), newMessage]
      }));

      setChats(prev => {
          const chatIndex = prev.findIndex(c => c.id === chatId);
          if (chatIndex === -1) return prev;
          
          const updatedChat = { 
            ...prev[chatIndex], 
            timestamp: new Date().toISOString(), 
            lastMessageId: newMessage.id,
            isArchived: prev[chatIndex].isLocked ? true : false 
          };
          if (prev[chatIndex].isLocked) {
              updatedChat.isArchived = true;
          }
          const newChats = [...prev];
          newChats.splice(chatIndex, 1);
          return [updatedChat, ...newChats];
      });
  };

  const votePoll = (chatId: string, messageId: string, optionIds: string[]) => {
      setMessages(prev => {
          const chatMessages = prev[chatId] || [];
          return {
              ...prev,
              [chatId]: chatMessages.map(msg => {
                  if (msg.id === messageId && msg.type === 'poll' && msg.pollData) {
                      const newOptions = msg.pollData.options.map(opt => {
                          const hasVoted = optionIds.includes(opt.id);
                          const voters = new Set(opt.voters);
                          
                          if (hasVoted) voters.add(currentUser.id);
                          else voters.delete(currentUser.id);
                          
                          return { ...opt, voters: Array.from(voters) };
                      });
                      
                      return { ...msg, pollData: { ...msg.pollData, options: newOptions } };
                  }
                  return msg;
              })
          };
      });
  };

  const deleteMessages = (chatId: string, messageIds: string[], deleteForEveryone: boolean) => {
    setMessages(prev => {
      const chatMessages = prev[chatId] || [];
      const idsSet = new Set(messageIds);

      if (deleteForEveryone) {
        return {
          ...prev,
          [chatId]: chatMessages.map(msg => 
            idsSet.has(msg.id)
              ? { 
                  ...msg, 
                  isDeleted: true, 
                  text: msg.senderId === currentUser.id ? 'You deleted this message' : 'This message was deleted', 
                  type: 'text',
                  reactions: undefined,
                  mediaUrl: undefined,
                  replyToId: undefined,
                  pollData: undefined
                } 
              : msg
          )
        };
      } else {
        return {
          ...prev,
          [chatId]: chatMessages.filter(msg => !idsSet.has(msg.id))
        };
      }
    });
  };

  const toggleArchiveChat = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isArchived: !chat.isArchived } : chat
    ));
  };

  const togglePinChat = (chatId: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
    ));
  };

  const togglePinMessage = (chatId: string, messageId: string) => {
    setMessages(prev => {
      const chatMessages = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMessages.map(msg => 
          msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
        )
      };
    });
  };

  const addReaction = (chatId: string, messageId: string, emoji: string) => {
    setMessages(prev => {
      const chatMessages = prev[chatId] || [];
      return {
        ...prev,
        [chatId]: chatMessages.map(msg => {
          if (msg.id !== messageId) return msg;
          const currentReactions = msg.reactions || {};
          if (currentReactions[currentUser.id] === emoji) {
            const newReactions = { ...currentReactions };
            delete newReactions[currentUser.id];
            return { ...msg, reactions: newReactions };
          }
          return {
            ...msg,
            reactions: { ...currentReactions, [currentUser.id]: emoji }
          };
        })
      };
    });
  };

  const updateChatTheme = (chatId: string, color: string, type: 'outgoing' | 'incoming') => {
      setChats(prev => prev.map(c => {
          if (c.id !== chatId) return c;
          return type === 'outgoing' 
            ? { ...c, themeColor: color }
            : { ...c, incomingThemeColor: color };
      }));
  };

  const toggleChatLock = (chatId: string) => {
      setChats(prev => prev.map(c => {
          if (c.id === chatId) {
              const newLocked = !c.isLocked;
              return { 
                  ...c, 
                  isLocked: newLocked, 
                  isArchived: newLocked ? true : c.isArchived 
              };
          }
          return c;
      }));
  };

  const toggleDateLock = (chatId: string, dateString: string) => {
      setChats(prev => prev.map(c => {
          if (c.id !== chatId) return c;
          const currentHidden = c.hiddenDates || [];
          const isHidden = currentHidden.includes(dateString);
          let newHidden;
          if (isHidden) {
              newHidden = currentHidden.filter(d => d !== dateString);
          } else {
              newHidden = [...currentHidden, dateString];
          }
          return { ...c, hiddenDates: newHidden };
      }));
  };

  const addStatusUpdate = (status: StatusUpdate) => {
      setStatusUpdates(prev => [status, ...prev]);
  };

  const deleteStatusUpdate = (statusId: string) => {
      setStatusUpdates(prev => prev.filter(s => s.id !== statusId));
  };

  if (dataLoading) {
     return (
        <div className="flex flex-col items-center justify-center h-screen bg-[#EFEAE2] dark:bg-[#111b21] gap-4">
             <div className="w-12 h-12 border-4 border-wa-teal border-t-transparent rounded-full animate-spin"></div>
             <div className="text-wa-teal dark:text-gray-300 font-medium animate-pulse">Loading WhatsApp...</div>
        </div>
     )
  }

  return (
    <AppContext.Provider value={{ 
        isAuthenticated,
        login,
        logout,
        theme, 
        toggleTheme,
        language,
        setLanguage,
        logoEffect,
        setLogoEffect,
        chatSettings,
        updateChatSettings,
        securitySettings,
        updateSecuritySettings,
        statusPrivacy,
        setStatusPrivacy,
        searchQuery, 
        setSearchQuery, 
        currentUser,
        currentUserId: data?.currentUserId || 'me',
        users,
        updateUserProfile,
        chats,
        messages,
        calls,
        statusUpdates,
        channels,
        chatDocuments,
        drafts,
        setDraft,
        gameConfig: data?.gameConfig,
        appConfig: data?.appConfig,
        startChat,
        createGroup,
        addGroupParticipants,
        updateGroupSettings,
        updateGroupRole,
        addMessage,
        votePoll,
        deleteMessages,
        toggleArchiveChat,
        togglePinChat,
        togglePinMessage,
        addReaction,
        updateChatTheme,
        toggleChatLock,
        toggleDateLock,
        addStatusUpdate,
        deleteStatusUpdate,
        loading: dataLoading
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
