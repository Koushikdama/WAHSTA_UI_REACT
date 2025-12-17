
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, Bell, Lock, Search, MoreVertical, Star, ThumbsUp, Trash2, LogOut, Pin, Palette, Check, Grid, Image as ImageIcon, Video as VideoIcon, FileText, BarChart2, ChevronRight, Download, Shield, EyeOff, ChevronDown, Unlock, CircleDashed, Plus, Settings, Ban, UserPlus, QrCode, X, Phone, Edit2, Link, Music, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTimestamp } from '../utils/formatTime';
import StatusViewer from './StatusViewer';
import { StatusUpdate, GroupRole, User } from '../types';

const THEME_COLORS = [
    { name: 'Default', value: '' }, 
    { name: 'Blue', value: '#d1e4f9' },
    { name: 'Red', value: '#fec5c5' },
    { name: 'Purple', value: '#e2d5f7' },
    { name: 'Orange', value: '#ffe4c4' },
    { name: 'Teal', value: '#ccf2f4' }
];

type MediaFilterType = 'all' | 'images' | 'videos' | 'doc' | 'analysis';

const GroupInfo = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { chats, messages, currentUser, currentUserId, users, updateChatTheme, toggleChatLock, securitySettings, chatDocuments, chatSettings, updateGroupRole, updateGroupSettings, addGroupParticipants } = useApp();
  
  // Tab State
  const [topTab, setTopTab] = useState<'public' | 'private'>('public');
  const [isPrivateUnlocked, setIsPrivateUnlocked] = useState(false);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMode, setAuthMode] = useState<'private_tab' | 'chat_lock'>('chat_lock');

  // Media State
  const [mediaFilter, setMediaFilter] = useState<MediaFilterType>('all');
  const [isMediaSectionExpanded, setIsMediaSectionExpanded] = useState(false);
  
  // Media Privacy Dropdown State (Settings)
  const [isMediaPrivacyOpen, setIsMediaPrivacyOpen] = useState(false);
  const [mediaVisibility, setMediaVisibility] = useState('Default (Yes)');

  // Group Status State
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [groupStatuses, setGroupStatuses] = useState<StatusUpdate[]>([]);
  const [viewerState, setViewerState] = useState<{ isOpen: boolean, startIndex: number }>({ isOpen: false, startIndex: 0 });
  const statusFileInputRef = useRef<HTMLInputElement>(null);

  // Group Settings & Roles State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [expandedAdmins, setExpandedAdmins] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });

  // Add Participant State
  const [showAddParticipants, setShowAddParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());

  const chat = chats.find(c => c.id === chatId);
  
  // Initialize mock statuses for group participants
  useEffect(() => {
      if (chat?.isGroup && chat.groupParticipants) {
           const mocks: StatusUpdate[] = chat.groupParticipants
              .filter(pid => pid !== currentUserId && Math.random() > 0.6) // Randomly assign statuses to some members
              .map((pid, idx) => ({
                  id: `gs_${pid}_${idx}`,
                  userId: pid,
                  timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                  imageUrl: `https://picsum.photos/seed/gs_${pid}/400/800`,
                  caption: `Status update in ${chat.groupName}`,
                  viewed: false
              }));
           setGroupStatuses(mocks);
      }
  }, [chat?.id, chat?.isGroup, chat?.groupName, chat?.groupParticipants, currentUserId]);

  if (!chat) return null;

  const isGroup = chat.isGroup;
  const contact = !isGroup ? users[chat.contactId] : null;
  const chatMessages = messages[chat.id] || [];
  const pinnedMessages = chatMessages.filter(m => m.isPinned);

  // Role Logic
  const myRole: GroupRole = isGroup ? (chat.groupRoles?.[currentUserId] || 'member') : 'member';
  const isOwner = myRole === 'owner';
  const isAdmin = myRole === 'admin' || isOwner;
  const canAddParticipants = isAdmin || chat.groupSettings?.addMembers === 'all';

  // --- Filtering Logic for Locked Dates ---
  const isDateLocked = (timestamp: string) => {
      try {
          const dateStr = new Date(timestamp).toLocaleDateString();
          return chat.hiddenDates?.includes(dateStr);
      } catch (e) {
          return false;
      }
  };

  // Filter Messages based on visibility (Public vs Private)
  const allImages = chatMessages.filter(m => m.type === 'image');
  const allVideos = chatMessages.filter(m => m.type === 'video');

  const publicImages = allImages.filter(m => !isDateLocked(m.timestamp));
  const publicVideos = allVideos.filter(m => !isDateLocked(m.timestamp));
  
  const privateImages = allImages.filter(m => isDateLocked(m.timestamp));
  const privateVideos = allVideos.filter(m => isDateLocked(m.timestamp));

  // Documents
  const documents = (chatId && chatDocuments[chatId]) ? chatDocuments[chatId] : [];

  // Determine active media based on tab
  const activeImages = topTab === 'private' ? privateImages : publicImages;
  const activeVideos = topTab === 'private' ? privateVideos : publicVideos;
  const activeAllMedia = [...activeImages, ...activeVideos].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Analysis Calculations (Based on current view)
  const activeMessages = chatMessages.filter(m => topTab === 'private' ? isDateLocked(m.timestamp) : !isDateLocked(m.timestamp));
  const textCount = activeMessages.filter(m => m.type === 'text').length;
  
  const stats = {
      images: { count: activeImages.length, size: activeImages.length * 1.5, color: '#008069' },
      videos: { count: activeVideos.length, size: activeVideos.length * 15, color: '#34B7F1' },
      docs: { count: documents.length, size: 4.5, color: '#FFB347' }, 
      text: { count: textCount, size: textCount * 0.0005, color: '#8696a0' }
  };
  
  const totalSize = stats.images.size + stats.videos.size + stats.docs.size + stats.text.size;
  const totalMsgs = activeMessages.length;

  const title = isGroup ? chat.groupName : contact?.name;
  const subtitle = isGroup ? `Group · ${chat.groupParticipants?.length} participants` : contact?.phone;
  const avatar = isGroup ? 'https://picsum.photos/300' : contact?.avatar;

  // --- Handlers ---

  const handleTabChange = (tab: 'public' | 'private') => {
      if (tab === 'private' && !isPrivateUnlocked) {
          setAuthMode('private_tab');
          setAuthPin('');
          setAuthError('');
          setShowAuthModal(true);
      } else {
          setTopTab(tab);
      }
  };

  const handleChatLockClick = () => {
      setAuthMode('chat_lock');
      setAuthPin('');
      setAuthError('');
      setShowAuthModal(true);
  };

  const handleAuthVerify = () => {
      const requiredPin = authMode === 'private_tab' 
        ? (securitySettings.dailyLockPassword || '1234') 
        : (securitySettings.chatLockPassword || '0000'); 

      if (authPin === requiredPin) {
          if (authMode === 'private_tab') {
              setIsPrivateUnlocked(true);
              setTopTab('private');
              setShowAuthModal(false);
          } else {
              if (chatId) {
                  toggleChatLock(chatId);
                  setShowAuthModal(false);
                  if (!chat.isLocked) {
                      navigate('/chats');
                  }
              }
          }
      } else {
          setAuthError('Incorrect PIN');
          setAuthPin('');
      }
  };

  const handleStatusUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const url = URL.createObjectURL(file);
          const newStatus: StatusUpdate = {
              id: `gs_me_${Date.now()}`,
              userId: currentUserId,
              timestamp: new Date().toISOString(),
              imageUrl: url,
              caption: 'New group status',
              viewed: false
          };
          setGroupStatuses(prev => [newStatus, ...prev]);
      }
      // Reset input
      if (statusFileInputRef.current) statusFileInputRef.current.value = '';
  };

  const handleToggleAdmin = (participantId: string) => {
      if (!isOwner || participantId === currentUserId) return;
      const currentRole = chat.groupRoles?.[participantId];
      if (currentRole === 'admin') {
          updateGroupRole(chat.id, participantId, 'member');
      } else {
          updateGroupRole(chat.id, participantId, 'admin');
      }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isMenuOpen && menuButtonRef.current) {
          const rect = menuButtonRef.current.getBoundingClientRect();
          setMenuPos({
              top: rect.bottom + 5,
              right: window.innerWidth - rect.right
          });
      }
      setIsMenuOpen(!isMenuOpen);
  };

  // --- Add Participant Handlers ---
  const toggleSelectUser = (userId: string) => {
      setSelectedToAdd(prev => {
          const newSet = new Set(prev);
          if (newSet.has(userId)) newSet.delete(userId);
          else newSet.add(userId);
          return newSet;
      });
  };

  const handleAddParticipants = () => {
      if (selectedToAdd.size === 0 || !chatId) return;
      addGroupParticipants(chatId, Array.from(selectedToAdd));
      setShowAddParticipants(false);
      setSelectedToAdd(new Set());
      setParticipantSearch('');
  };

  // --- Render Helpers ---

  // Dynamic Background Style for Cards
  const cardBgClass = chatSettings.contactInfoBackgroundImage 
    ? 'bg-white/30 dark:bg-black/40 backdrop-blur-md border border-white/20' 
    : 'bg-white/90 dark:bg-wa-dark-header/90 backdrop-blur-sm shadow-sm';

  const renderMediaContent = (isPrivateContext: boolean) => {
      if (!isPrivateContext && chat.isLocked) {
          return (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-gray-50/80 dark:bg-white/5 mx-4 mb-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-wa-grayBg dark:bg-gray-700 rounded-full flex items-center justify-center mb-3 text-gray-500">
                      <Lock size={20} />
                  </div>
                  <h4 className="text-sm font-medium text-[#111b21] dark:text-gray-100">Media Locked</h4>
                  <p className="text-xs text-[#667781] dark:text-gray-500 mt-1 max-w-[220px]">
                      Media is hidden because this chat is locked.
                  </p>
              </div>
          );
      }

      switch (mediaFilter) {
          case 'all':
              return (
                  <div className="p-1">
                      {activeAllMedia.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1">
                            {activeAllMedia.slice(0, 9).map((m) => (
                                <div key={m.id} className="aspect-square relative cursor-pointer bg-gray-100 dark:bg-gray-800">
                                    {m.type === 'image' && <img src={m.mediaUrl || m.mediaUrls?.[0]} className="w-full h-full object-cover" alt="" />}
                                    {m.type === 'video' && (
                                        <div className="w-full h-full flex items-center justify-center bg-black/10 text-white">
                                            <VideoIcon size={24} fill="currentColor" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                      ) : (
                          <div className="py-8 text-center text-[#667781] dark:text-gray-500 text-sm bg-white/50 dark:bg-black/20 rounded-lg">
                              {isPrivateContext ? 'No private media found' : 'No public media found'}
                          </div>
                      )}
                      {activeAllMedia.length > 9 && (
                          <button className="w-full py-3 text-wa-teal text-sm font-medium hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover transition-colors">
                              View all media
                          </button>
                      )}
                  </div>
              );
          case 'images':
              return (
                  <div className="p-1">
                      {activeImages.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1">
                            {activeImages.map((m) => (
                                <div key={m.id} className="aspect-square relative cursor-pointer">
                                    <img src={m.mediaUrl || m.mediaUrls?.[0]} className="w-full h-full object-cover" alt="" />
                                </div>
                            ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-[#667781] dark:text-gray-500 text-sm bg-white/50 dark:bg-black/20 rounded-lg">No images found</div>
                      )}
                  </div>
              );
          case 'videos':
              return (
                  <div className="p-1">
                      {activeVideos.length > 0 ? (
                        <div className="grid grid-cols-3 gap-1">
                            {activeVideos.map((m) => (
                                <div key={m.id} className="aspect-square relative cursor-pointer bg-black/80 flex items-center justify-center text-white">
                                    <VideoIcon size={32} />
                                    <span className="absolute bottom-1 right-1 text-[10px] bg-black/60 px-1 rounded">{m.duration}</span>
                                </div>
                            ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-[#667781] dark:text-gray-500 text-sm bg-white/50 dark:bg-black/20 rounded-lg">No videos found</div>
                      )}
                  </div>
              );
          case 'doc':
               if (isPrivateContext) return <div className="py-8 text-center text-[#667781] dark:text-gray-500 text-sm bg-white/50 dark:bg-black/20 rounded-lg">No private documents</div>;
               
               return (
                   <div className="flex flex-col">
                       {documents.length > 0 ? documents.map(doc => (
                           <div key={doc.id} className="flex items-center gap-3 p-3 hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50 cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 bg-white/60 dark:bg-wa-dark-header/60 backdrop-blur-sm">
                               <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-500">
                                   <FileText size={20} />
                               </div>
                               <div className="flex-1 min-w-0">
                                   <h4 className="text-[#111b21] dark:text-gray-100 text-sm font-medium truncate">{doc.name}</h4>
                                   <p className="text-[#667781] dark:text-gray-500 text-xs">{doc.size} • {doc.date} • {doc.type.toUpperCase()}</p>
                               </div>
                               <Download size={18} className="text-[#667781] dark:text-gray-500" />
                           </div>
                       )) : (
                            <div className="py-8 text-center text-[#667781] dark:text-gray-500 text-sm bg-white/50 dark:bg-black/20 rounded-lg">No documents found</div>
                       )}
                   </div>
               );
          case 'analysis':
               const chartData = [
                  { label: 'Videos', value: stats.videos.size, color: stats.videos.color },
                  { label: 'Images', value: stats.images.size, color: stats.images.color },
                  { label: 'Docs', value: stats.docs.size, color: stats.docs.color },
                  { label: 'Text', value: stats.text.size, color: stats.text.color }
               ];
               const R = 36;
               const C = 2 * Math.PI * R;
               let currentOffset = 0;

               return (
                   <div className="p-5 bg-white/60 dark:bg-wa-dark-header/60 backdrop-blur-sm">
                       <div className="flex flex-col items-center mb-6">
                           <h4 className="text-sm font-medium text-[#111b21] dark:text-gray-100 mb-4 self-start">{isPrivateContext ? 'Private Storage' : 'Public Storage'}</h4>
                           <div className="relative w-48 h-48">
                               <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                                   <circle cx="50" cy="50" r={R} stroke="#e9edef" strokeWidth="12" fill="none" className="dark:stroke-gray-700" />
                                   {totalSize > 0 && chartData.map((item, i) => {
                                       const percent = item.value / totalSize;
                                       const dashArray = `${percent * C} ${C}`;
                                       const dashOffset = -currentOffset;
                                       currentOffset += percent * C;
                                       return (
                                           <circle 
                                               key={item.label}
                                               cx="50" cy="50" r={R}
                                               fill="none"
                                               stroke={item.color}
                                               strokeWidth="12"
                                               strokeDasharray={dashArray}
                                               strokeDashoffset={dashOffset}
                                               className="transition-all duration-500 ease-out"
                                           />
                                       );
                                   })}
                               </svg>
                               <div className="absolute inset-0 flex flex-col items-center justify-center">
                                   <span className="text-3xl font-light text-[#111b21] dark:text-gray-100">{totalSize.toFixed(1)}</span>
                                   <span className="text-xs text-[#667781] dark:text-gray-500 uppercase font-medium">MB Used</span>
                               </div>
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-2 gap-4 mb-6 px-2">
                            {chartData.map(item => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-[#111b21] dark:text-gray-200">{item.label}</span>
                                        <span className="text-xs text-[#667781] dark:text-gray-500">{item.value.toFixed(1)} MB</span>
                                    </div>
                                </div>
                            ))}
                       </div>

                       <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                           <h4 className="text-sm font-medium text-[#111b21] dark:text-gray-100 mb-3">{isPrivateContext ? 'Private Activity' : 'Public Activity'}</h4>
                           <div className="space-y-3">
                               <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#667781] dark:text-gray-400">Total Messages</span>
                                    <span className="font-medium text-[#111b21] dark:text-gray-100">{totalMsgs}</span>
                               </div>
                               <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#667781] dark:text-gray-400">Text Messages</span>
                                    <span className="font-medium text-[#111b21] dark:text-gray-100">{stats.text.count}</span>
                               </div>
                               <div className="flex justify-between items-center text-sm">
                                    <span className="text-[#667781] dark:text-gray-400">Media Files</span>
                                    <span className="font-medium text-[#111b21] dark:text-gray-100">{stats.images.count + stats.videos.count}</span>
                               </div>
                           </div>
                       </div>
                   </div>
               );
          default:
              return null;
      }
  };

  const renderMediaSection = (isPrivateContext: boolean) => (
      <div className={`${cardBgClass} mb-3 transition-colors overflow-hidden rounded-lg`}>
           <div 
                className="px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50"
                onClick={() => setIsMediaSectionExpanded(!isMediaSectionExpanded)}
           >
                <div className="flex flex-col">
                    <h3 className="text-sm text-[#111b21] dark:text-gray-100 font-medium flex items-center gap-2">
                        {isPrivateContext ? 'Private Media' : 'Media, Docs & Analysis'}
                    </h3>
                    <p className="text-[10px] text-gray-400">
                        {isPrivateContext ? `${activeAllMedia.length} secured files` : `${activeAllMedia.length} files • ${documents.length} docs`}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-[#667781] dark:text-gray-500">{isMediaSectionExpanded ? 'Hide' : 'View'}</span>
                    <ChevronRight size={16} className={`text-[#667781] dark:text-gray-400 transition-transform duration-200 ${isMediaSectionExpanded ? 'rotate-90' : ''}`} />
                </div>
           </div>
           
           {isMediaSectionExpanded && (
               <div className="animate-in slide-in-from-top-2 duration-200">
                   {/* Filter Tabs */}
                   <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar border-b border-gray-100 dark:border-gray-800">
                       {['all', 'images', 'videos', 'doc', 'analysis'].map((f) => (
                           <button
                               key={f}
                               onClick={() => setMediaFilter(f as MediaFilterType)}
                               className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors whitespace-nowrap
                                   ${mediaFilter === f 
                                       ? 'bg-wa-teal text-white shadow-sm' 
                                       : 'bg-gray-100 dark:bg-wa-dark-paper text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                                   }
                               `}
                           >
                               {f === 'doc' ? 'Docs' : f}
                           </button>
                       ))}
                   </div>

                   {/* Content */}
                   <div className="min-h-[150px]">
                       {renderMediaContent(isPrivateContext)}
                   </div>
                   
                   {/* Media Visibility Option (Only if public) */}
                   {mediaFilter !== 'analysis' && !isPrivateContext && !chat.isLocked && (
                        <div className="border-t border-gray-100 dark:border-gray-800">
                            <div 
                                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50"
                                onClick={() => setIsMediaPrivacyOpen(!isMediaPrivacyOpen)}
                            >
                                <span className="text-sm text-[#111b21] dark:text-gray-100">Media visibility</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#667781] dark:text-gray-500">{mediaVisibility}</span>
                                    <ChevronRight size={16} className={`text-[#667781] dark:text-gray-400 transition-transform duration-200 ${isMediaPrivacyOpen ? 'rotate-90' : ''}`} />
                                </div>
                            </div>
                            
                            {isMediaPrivacyOpen && (
                                <div className="px-6 pb-4 animate-in slide-in-from-top-2 duration-200">
                                     <p className="text-xs text-[#667781] dark:text-gray-500 mb-3 leading-relaxed">
                                         Show newly downloaded media from this chat in your device's gallery?
                                     </p>
                                     <div className="flex flex-col gap-3">
                                         {['Default (Yes)', 'Yes', 'No'].map(opt => (
                                             <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${mediaVisibility === opt ? 'border-wa-teal' : 'border-gray-400 dark:border-gray-500 group-hover:border-gray-600'}`}>
                                                     {mediaVisibility === opt && <div className="w-2.5 h-2.5 rounded-full bg-wa-teal"></div>}
                                                 </div>
                                                 <span className="text-sm text-[#111b21] dark:text-gray-100">{opt}</span>
                                                 <input 
                                                    type="radio" 
                                                    name="mediaVisibility" 
                                                    className="hidden" 
                                                    checked={mediaVisibility === opt} 
                                                    onChange={() => setMediaVisibility(opt)}
                                                 />
                                             </label>
                                         ))}
                                     </div>
                                </div>
                            )}
                        </div>
                   )}
               </div>
           )}
      </div>
  );

  const containerStyle = chatSettings.contactInfoBackgroundImage ? {
      backgroundImage: `url(${chatSettings.contactInfoBackgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
  } : {};

  // --- ADD PARTICIPANT SCREEN ---
  if (showAddParticipants) {
      const allUsers = Object.values(users) as User[];
      const availableUsers = allUsers.filter(u => 
          u.id !== currentUserId && 
          !chat.groupParticipants?.includes(u.id) &&
          u.name.toLowerCase().includes(participantSearch.toLowerCase())
      );

      return (
          <div className="flex flex-col h-full bg-white dark:bg-wa-dark-bg animate-in slide-in-from-right duration-200">
              <div className="h-[60px] bg-wa-teal dark:bg-wa-dark-header flex items-center px-4 shrink-0 shadow-sm text-white">
                  <button onClick={() => setShowAddParticipants(false)} className="mr-3 p-1 rounded-full active:bg-white/10">
                      <ArrowLeft size={24} />
                  </button>
                  <div className="flex-1">
                      <h2 className="text-xl font-medium">Add participants</h2>
                      {selectedToAdd.size > 0 && <span className="text-xs opacity-80">{selectedToAdd.size} selected</span>}
                  </div>
              </div>

              <div className="p-2 border-b border-wa-border dark:border-wa-dark-border bg-white dark:bg-wa-dark-bg">
                   <div className="bg-wa-grayBg dark:bg-wa-dark-input rounded-lg px-4 py-2 flex items-center gap-4 text-wa-gray dark:text-gray-400 h-9">
                     <Search size={18} />
                     <input 
                       autoFocus
                       type="text" 
                       placeholder="Search..." 
                       className="bg-transparent outline-none text-sm w-full text-black dark:text-white placeholder:text-wa-gray dark:placeholder:text-gray-500"
                       value={participantSearch}
                       onChange={(e) => setParticipantSearch(e.target.value)}
                     />
                   </div>
              </div>

              {/* Selected Chips */}
              {selectedToAdd.size > 0 && (
                  <div className="flex gap-2 p-2 overflow-x-auto border-b border-wa-border dark:border-wa-dark-border no-scrollbar bg-white dark:bg-wa-dark-bg">
                      {(Array.from(selectedToAdd) as string[]).map((id) => {
                          const u = users[id];
                          return (
                              <div key={id} onClick={() => toggleSelectUser(id)} className="flex items-center gap-1 bg-gray-100 dark:bg-wa-dark-paper rounded-full pl-1 pr-2 py-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 shrink-0">
                                  <img src={u?.avatar} className="w-5 h-5 rounded-full" alt="" />
                                  <span className="text-xs text-[#111b21] dark:text-gray-200">{u?.name.split(' ')[0]}</span>
                                  <X size={12} className="text-gray-500" />
                              </div>
                          )
                      })}
                  </div>
              )}

              <div className="flex-1 overflow-y-auto pb-20">
                   {availableUsers.map(user => {
                       const isSelected = selectedToAdd.has(user.id);
                       return (
                           <div 
                              key={user.id} 
                              onClick={() => toggleSelectUser(user.id)}
                              className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover active:bg-[#e9edef] dark:active:bg-wa-dark-paper transition-colors"
                           >
                               <div className="relative">
                                   <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                   {isSelected && (
                                       <div className="absolute -bottom-1 -right-1 bg-wa-teal rounded-full p-0.5 border-2 border-white dark:border-wa-dark-bg">
                                           <Check size={10} className="text-white" strokeWidth={3} />
                                       </div>
                                   )}
                               </div>
                               <div className="flex-1 border-b border-wa-border dark:border-wa-dark-border pb-3 -mb-3">
                                   <h3 className={`text-[17px] font-medium ${isSelected ? 'text-[#111b21] dark:text-gray-100' : 'text-[#111b21] dark:text-gray-100'}`}>
                                       {user.name}
                                   </h3>
                                   <p className="text-[14px] text-[#667781] dark:text-gray-500 truncate">{user.about}</p>
                               </div>
                           </div>
                       );
                   })}
              </div>

              {selectedToAdd.size > 0 && (
                  <div className="absolute bottom-0 w-full p-4 bg-white/90 dark:bg-wa-dark-bg/90 backdrop-blur-sm border-t border-wa-border dark:border-wa-dark-border flex justify-center">
                      <button 
                          onClick={handleAddParticipants}
                          className="bg-wa-teal text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                      >
                          <Check size={24} />
                      </button>
                  </div>
              )}
          </div>
      );
  }

  // --- MAIN RENDER ---

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5] dark:bg-[#0b141a] overflow-hidden relative">
      {/* Auth Modal */}
      {showAuthModal && createPortal(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl w-full max-w-xs p-6 flex flex-col items-center">
                <div className="w-12 h-12 bg-wa-teal rounded-full flex items-center justify-center mb-4 text-white">
                    <Lock size={24} />
                </div>
                <h3 className="text-lg font-medium text-[#111b21] dark:text-gray-100 mb-2">
                    {authMode === 'chat_lock' ? 'Chat Lock' : 'Private Tab'}
                </h3>
                <p className="text-sm text-[#667781] dark:text-gray-400 mb-6 text-center">
                    Enter PIN to {authMode === 'chat_lock' ? (chat.isLocked ? 'unlock this chat' : 'lock this chat') : 'access private messages'}
                </p>
                
                <input 
                    type="password" 
                    maxLength={4}
                    value={authPin}
                    onChange={(e) => {
                        setAuthPin(e.target.value);
                        setAuthError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAuthVerify()}
                    className="w-full text-center text-2xl tracking-[0.5em] font-medium py-2 border-b-2 border-wa-teal bg-transparent outline-none mb-2 text-[#111b21] dark:text-gray-100 placeholder-transparent"
                    placeholder="****"
                    autoFocus
                />
                
                {authError && <p className="text-red-500 text-xs mb-4">{authError}</p>}

                <div className="flex gap-3 w-full mt-4">
                    <button onClick={() => setShowAuthModal(false)} className="flex-1 py-2 text-wa-teal font-medium hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-full transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleAuthVerify} className="flex-1 py-2 bg-wa-teal text-white font-medium rounded-full shadow-sm hover:shadow-md transition-all">
                        {authMode === 'chat_lock' && chat.isLocked ? 'Unlock' : 'Verify'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
      )}

      {/* Header */}
      <div className="h-[60px] bg-wa-grayBg dark:bg-wa-dark-header flex items-center px-4 shrink-0 shadow-sm transition-colors sticky top-0 z-20">
          <button onClick={() => navigate(`/chat/${chatId}`)} className="mr-3 p-1 rounded-full active:bg-black/10 text-[#54656f] dark:text-gray-400">
              <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
              <h2 className="text-xl font-medium text-[#111b21] dark:text-gray-100">
                  {isGroup ? 'Group Info' : 'Contact Info'}
              </h2>
          </div>
          <button ref={menuButtonRef} onClick={handleMenuToggle} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#54656f] dark:text-gray-400">
              <MoreVertical size={20} />
          </button>
          
          {/* Context Menu */}
          {isMenuOpen && (
              <>
                  <div className="fixed inset-0 z-30" onClick={() => setIsMenuOpen(false)}></div>
                  <div 
                      style={{ top: menuPos.top, right: menuPos.right }}
                      className="absolute w-48 bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl border border-wa-border dark:border-gray-700 z-40 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right"
                  >
                      {isGroup && isAdmin && (
                          <button className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">Change Subject</button>
                      )}
                      <button className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">Export Chat</button>
                      {isAdmin && <button className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">Group Settings</button>}
                  </div>
              </>
          )}
      </div>

      <div className="flex-1 overflow-y-auto pb-10" style={containerStyle}>
          {/* Profile Header */}
          <div className={`flex flex-col items-center py-6 mb-2 text-center ${cardBgClass}`}>
              <div className="relative group mb-4">
                  <img src={avatar} alt="Profile" className="w-32 h-32 rounded-full object-cover shadow-sm" />
                  <div className="absolute inset-0 bg-black/20 rounded-full hidden group-hover:flex items-center justify-center cursor-pointer">
                      <div className="text-white text-xs font-medium uppercase text-center px-2">View Photo</div>
                  </div>
              </div>
              <h2 className="text-2xl font-medium text-[#111b21] dark:text-gray-100 mb-1">{title}</h2>
              <p className="text-base text-[#667781] dark:text-gray-400">{subtitle}</p>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6 w-full justify-center px-4">
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-wa-teal group-hover:bg-gray-50 dark:group-hover:bg-white/5 transition-colors shadow-sm">
                          <Phone size={20} />
                      </div>
                      <span className="text-xs text-wa-teal font-medium">Audio</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-wa-teal group-hover:bg-gray-50 dark:group-hover:bg-white/5 transition-colors shadow-sm">
                          <VideoIcon size={20} />
                      </div>
                      <span className="text-xs text-wa-teal font-medium">Video</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 cursor-pointer group">
                      <div className="w-10 h-10 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-wa-teal group-hover:bg-gray-50 dark:group-hover:bg-white/5 transition-colors shadow-sm">
                          <Search size={20} />
                      </div>
                      <span className="text-xs text-wa-teal font-medium">Search</span>
                  </div>
              </div>
          </div>

          {/* About / Description */}
          {chat.isGroup ? (
              <div className={`${cardBgClass} mb-3 px-4 py-3`}>
                  <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-[#111b21] dark:text-gray-100 font-medium">Group Description</span>
                      {isAdmin && <button className="p-1 text-wa-teal"><Edit2 size={16} /></button>}
                  </div>
                  <p className="text-sm text-[#54656f] dark:text-gray-400">Welcome to the group!</p>
                  <p className="text-xs text-[#667781] dark:text-gray-500 mt-2">Created by {users[chat.groupParticipants?.[0] || '']?.name}, {new Date(chat.timestamp).toLocaleDateString()}</p>
              </div>
          ) : (
              <div className={`${cardBgClass} mb-3 px-4 py-3`}>
                  <h3 className="text-base text-[#111b21] dark:text-gray-100 mb-1">{contact?.about || "Hey there! I am using WhatsApp."}</h3>
                  <p className="text-xs text-[#667781] dark:text-gray-500">{new Date().toLocaleDateString()}</p>
              </div>
          )}

          {/* Media Section */}
          {renderMediaSection(false)}

          {/* Settings Section */}
          <div className={`${cardBgClass} mb-3`}>
              <div className="px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                      <div className="text-[#667781] dark:text-gray-400"><Bell size={20} /></div>
                      <div className="flex flex-col">
                          <span className="text-base text-[#111b21] dark:text-gray-100">Mute notifications</span>
                      </div>
                  </div>
                  {/* Toggle Switch */}
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${chat.isMuted ? 'bg-wa-teal' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${chat.isMuted ? 'translate-x-4' : ''}`}></div>
                  </div>
              </div>
              <div className="px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                      <div className="text-[#667781] dark:text-gray-400"><Music size={20} /></div>
                      <div className="flex flex-col">
                          <span className="text-base text-[#111b21] dark:text-gray-100">Custom notifications</span>
                      </div>
                  </div>
              </div>
              <div className="px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50" onClick={() => navigate(`/chat/${chatId}`)}>
                  <div className="flex items-center gap-4">
                      <div className="text-[#667781] dark:text-gray-400"><ImageIcon size={20} /></div>
                      <div className="flex flex-col">
                          <span className="text-base text-[#111b21] dark:text-gray-100">Media visibility</span>
                      </div>
                  </div>
              </div>
          </div>

          <div className={`${cardBgClass} mb-3`}>
              <div className="px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                      <div className="text-[#667781] dark:text-gray-400"><Shield size={20} /></div>
                      <div className="flex flex-col">
                          <span className="text-base text-[#111b21] dark:text-gray-100">Encryption</span>
                          <span className="text-xs text-[#667781] dark:text-gray-500">Messages and calls are end-to-end encrypted. Tap to verify.</span>
                      </div>
                  </div>
              </div>
              <div className="px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-4">
                      <div className="text-[#667781] dark:text-gray-400"><Clock size={20} /></div>
                      <div className="flex flex-col">
                          <span className="text-base text-[#111b21] dark:text-gray-100">Disappearing messages</span>
                          <span className="text-xs text-[#667781] dark:text-gray-500">Off</span>
                      </div>
                  </div>
              </div>
              <div 
                  className="px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50"
                  onClick={handleChatLockClick}
              >
                  <div className="flex items-center gap-4">
                      <div className="text-[#667781] dark:text-gray-400"><Lock size={20} /></div>
                      <div className="flex flex-col">
                          <span className="text-base text-[#111b21] dark:text-gray-100">Chat Lock</span>
                          <span className="text-xs text-[#667781] dark:text-gray-500">
                              {chat.isLocked ? 'On' : 'Off'}
                          </span>
                      </div>
                  </div>
                  <div className={`w-10 h-6 rounded-full relative transition-colors ${chat.isLocked ? 'bg-wa-teal' : 'bg-gray-300 dark:bg-gray-600'}`}>
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${chat.isLocked ? 'translate-x-4' : ''}`}></div>
                  </div>
              </div>
          </div>

          {/* Group Participants */}
          {isGroup && (
              <div className={`${cardBgClass} mb-3`}>
                  <div className="px-4 py-3 flex justify-between items-center">
                      <span className="text-sm text-[#667781] dark:text-gray-400 font-medium">
                          {chat.groupParticipants?.length} participants
                      </span>
                      <Search size={18} className="text-[#667781] dark:text-gray-400" />
                  </div>

                  {canAddParticipants && (
                      <div 
                          onClick={() => setShowAddParticipants(true)}
                          className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50"
                      >
                          <div className="w-10 h-10 rounded-full bg-wa-teal flex items-center justify-center text-white">
                              <UserPlus size={20} />
                          </div>
                          <span className="text-base text-[#111b21] dark:text-gray-100">Add participants</span>
                      </div>
                  )}

                  <div className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50">
                      <div className="w-10 h-10 rounded-full bg-wa-teal/10 flex items-center justify-center text-wa-teal">
                          <Link size={20} />
                      </div>
                      <span className="text-base text-[#111b21] dark:text-gray-100">Invite via link</span>
                  </div>

                  {chat.groupParticipants?.map(pid => {
                      const p = users[pid];
                      const role = chat.groupRoles?.[pid];
                      return (
                          <div key={pid} className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50 border-t border-gray-100 dark:border-gray-800">
                              <img src={p?.avatar} alt={p?.name} className="w-10 h-10 rounded-full object-cover" />
                              <div className="flex-1 flex justify-between items-center">
                                  <div className="flex flex-col">
                                      <span className="text-base text-[#111b21] dark:text-gray-100 font-normal">
                                          {pid === currentUserId ? 'You' : p?.name}
                                      </span>
                                      <span className="text-xs text-[#667781] dark:text-gray-500">{p?.about?.slice(0, 30)}</span>
                                  </div>
                                  {role && role !== 'member' && (
                                      <span className="text-xs text-wa-teal border border-wa-teal/30 px-1.5 py-0.5 rounded bg-wa-teal/5 capitalize">
                                          {role}
                                      </span>
                                  )}
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}

          {/* Block / Exit */}
          <div className={`${cardBgClass} mb-10`}>
              {isGroup ? (
                  <div className="flex items-center gap-4 px-4 py-4 text-red-500 cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50">
                      <LogOut size={20} />
                      <span className="text-base font-medium">Exit Group</span>
                  </div>
              ) : (
                  <div className="flex items-center gap-4 px-4 py-4 text-red-500 cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50">
                      <Ban size={20} />
                      <span className="text-base font-medium">Block {contact?.name}</span>
                  </div>
              )}
              <div className="flex items-center gap-4 px-4 py-4 text-red-500 cursor-pointer hover:bg-wa-grayBg/50 dark:hover:bg-wa-dark-hover/50 border-t border-gray-100 dark:border-gray-800">
                  <Trash2 size={20} />
                  <span className="text-base font-medium">Report {isGroup ? 'Group' : contact?.name}</span>
              </div>
          </div>
      </div>
    </div>
  );
};

export default GroupInfo;
