import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical, Phone, Video, Smile, Paperclip, Mic, Send, Check, CheckCheck, ChevronDown, Pin, Trash2, Reply, X, Lock, Ban, Languages, Star, Forward, ChevronLeft, ChevronRight, Gamepad2, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { Message } from '../types';

const REACTIONS_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const MessageCarousel = ({ mediaUrls }: { mediaUrls: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev === 0 ? mediaUrls.length - 1 : prev - 1));
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex(prev => (prev === mediaUrls.length - 1 ? 0 : prev + 1));
    };

    if (!mediaUrls || mediaUrls.length === 0) return null;

    return (
        <div className="relative w-full max-w-[300px] md:max-w-[340px] rounded-lg overflow-hidden bg-black/10 dark:bg-black/20 mb-1 aspect-square group">
             <img 
                src={mediaUrls[currentIndex]} 
                alt={`Slide ${currentIndex + 1}`} 
                className="w-full h-full object-cover animate-in fade-in duration-300"
             />
             {mediaUrls.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {currentIndex + 1}/{mediaUrls.length}
                </div>
             )}
             {mediaUrls.length > 1 && (
                 <>
                    <button 
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-md transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                    >
                        <ChevronLeft size={16} strokeWidth={2.5} />
                    </button>
                    <button 
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-md transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                    >
                        <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                 </>
             )}
             {mediaUrls.length > 1 && (
                 <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10 pointer-events-none">
                     {mediaUrls.map((_, idx) => (
                         <div 
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all ${idx === currentIndex ? 'bg-white scale-125 opacity-100' : 'bg-white/50'}`}
                         />
                     ))}
                 </div>
             )}
        </div>
    );
};

const ChatWindow = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { chats, messages, addMessage, deleteMessages, togglePinMessage, addReaction, toggleArchiveChat, toggleDateLock, currentUser, currentUserId, users, language, chatSettings, securitySettings } = useApp();
  const { openGameInvite } = useGame();

  const [inputText, setInputText] = useState('');
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<number | null>(null);
  
  const [selectedMessageIds, setSelectedMessageIds] = useState<Set<string>>(new Set());
  const isSelectionMode = selectedMessageIds.size > 0;
  
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const [translatedMessageIds, setTranslatedMessageIds] = useState<Set<string>>(new Set());

  const [dateLockModal, setDateLockModal] = useState<{ isOpen: boolean; date: string | null }>({ isOpen: false, date: null });
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chat = chats.find(c => c.id === chatId);
  // Allow for group or contact resolution
  const contact = chat ? (chat.isGroup ? null : users[chat.contactId]) : null;
  
  const currentMessages = chatId ? (messages[chatId] || []) : [];
  
  const pinnedMessages = currentMessages.filter(m => m.isPinned && !m.isDeleted);

  const groupedMessages = currentMessages.reduce((acc, msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(msg);
      return acc;
  }, {} as Record<string, Message[]>);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length, replyMessage]); 

  useEffect(() => {
      if (replyMessage && inputRef.current) {
          inputRef.current.focus();
      }
  }, [replyMessage]);
  
  useEffect(() => {
      return () => {
          if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
          if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      };
  }, []);

  if (!chat) {
      return (
          <div className="flex flex-col items-center justify-center h-full w-full bg-[#f0f2f5] dark:bg-wa-dark-border border-b-[6px] border-wa-teal dark:border-wa-tealDark transition-colors">
              <div className="flex flex-col items-center max-w-md text-center px-4">
                   <div className="w-[300px] h-[200px] mb-8 relative">
                        {/* Placeholder for illustration */}
                        <img src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae.svg" alt="" className="w-full h-full opacity-60 dark:opacity-40" />
                   </div>
                   <h1 className="text-3xl font-light text-[#41525d] dark:text-gray-300 mb-4">
                       Select a chat to start messaging
                   </h1>
                   <p className="text-[#667781] dark:text-gray-400 text-sm mb-8">
                       Send and receive messages without keeping your phone online. <br/>
                       Use WhatsApp on up to 4 linked devices and 1 phone.
                   </p>
                   <button 
                    onClick={() => navigate('/new-chat')}
                    className="bg-wa-teal text-white px-6 py-2.5 rounded-full font-medium hover:shadow-md transition-all active:scale-95"
                   >
                       Start New Chat
                   </button>
              </div>
          </div>
      );
  }

  // Display details
  const displayTitle = chat.isGroup ? chat.groupName : contact?.name;
  const displayAvatar = chat.isGroup ? 'https://picsum.photos/300' : contact?.avatar;
  const displaySubtitle = chat.isGroup ? 'Tap for group info' : 'Tap for contact info';

  const handleSend = () => {
    if (!inputText.trim() || !chatId) return;
    addMessage(chatId, inputText, 'text', replyMessage?.id);
    setInputText('');
    setReplyMessage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && chatId) {
          const reader = new FileReader();
          reader.onloadend = () => {
              addMessage(chatId, '', 'image', replyMessage?.id, reader.result as string);
              setReplyMessage(null);
          };
          reader.readAsDataURL(file);
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = (e: React.SyntheticEvent) => {
      e.preventDefault(); // Prevent focus loss/selection
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = window.setInterval(() => {
          setRecordingDuration(prev => prev + 1);
      }, 1000);
  };

  const stopRecording = (shouldCancel = false) => {
      if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
      }
      
      setIsRecording(false);
      
      if (!shouldCancel && recordingDuration >= 1 && chatId) {
          const minutes = Math.floor(recordingDuration / 60);
          const seconds = recordingDuration % 60;
          const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
          addMessage(chatId, '', 'voice', replyMessage?.id, undefined, durationStr);
          setReplyMessage(null);
      }
      setRecordingDuration(0);
  };

  const formatDuration = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startLongPress = (msgId: string) => {
    isLongPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
        isLongPressTriggeredRef.current = true;
        toggleSelection(msgId);
        if (navigator.vibrate) navigator.vibrate(50);
    }, 500); 
  };

  const endLongPress = () => {
    if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    }
  };

  const handleBubbleClick = (e: React.MouseEvent, msgId: string) => {
      e.stopPropagation();
      if (isLongPressTriggeredRef.current) {
          isLongPressTriggeredRef.current = false;
          return;
      }
      if (isSelectionMode) {
          toggleSelection(msgId);
      } else {
          setActiveMessageId(activeMessageId === msgId ? null : msgId);
      }
  };

  const toggleSelection = (msgId: string) => {
      setSelectedMessageIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(msgId)) {
              newSet.delete(msgId);
          } else {
              newSet.add(msgId);
          }
          return newSet;
      });
      setActiveMessageId(null);
  };

  const clearSelection = () => {
      setSelectedMessageIds(new Set());
  };

  const handleArchive = () => {
      if (chatId) {
          toggleArchiveChat(chatId);
          navigate('/chats');
      }
  };

  const handleReply = (msg: Message) => {
      setReplyMessage(msg);
      setActiveMessageId(null);
  };

  const handleDelete = (deleteForEveryone: boolean) => {
      if (selectedMessageIds.size > 0 && chatId) {
          deleteMessages(chatId, Array.from(selectedMessageIds), deleteForEveryone);
          setIsDeleteModalOpen(false);
          clearSelection();
      }
  };

  const handleTranslate = (msgId: string) => {
      setTranslatedMessageIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(msgId)) {
              newSet.delete(msgId);
          } else {
              newSet.add(msgId);
          }
          return newSet;
      });
      setActiveMessageId(null);
  }

  const canDeleteForEveryone = Array.from(selectedMessageIds).every(id => {
      const msg = currentMessages.find(m => m.id === id);
      return msg && msg.senderId === currentUser.id;
  });

  const handleDateDoubleClick = (date: string) => {
      setDateLockModal({ isOpen: true, date });
      setPin('');
      setError('');
  };

  const confirmDateLock = () => {
      const requiredPin = securitySettings.chatLockPassword || '0000';
      if (pin === requiredPin) {
          if (dateLockModal.date && chatId) {
              toggleDateLock(chatId, dateLockModal.date);
              setDateLockModal({ isOpen: false, date: null });
          }
      } else {
          setError('Incorrect PIN');
          setPin('');
      }
  };

  const formatDateHeader = (dateString: string) => {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getTranslatedText = (text: string, targetLang: string) => {
      return `[${targetLang}]: ${text}`;
  }

  const getFontSizeClass = () => {
      switch(chatSettings.fontSize) {
          case 'small': return 'text-[13px]';
          case 'large': return 'text-[17px]';
          default: return 'text-[15px]';
      }
  };

  return (
    <div className="flex flex-col h-full w-full bg-wa-bg relative dark:bg-[#0b141a]">
      <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: '400px' }}>
      </div>

      <input 
          type="file" 
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageSelect}
      />

      {isDeleteModalOpen && createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl w-full max-w-sm p-4 flex flex-col z-50">
                  <h3 className="text-lg font-medium text-[#111b21] dark:text-gray-100 mb-4 px-2">
                      Delete {selectedMessageIds.size} message{selectedMessageIds.size > 1 ? 's' : ''}?
                  </h3>
                  
                  <div className="flex flex-col gap-1 items-end">
                      {canDeleteForEveryone && (
                          <button 
                            onClick={() => handleDelete(true)}
                            className="w-full text-right px-4 py-3 text-wa-teal hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-md transition-colors font-medium"
                          >
                              Delete for everyone
                          </button>
                      )}
                      <button 
                          onClick={() => handleDelete(false)}
                          className="w-full text-right px-4 py-3 text-wa-teal hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-md transition-colors font-medium"
                      >
                          Delete for me
                      </button>
                      <button 
                          onClick={() => setIsDeleteModalOpen(false)}
                          className="w-full text-right px-4 py-3 text-wa-teal hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-md transition-colors font-medium border-t border-gray-100 dark:border-gray-700 mt-1"
                      >
                          Cancel
                      </button>
                  </div>
              </div>
          </div>,
          document.body
      )}

      {dateLockModal.isOpen && createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl w-full max-w-xs p-6 flex flex-col items-center">
                  <div className="w-12 h-12 bg-wa-teal rounded-full flex items-center justify-center mb-4 text-white">
                      <Lock size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-[#111b21] dark:text-gray-100 mb-2">
                      Authentication
                  </h3>
                  <p className="text-sm text-[#667781] dark:text-gray-400 mb-6 text-center">Enter PIN to {chat.hiddenDates?.includes(dateLockModal.date!) ? 'unlock' : 'lock'} this date</p>
                  
                  <input 
                      type="password" 
                      maxLength={4}
                      value={pin}
                      onChange={(e) => {
                          setPin(e.target.value);
                          setError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && confirmDateLock()}
                      className="w-full text-center text-2xl tracking-[0.5em] font-medium py-2 border-b-2 border-wa-teal bg-transparent outline-none mb-2 text-[#111b21] dark:text-gray-100 placeholder-transparent"
                      placeholder="****"
                      autoFocus
                  />
                  
                  {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

                  <div className="flex gap-3 w-full mt-4">
                      <button onClick={() => setDateLockModal({ isOpen: false, date: null })} className="flex-1 py-2 text-wa-teal font-medium hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-full transition-colors">
                          Cancel
                      </button>
                      <button onClick={confirmDateLock} className="flex-1 py-2 bg-wa-teal text-white font-medium rounded-full shadow-sm hover:shadow-md transition-all">
                          Verify
                      </button>
                  </div>
              </div>
          </div>,
          document.body
      )}

      {isSelectionMode ? (
        <div className="h-[60px] bg-wa-teal dark:bg-wa-dark-header md:bg-wa-teal md:dark:bg-wa-dark-header flex items-center px-4 py-2 shrink-0 z-50 shadow-sm md:shadow-none md:border-b md:border-wa-border md:dark:border-wa-dark-border text-white transition-colors animate-in fade-in slide-in-from-top-2 relative">
             <div className="flex items-center gap-6 flex-1">
                 <button onClick={clearSelection} className="p-1 -ml-2 rounded-full active:bg-white/10">
                     <ArrowLeft size={24} />
                 </button>
                 <span className="text-xl font-medium">{selectedMessageIds.size}</span>
             </div>
             <div className="flex items-center gap-6">
                 <Star size={22} className="cursor-pointer hover:opacity-80" />
                 <Trash2 size={22} className="cursor-pointer hover:opacity-80" onClick={() => setIsDeleteModalOpen(true)} />
                 <Forward size={22} className="cursor-pointer hover:opacity-80" />
             </div>
        </div>
      ) : (
        <div 
            className="h-[60px] bg-wa-teal dark:bg-wa-dark-header md:bg-wa-grayBg md:dark:bg-wa-dark-header flex items-center px-2 py-2 shrink-0 z-50 shadow-sm md:shadow-none md:border-b md:border-wa-border md:dark:border-wa-dark-border text-white md:text-black md:dark:text-white transition-colors cursor-pointer relative"
            onClick={() => navigate(`/chat/${chatId}/info`)}
        >
            <button onClick={(e) => { e.stopPropagation(); navigate('/chats'); }} className="md:hidden p-2 mr-1 rounded-full active:bg-black/10">
            <ArrowLeft size={24} />
            </button>
            
            <div className="flex items-center gap-3 flex-1 min-w-0">
            <img src={displayAvatar} alt={displayTitle} className="w-10 h-10 rounded-full object-cover" />
            <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-base font-medium leading-tight truncate">{displayTitle}</h3>
                <span className="text-xs md:text-wa-gray dark:text-gray-400 text-white/80 md:text-black/60 truncate">
                {displaySubtitle}
                </span>
            </div>
            </div>

            <div className="flex items-center gap-4 px-2 md:text-wa-gray dark:text-gray-400 text-white" onClick={(e) => e.stopPropagation()}>
            <Video size={22} className="cursor-pointer" />
            <Phone size={20} className="cursor-pointer" />
            <div className="relative">
                <MoreVertical size={20} className="cursor-pointer" onClick={() => setShowMenu(!showMenu)} />
                
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40 cursor-default" onClick={() => setShowMenu(false)}></div>
                        <div className="absolute top-8 right-0 w-56 bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100 border border-wa-border dark:border-wa-dark-border origin-top-right overflow-hidden">
                            <button onClick={() => { setShowMenu(false); navigate(`/chat/${chatId}/info`); }} className="w-full text-left px-4 py-3 text-[14.5px] hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 transition-colors">
                                {chat.isGroup ? 'Group info' : 'Contact info'}
                            </button>
                            <button onClick={() => { setShowMenu(false); handleArchive(); }} className="w-full text-left px-4 py-3 text-[14.5px] hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 transition-colors">
                                {chat.isArchived ? 'Unarchive chat' : 'Archive chat'}
                            </button>
                            <button onClick={() => setShowMenu(false)} className="w-full text-left px-4 py-3 text-[14.5px] hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 transition-colors">
                                Mute notifications
                            </button>
                            <button onClick={() => setShowMenu(false)} className="w-full text-left px-4 py-3 text-[14.5px] hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 transition-colors">
                                Clear messages
                            </button>
                            <button onClick={() => { setShowMenu(false); navigate('/chats'); }} className="w-full text-left px-4 py-3 text-[14.5px] hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 transition-colors">
                                Close chat
                            </button>
                        </div>
                    </>
                )}
            </div>
            </div>
        </div>
      )}

      {pinnedMessages.length > 0 && !isSelectionMode && (
         <div 
            onClick={() => navigate(`/chat/${chatId}/info`)}
            className="bg-wa-grayBg dark:bg-wa-dark-header/90 backdrop-blur-sm px-4 py-2 flex items-center gap-3 text-sm z-40 border-b border-wa-border dark:border-wa-dark-border cursor-pointer relative"
         >
             <Pin size={16} className="text-wa-teal shrink-0" fill="currentColor" />
             <div className="flex-1 truncate text-[#111b21] dark:text-gray-200">
                <span className="font-medium">Pinned: </span>
                {pinnedMessages[pinnedMessages.length - 1].text}
             </div>
             <ChevronDown size={16} className="text-gray-500" />
         </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 z-10 flex flex-col gap-1 no-scrollbar" onClick={() => setActiveMessageId(null)}>
        
        {Object.keys(groupedMessages).map((dateString) => {
            const isHidden = chat.hiddenDates?.includes(dateString);
            const msgs = groupedMessages[dateString];

            return (
                <div key={dateString} className="flex flex-col">
                    <div className="flex justify-center my-4 select-none sticky top-2 z-30 pointer-events-none">
                        <div 
                            onDoubleClick={() => handleDateDoubleClick(dateString)}
                            className="bg-white/90 dark:bg-wa-dark-paper/90 shadow-sm rounded-lg px-3 py-1 text-xs font-medium text-[#54656f] dark:text-gray-300 uppercase cursor-pointer hover:scale-105 transition-transform flex items-center gap-2 pointer-events-auto"
                        >
                            {formatDateHeader(dateString)}
                            {isHidden && <Lock size={12} />}
                        </div>
                    </div>

                    {!isHidden && msgs.map((msg, index) => {
                        const isMe = msg.senderId === currentUserId;
                        const isFirstInSequence = index === 0 || msgs[index - 1].senderId !== msg.senderId;
                        const isActive = activeMessageId === msg.id;
                        const isSelected = selectedMessageIds.has(msg.id);
                        
                        const replyToMsg = msg.replyToId ? currentMessages.find(m => m.id === msg.replyToId) : null;
                        const replyUser = replyToMsg ? users[replyToMsg.senderId] : null;

                        const hasReactions = Object.values(msg.reactions || {}).length > 0;
                        const isTranslated = translatedMessageIds.has(msg.id);

                        const isMedia = msg.type === 'image' || msg.type === 'video';
                        const hasCarousel = msg.mediaUrls && msg.mediaUrls.length > 1;

                        return (
                            <div 
                                key={msg.id} 
                                className={`
                                    flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isFirstInSequence ? 'mt-1.5' : 'mt-0.5'} ${hasReactions ? 'mb-4' : 'mb-1'}
                                    ${isSelected ? 'bg-blue-200/20 dark:bg-blue-500/10 -mx-4 px-4 py-1' : ''}
                                `}
                            >
                                <div 
                                    onClick={(e) => handleBubbleClick(e, msg.id)}
                                    onMouseDown={() => startLongPress(msg.id)}
                                    onMouseUp={endLongPress}
                                    onMouseLeave={endLongPress}
                                    onTouchStart={() => startLongPress(msg.id)}
                                    onTouchEnd={endLongPress}
                                    onTouchMove={endLongPress}
                                    onContextMenu={(e) => e.preventDefault()}
                                    className={`
                                        relative px-2 py-1 max-w-[85%] md:max-w-[65%] rounded-lg shadow-[0_1px_0.5px_rgba(0,0,0,0.13)] select-none ${getFontSizeClass()}
                                        group
                                        ${isMe ? 'bg-wa-chatOutgoing dark:bg-wa-dark-chatOutgoing rounded-tr-none' : 'bg-white dark:bg-wa-dark-paper rounded-tl-none'}
                                        ${isActive ? 'z-20' : ''}
                                        ${isSelectionMode ? 'cursor-pointer' : ''}
                                        ${isSelected ? 'ring-2 ring-wa-teal ring-offset-1 dark:ring-offset-wa-dark-bg' : ''}
                                        flex flex-wrap gap-x-2 items-end
                                    `}
                                    style={{ 
                                        backgroundColor: isMe && !msg.isDeleted
                                            ? (chat.themeColor ? chat.themeColor : undefined)
                                            : !msg.isDeleted ? (chat.incomingThemeColor ? chat.incomingThemeColor : undefined) : undefined
                                    }}
                                >
                                    {isSelectionMode && (
                                        <div className="absolute inset-0 z-30 pointer-events-none"></div>
                                    )}

                                    {/* Content Block (Full width if reply/media, else fluid) */}
                                    <div className="min-w-0 max-w-full">
                                        {replyToMsg && replyUser && !msg.isDeleted && (
                                            <div className="bg-black/5 dark:bg-black/20 rounded-md p-1.5 mb-1 border-l-4 border-wa-teal text-xs cursor-pointer opacity-90 select-none">
                                                <div className="text-wa-teal font-medium mb-0.5">{replyUser.id === currentUserId ? 'You' : replyUser.name}</div>
                                                <div className="truncate text-[#111b21] dark:text-gray-300 line-clamp-1 opacity-70">{replyToMsg.text}</div>
                                            </div>
                                        )}

                                        <div className="leading-5 text-[#111b21] dark:text-gray-100 break-words whitespace-pre-wrap pt-1 pb-1">
                                            {msg.isDeleted ? (
                                                <div className="italic text-gray-500 dark:text-gray-400 flex items-center gap-2 py-0.5">
                                                    <Ban size={14} className="opacity-60" /> 
                                                    {msg.text}
                                                </div>
                                            ) : (
                                                <>
                                                    {msg.isPinned && (
                                                        <div className="text-[10px] text-wa-teal flex items-center gap-1 mb-1 font-medium">
                                                            <Pin size={10} fill="currentColor" /> Pinned
                                                        </div>
                                                    )}

                                                    {hasCarousel ? (
                                                        <MessageCarousel mediaUrls={msg.mediaUrls!} />
                                                    ) : isMedia && msg.mediaUrl ? (
                                                        <div className="mb-1 rounded-lg overflow-hidden bg-black/10 dark:bg-black/30">
                                                            <img src={msg.mediaUrl} alt="Media" className="w-full h-auto max-h-[400px] object-cover" />
                                                        </div>
                                                    ) : null}

                                                    {msg.type === 'voice' && <span className="italic flex items-center gap-2 text-gray-500 dark:text-gray-400"><Mic size={16}/> Voice Message ({msg.duration})</span>}
                                                    
                                                    {msg.text && !isTranslated && (
                                                        <span>{msg.text}</span>
                                                    )}

                                                    {isTranslated && msg.type === 'text' && (
                                                        <div className="pt-1 w-full animate-in fade-in slide-in-from-top-1">
                                                            <div className="relative p-2.5 bg-black/5 dark:bg-white/5 rounded-lg rounded-tl-sm border-l-[3px] border-wa-teal shadow-sm select-text">
                                                                <div className="flex justify-between items-center mb-2 gap-2">
                                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                                        <Languages size={12} className="text-wa-teal" />
                                                                        <span className="text-[10px] font-bold text-wa-teal uppercase tracking-wide">
                                                                            Translated ({language})
                                                                        </span>
                                                                    </div>
                                                                    <button 
                                                                        onClick={(e) => { e.stopPropagation(); handleTranslate(msg.id); }}
                                                                        className="text-[10px] font-medium text-wa-teal border border-wa-teal/30 hover:bg-wa-teal hover:text-white px-2 py-0.5 rounded-full transition-all shrink-0 whitespace-nowrap"
                                                                    >
                                                                        Show Original
                                                                    </button>
                                                                </div>
                                                                <div className="text-[#111b21] dark:text-gray-100 italic leading-relaxed text-[15px]">
                                                                    {getTranslatedText(msg.text, language)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {!msg.isDeleted && (
                                        <div className="flex justify-end items-center gap-1 ml-auto shrink-0 pb-1">
                                            <span className="text-[11px] text-[#667781] dark:text-gray-400 min-w-fit">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase()}
                                            </span>
                                            {isMe && (
                                                <span className="flex items-center">
                                                    {msg.status === 'read' && <CheckCheck size={16} className="text-wa-blue" />}
                                                    {msg.status === 'delivered' && <CheckCheck size={16} className="text-[#667781] dark:text-gray-400" />}
                                                    {msg.status === 'sent' && <Check size={16} className="text-[#667781] dark:text-gray-400" />}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {hasReactions && !msg.isDeleted && (
                                        <div className={`absolute -bottom-3 ${isMe ? 'right-0' : 'left-0'} z-50`}>
                                            <div className="bg-white dark:bg-wa-dark-paper border border-wa-border dark:border-wa-dark-border rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-sm text-xs cursor-pointer hover:bg-gray-50 dark:hover:bg-wa-dark-hover whitespace-nowrap">
                                                {Array.from(new Set(Object.values(msg.reactions || {}))).slice(0, 3).map((emoji, i) => (
                                                    <span key={i}>{emoji}</span>
                                                ))}
                                                {Object.values(msg.reactions || {}).length > 1 && (
                                                    <span className="text-[#667781] dark:text-gray-400 ml-0.5 font-medium">{Object.values(msg.reactions || {}).length}</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {!msg.isDeleted && !isSelectionMode && (
                                        <div className={`absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 ${isActive ? 'opacity-100' : ''} transition-opacity`}>
                                            <div className="bg-gradient-to-l from-black/10 to-transparent rounded-full p-1 cursor-pointer" onClick={(e) => { e.stopPropagation(); /* Logic handled by overlay */ }}>
                                                <ChevronDown size={18} className="text-[#667781] dark:text-gray-300" />
                                            </div>
                                        </div>
                                    )}

                                    {!msg.isDeleted && !isSelectionMode && (
                                        <div className={`
                                            absolute -top-10 bg-white dark:bg-wa-dark-paper rounded-full shadow-lg p-1.5 flex gap-1 items-center animate-in fade-in zoom-in duration-200 z-50
                                            ${isMe ? 'right-0 origin-bottom-right' : 'left-0 origin-bottom-left'}
                                            ${isActive || 'hidden group-hover:flex'}
                                        `}>
                                            {REACTIONS_LIST.map(emoji => (
                                                <button 
                                                    key={emoji}
                                                    onClick={(e) => { e.stopPropagation(); addReaction(chatId!, msg.id, emoji); setActiveMessageId(null); }}
                                                    className={`p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-lg transition-transform hover:scale-125 ${msg.reactions?.[currentUser.id] === emoji ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                            <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleReply(msg); }}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300"
                                                title="Reply"
                                            >
                                                <Reply size={16} />
                                            </button>
                                            
                                            {msg.type === 'text' && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleTranslate(msg.id); }}
                                                    className={`p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300 ${isTranslated ? 'text-wa-teal' : ''}`}
                                                    title={isTranslated ? "Show Original" : "Translate"}
                                                >
                                                    <Languages size={16} />
                                                </button>
                                            )}

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); togglePinMessage(chatId!, msg.id); setActiveMessageId(null); }}
                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300"
                                                title={msg.isPinned ? "Unpin" : "Pin"}
                                            >
                                                <Pin size={16} fill={msg.isPinned ? "currentColor" : "none"} />
                                            </button>

                                            <button 
                                                onClick={(e) => { e.stopPropagation(); toggleSelection(msg.id); }}
                                                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-gray-500 dark:text-gray-300 hover:text-red-500"
                                                title="Delete / Select"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            )
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-wa-grayBg dark:bg-wa-dark-header z-40 relative">
          {replyMessage && (
            <div className="mx-2 mt-2 bg-[#f0f2f5] dark:bg-[#1f2c34] p-2 flex items-center justify-between border-l-4 border-wa-teal rounded-lg animate-in slide-in-from-bottom-2 shadow-sm relative">
                <div className="bg-white/50 dark:bg-black/10 absolute inset-0 z-0 pointer-events-none rounded-r-lg"></div>
                <div className="flex-1 overflow-hidden z-10 pl-2">
                     <div className="text-wa-teal font-medium text-sm mb-0.5">
                         {replyMessage.senderId === currentUserId ? 'You' : users[replyMessage.senderId]?.name}
                     </div>
                     <div className="text-xs text-gray-500 dark:text-gray-400 truncate pr-2">
                         {replyMessage.text}
                     </div>
                </div>
                <button onClick={() => setReplyMessage(null)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full z-10">
                    <X size={16} className="text-gray-500 dark:text-gray-400"/>
                </button>
            </div>
          )}

          <div className="flex items-end p-2 gap-2 select-none transition-colors">
              <div className="flex items-center gap-3 pb-3 pl-2 text-wa-gray dark:text-gray-400">
                  <Smile size={24} className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-200" />
                  <Paperclip size={24} className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-200" />
                  <ImageIcon 
                      size={24} 
                      className="cursor-pointer hover:text-gray-600 dark:hover:text-gray-200" 
                      onClick={() => fileInputRef.current?.click()}
                  />
                  <Gamepad2 
                      size={24} 
                      className="cursor-pointer hover:text-wa-teal dark:hover:text-wa-teal transition-colors"
                      onClick={() => openGameInvite({ isGroup: chat.isGroup })}
                  />
              </div>
              
              <div className="flex-1 bg-white dark:bg-wa-dark-input rounded-lg px-4 py-2 my-1 shadow-sm flex items-center min-h-[42px] transition-colors overflow-hidden">
                  {isRecording ? (
                      <div className="flex items-center gap-2 text-red-500 w-full animate-pulse">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
                          <span className="font-medium tabular-nums">Recording {formatDuration(recordingDuration)}</span>
                      </div>
                  ) : (
                      <input 
                          ref={inputRef}
                          type="text" 
                          className="w-full bg-transparent outline-none text-[15px] text-[#111b21] dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
                          placeholder="Type a message"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          onKeyDown={handleKeyDown}
                      />
                  )}
              </div>

              <div className="flex items-center pb-3 pr-2">
                <button 
                    onMouseDown={!inputText.trim() ? (e) => startRecording(e) : undefined}
                    onMouseUp={!inputText.trim() ? () => stopRecording(false) : undefined}
                    onMouseLeave={isRecording ? () => stopRecording(true) : undefined}
                    onTouchStart={!inputText.trim() ? (e) => startRecording(e) : undefined}
                    onTouchEnd={!inputText.trim() ? () => stopRecording(false) : undefined}
                    onClick={inputText.trim() ? handleSend : undefined}
                    onContextMenu={(e) => e.preventDefault()}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm active:scale-95 transition-all ${isRecording ? 'bg-red-500 scale-125 shadow-red-200' : 'bg-wa-teal dark:bg-wa-tealDark'}`}
                >
                    {inputText.trim() ? <Send size={20} className="ml-1" /> : <Mic size={20} className={isRecording ? 'animate-pulse' : ''} fill={isRecording ? 'currentColor' : 'none'} />}
                </button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ChatWindow;