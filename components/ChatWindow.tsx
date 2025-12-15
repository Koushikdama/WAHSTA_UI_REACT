
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MoreVertical, Phone, Video, Search, Smile, Paperclip, Mic, Send, 
  Check, CheckCheck, Reply, Trash2, Copy, Star, Forward, Info, X, ChevronDown,
  Image as ImageIcon, FileText, Camera, Languages, Pin, Lock, ArrowUp, ArrowDown, CheckSquare,
  Play, Pause, ChevronLeft, ChevronRight, StopCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { useCall } from '../context/CallContext';
import { formatTimestamp } from '../utils/formatTime';
import { Message } from '../types';

const REACTIONS_LIST = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// --- Helper Components ---

const MediaCarousel = ({ mediaUrls }: { mediaUrls: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    const next = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex(prev => (prev + 1) % mediaUrls.length);
    }

    const prev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex(prev => (prev - 1 + mediaUrls.length) % mediaUrls.length);
    }

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.targetTouches[0].clientX;
    }

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;
        const diff = touchStartX.current - touchEndX.current;
        if (diff > 50) next();
        else if (diff < -50) {
            prev();
        }
        
        touchStartX.current = null;
        touchEndX.current = null;
    }

    return (
        <div 
            className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group touch-pan-y select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {mediaUrls.map((url, idx) => (
                <div 
                    key={idx} 
                    className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <img 
                        src={url} 
                        alt={`Slide ${idx + 1}`} 
                        className="w-full h-full object-cover" 
                        loading="lazy"
                        draggable={false}
                    />
                </div>
            ))}
            
            {mediaUrls.length > 1 && (
                <>
                    <button 
                        onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white z-20 backdrop-blur-[2px] transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <button 
                        onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white z-20 backdrop-blur-[2px] transition-all opacity-0 group-hover:opacity-100 hidden md:block"
                    >
                        <ChevronRight size={20} strokeWidth={2.5} />
                    </button>
                </>
            )}

            {mediaUrls.length > 1 && (
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20 pointer-events-none">
                    {mediaUrls.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`w-1.5 h-1.5 rounded-full shadow-sm transition-all duration-300 ${idx === currentIndex ? 'bg-white scale-125 opacity-100' : 'bg-white/50 opacity-70'}`}
                        />
                    ))}
                </div>
            )}
            
            {mediaUrls.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm z-20 font-medium">
                    {currentIndex + 1}/{mediaUrls.length}
                </div>
            )}
        </div>
    )
};

const VideoMessage = ({ src, poster, duration }: { src: string, poster?: string, duration?: string }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(e => console.log("Video play failed:", e));
            }
            setIsPlaying(!isPlaying);
        }
    }

    const handleEnded = () => setIsPlaying(false);

    return (
        <div className="relative w-full max-h-[400px] min-w-[200px] bg-black rounded-lg overflow-hidden cursor-pointer group" onClick={togglePlay}>
            <video 
                ref={videoRef}
                src={src} 
                poster={poster}
                className="w-full h-full object-contain max-h-[400px]"
                onEnded={handleEnded}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                playsInline
                controls={isPlaying} 
            />
            
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all z-10">
                    <div className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play size={20} fill="currentColor" className="ml-1 opacity-90" />
                    </div>
                </div>
            )}

            {duration && !isPlaying && (
                <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-md font-medium z-10 flex items-center gap-1">
                    <Video size={10} /> {duration}
                </span>
            )}
        </div>
    )
};

// --- Main Component ---

const ChatWindow = () => {
    const { chatId } = useParams();
    const navigate = useNavigate();
    const { 
        chats, messages, users, currentUser, addMessage, deleteMessages, 
        togglePinMessage, addReaction, currentUserId, chatSettings, 
        toggleDateLock, securitySettings 
    } = useApp();
    const { startCall } = useCall();
    const { openGameInvite } = useGame();

    const [inputText, setInputText] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
    const [replyTo, setReplyTo] = useState<Message | null>(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());
    const [translatedMessages, setTranslatedMessages] = useState<Set<string>>(new Set());
    
    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const recordingTimerRef = useRef<any>(null);

    // Search State
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [messageSearchQuery, setMessageSearchQuery] = useState('');
    
    // Header Menu State
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Date Lock State
    const [dateLockTarget, setDateLockTarget] = useState<string | null>(null);
    const [lockPin, setLockPin] = useState('');
    const [lockError, setLockError] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const chat = chats.find(c => c.id === chatId);
    const chatMessages = (chatId && messages[chatId]) ? messages[chatId] : [];
    const contact = chat ? (chat.isGroup ? null : users[chat.contactId]) : null;

    useEffect(() => {
        if (messagesEndRef.current && !messageSearchQuery) {
             messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, [chatMessages.length, chatId, messageSearchQuery]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!chatId || !inputText.trim()) return;
        addMessage(chatId, inputText, 'text', replyTo?.id);
        setInputText('');
        setReplyTo(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // --- Voice Recording Handlers ---
    const startRecording = () => {
        setIsRecording(true);
        setRecordingSeconds(0);
        recordingTimerRef.current = setInterval(() => {
            setRecordingSeconds(prev => prev + 1);
        }, 1000);
    };

    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const cancelRecording = () => {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        setRecordingSeconds(0);
    };

    const finishRecording = () => {
        if (!chatId) return;
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        // Add voice message with the duration
        addMessage(chatId, "🎤 Voice Message", 'voice', undefined, undefined, formatRecordingTime(recordingSeconds));
        setIsRecording(false);
        setRecordingSeconds(0);
    };

    const handleReply = (msg: Message) => {
        setReplyTo(msg);
        setActiveMessageId(null);
    };

    const handleTranslate = (msgId: string) => {
        const newSet = new Set(translatedMessages);
        if (newSet.has(msgId)) newSet.delete(msgId);
        else newSet.add(msgId);
        setTranslatedMessages(newSet);
        setActiveMessageId(null);
    };
    
    const toggleSelection = (msgId: string) => {
        const newSet = new Set(selectedMessages);
        if (newSet.has(msgId)) {
            newSet.delete(msgId);
            if (newSet.size === 0) setIsSelectionMode(false);
        } else {
            newSet.add(msgId);
            setIsSelectionMode(true);
        }
        setSelectedMessages(newSet);
        setActiveMessageId(null);
    };

    const handleDeleteSelected = () => {
        if (chatId) {
            deleteMessages(chatId, Array.from(selectedMessages), true);
            setSelectedMessages(new Set());
            setIsSelectionMode(false);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, msgId: string) => {
        e.preventDefault();
        if (!isSelectionMode) {
            setIsSelectionMode(true);
            setSelectedMessages(new Set([msgId]));
        }
    };

    const handleDateDoubleClick = (date: string) => {
        setDateLockTarget(date);
        setLockPin('');
        setLockError('');
    };

    const handleLockVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const correctPin = securitySettings.dailyLockPassword || '1234';
        if (lockPin === correctPin) {
            if (chatId && dateLockTarget) toggleDateLock(chatId, dateLockTarget);
            setDateLockTarget(null);
        } else {
            setLockError('Incorrect PIN');
            setLockPin('');
        }
    };

    if (!chat) return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-wa-bg">
            <p>Chat not found</p>
            <button onClick={() => navigate('/chats')} className="mt-4 text-wa-teal">Go back</button>
        </div>
    );

    const filteredMessages = messageSearchQuery 
        ? chatMessages.filter(m => m.text.toLowerCase().includes(messageSearchQuery.toLowerCase()))
        : chatMessages;

    const groupedMessages: { date: string, msgs: Message[] }[] = [];
    filteredMessages.forEach(msg => {
        let date = 'Unknown Date';
        try { date = new Date(msg.timestamp).toLocaleDateString(); } catch (e) { }
        const lastGroup = groupedMessages[groupedMessages.length - 1];
        if (lastGroup && lastGroup.date === date) lastGroup.msgs.push(msg);
        else groupedMessages.push({ date, msgs: [msg] });
    });

    const getBubbleColor = (isMe: boolean) => isMe ? chatSettings.outgoingBubbleColor : chatSettings.incomingBubbleColor;
    const getFontSizeClass = () => {
         switch(chatSettings.fontSize) {
             case 'small': return 'text-[13px]';
             case 'large': return 'text-[17px]';
             default: return 'text-[15px]';
         }
    };

    return (
        <div className="flex flex-col h-full bg-[#EFEAE2] dark:bg-[#0b141a] relative">
            <div className="absolute inset-0 opacity-40 pointer-events-none z-0" 
                 style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: '400px' }}>
            </div>

            {/* Date Lock Modal */}
            {dateLockTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-wa-dark-paper rounded-xl shadow-2xl w-full max-w-xs p-6 flex flex-col items-center">
                        <div className="w-12 h-12 bg-wa-teal rounded-full flex items-center justify-center mb-4 text-white"><Lock size={24} /></div>
                        <h3 className="text-lg font-medium text-[#111b21] dark:text-gray-100 mb-1">{chat.hiddenDates?.includes(dateLockTarget) ? 'Unlock Date' : 'Lock Date'}</h3>
                        <p className="text-xs text-[#667781] dark:text-gray-400 mb-6 text-center">Enter Daily PIN (1234) to {chat.hiddenDates?.includes(dateLockTarget) ? 'show' : 'hide'} messages from <br/><strong>{dateLockTarget}</strong></p>
                        <form onSubmit={handleLockVerify} className="w-full flex flex-col items-center">
                            <input type="password" maxLength={4} value={lockPin} onChange={(e) => { setLockPin(e.target.value); setLockError(''); }} className="w-full text-center text-2xl tracking-[0.5em] font-medium py-2 border-b-2 border-wa-teal bg-transparent outline-none mb-2 text-[#111b21] dark:text-gray-100 placeholder-transparent" placeholder="****" autoFocus />
                            {lockError && <p className="text-red-500 text-xs mb-4 font-medium">{lockError}</p>}
                            <div className="flex gap-3 w-full mt-4">
                                <button type="button" onClick={() => setDateLockTarget(null)} className="flex-1 py-2 text-wa-teal font-medium hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-full transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-wa-teal text-white font-medium rounded-full shadow-sm hover:shadow-md transition-all">{chat.hiddenDates?.includes(dateLockTarget) ? 'Unlock' : 'Lock'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isSelectionMode ? (
                 <div className="h-[60px] bg-wa-teal dark:bg-wa-dark-header flex items-center px-4 gap-6 text-white z-10 shrink-0 shadow-md">
                    <div className="flex items-center gap-4"><button onClick={() => { setIsSelectionMode(false); setSelectedMessages(new Set()); }}><X size={24} /></button><span className="font-bold text-xl">{selectedMessages.size}</span></div>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-6"><button><Reply size={24} className="scale-x-[-1]" /></button><button><Star size={24} /></button><button onClick={handleDeleteSelected}><Trash2 size={24} /></button><button><Forward size={24} /></button></div>
                 </div>
            ) : isSearchOpen ? (
                <div className="h-[60px] bg-white dark:bg-wa-dark-header flex items-center px-2 z-10 shrink-0 border-b border-gray-200 dark:border-gray-700 animate-in fade-in duration-200">
                    <button onClick={() => { setIsSearchOpen(false); setMessageSearchQuery(''); }} className="p-2 text-gray-500 dark:text-gray-300"><ArrowLeft size={24} /></button>
                    <div className="flex-1 mx-2 bg-gray-100 dark:bg-wa-dark-input rounded-lg px-3 py-1.5 flex items-center"><input autoFocus type="text" className="w-full bg-transparent outline-none text-[#111b21] dark:text-gray-100" placeholder="Search in chat..." value={messageSearchQuery} onChange={(e) => setMessageSearchQuery(e.target.value)} /></div>
                    <div className="flex items-center text-gray-400"><button className="p-2"><ArrowUp size={20} /></button><button className="p-2"><ArrowDown size={20} /></button></div>
                </div>
            ) : (
                <div className="h-[60px] bg-wa-grayBg dark:bg-wa-dark-header flex items-center px-4 justify-between border-b border-wa-border dark:border-wa-dark-border z-10 shrink-0">
                    <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 mr-2" onClick={() => navigate(`/chat/${chatId}/info`)}>
                        <button onClick={(e) => { e.stopPropagation(); navigate('/chats'); }} className="md:hidden mr-1 shrink-0"><ArrowLeft size={24} className="text-[#54656f] dark:text-gray-400" /></button>
                        <img src={chat.isGroup ? 'https://picsum.photos/300' : contact?.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="flex flex-col justify-center min-w-0">
                            <h2 className="text-[#111b21] dark:text-gray-100 font-medium text-base truncate">{chat.isGroup ? chat.groupName : contact?.name}</h2>
                            <p className="text-xs text-[#667781] dark:text-gray-400 overflow-x-auto whitespace-nowrap no-scrollbar">{chat.isGroup ? (chat.groupParticipants?.map(p => users[p]?.name).join(', ') || 'click for info') : 'online'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 text-wa-teal dark:text-wa-teal shrink-0">
                        {!chat.isLocked && <button onClick={() => openGameInvite({ isGroup: chat.isGroup, chatId: chat.id, opponentId: chat.isGroup ? 'group' : chat.contactId })} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full md:block hidden" title="Play Game"><span className="text-xl">🎮</span></button>}
                        <button onClick={() => contact && startCall(contact.id, 'video')} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"><Video size={24} /></button>
                        <button onClick={() => contact && startCall(contact.id, 'voice')} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"><Phone size={22} /></button>
                        <button className="hidden md:block p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full" onClick={() => setIsSearchOpen(true)}><Search size={22} className="text-[#54656f] dark:text-gray-400" /></button>
                        <div className="relative">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-[#54656f] dark:text-gray-400"><MoreVertical size={22} /></button>
                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl border border-wa-border dark:border-wa-dark-border z-50 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                                        <button onClick={() => { navigate(`/chat/${chatId}/info`); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">{chat.isGroup ? 'Group info' : 'Contact info'}</button>
                                        {!chat.isLocked && <button onClick={() => { openGameInvite({ isGroup: chat.isGroup, chatId: chat.id, opponentId: chat.isGroup ? 'group' : chat.contactId }); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px] flex items-center gap-2"><span>Play Game</span><span className="text-sm">🎮</span></button>}
                                        <button onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">Search</button>
                                        <button onClick={() => { deleteMessages(chatId!, [], true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">Clear chat</button>
                                        <button onClick={() => { setIsMenuOpen(false); navigate('/chats'); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">Close chat</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-2 md:p-4 z-0 relative scroll-smooth" ref={chatContainerRef}>
                {!messageSearchQuery && <div className="flex justify-center mb-6"><div className="bg-[#FFEECD] dark:bg-[#1f2c34] text-[#54656f] dark:text-[#ffcc00] text-[10px] md:text-xs px-3 py-1.5 rounded-lg text-center shadow-sm max-w-[80%] flex items-center gap-1.5"><Lock size={10} /> Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.</div></div>}
                
                {groupedMessages.map((group, gIdx) => {
                    const isDateLocked = chat.hiddenDates?.includes(group.date);
                    return (
                        <div key={gIdx}>
                            <div className="flex justify-center mb-4 sticky top-2 z-30 cursor-pointer select-none group" onDoubleClick={() => handleDateDoubleClick(group.date)} title="Double-click to lock/unlock date">
                                <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm border uppercase tracking-wide transition-all ${isDateLocked ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-100 dark:border-red-800' : 'bg-white dark:bg-wa-dark-paper text-[#54656f] dark:text-gray-400 border-gray-100 dark:border-gray-800 group-hover:scale-105'}`}>
                                    {isDateLocked && <Lock size={10} />} {group.date === new Date().toLocaleDateString() ? 'Today' : group.date}
                                </span>
                            </div>
                            {!isDateLocked ? (
                                group.msgs.map((msg) => {
                                    const isMe = msg.senderId === currentUserId;
                                    const isActive = activeMessageId === msg.id;
                                    const isSelected = selectedMessages.has(msg.id);
                                    const isTranslated = translatedMessages.has(msg.id);
                                    const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                    
                                    let displayText: React.ReactNode = msg.text;
                                    if (messageSearchQuery && msg.type === 'text') {
                                        const parts = msg.text.split(new RegExp(`(${messageSearchQuery})`, 'gi'));
                                        displayText = parts.map((part, i) => part.toLowerCase() === messageSearchQuery.toLowerCase() ? <span key={i} className="bg-yellow-200 text-black">{part}</span> : part);
                                    }

                                    const StatusIcon = () => (
                                        isMe && !msg.isDeleted ? (msg.status === 'read' ? <CheckCheck size={14} className="text-wa-blue" /> : msg.status === 'delivered' ? <CheckCheck size={14} className="text-gray-400" /> : <Check size={14} className="text-gray-400" />) : null
                                    );

                                    // Determine styling based on message content
                                    const isMediaMessage = (msg.type === 'image' || msg.type === 'video' || (msg.mediaUrls && msg.mediaUrls.length > 0)) && !msg.isDeleted;
                                    // Tighter padding for media to mimic WhatsApp edge-to-edge media bubbles
                                    const bubblePadding = isMediaMessage ? 'p-[3px]' : 'p-1.5';

                                    return (
                                        <div key={msg.id} className={`relative flex mb-2 ${isMe ? 'justify-end' : 'justify-start'} ${isSelectionMode ? 'cursor-pointer hover:bg-blue-100/10 -mx-4 px-4 py-1' : ''} ${isSelected ? 'bg-blue-100/30 dark:bg-blue-900/20' : ''}`} onClick={() => isSelectionMode && toggleSelection(msg.id)} onContextMenu={(e) => handleContextMenu(e, msg.id)}>
                                            {isSelectionMode && (
                                                <div className={`flex items-center mr-3 ${isMe ? 'order-last ml-3 mr-0' : ''}`}>
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-wa-teal border-wa-teal' : 'border-gray-400 bg-white dark:bg-transparent'}`}>{isSelected && <Check size={14} className="text-white" strokeWidth={3} />}</div>
                                                </div>
                                            )}
                                            <div 
                                                className={`group relative max-w-[85%] md:max-w-[65%] rounded-lg shadow-sm ${bubblePadding} ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'} ${isMediaMessage ? 'overflow-hidden' : ''}`}
                                                style={{ backgroundColor: getBubbleColor(isMe), color: '#111b21' }}
                                                onMouseEnter={() => !isSelectionMode && setActiveMessageId(msg.id)}
                                                onMouseLeave={() => !isSelectionMode && setActiveMessageId(null)}
                                            >
                                                {!msg.isDeleted && !isSelectionMode && (
                                                    <div className={`absolute -top-10 bg-white dark:bg-wa-dark-paper rounded-full shadow-lg p-1.5 flex items-center animate-in fade-in zoom-in duration-200 z-50 ${isMe ? 'right-0 origin-bottom-right' : 'left-0 origin-bottom-left'} ${isActive || 'hidden group-hover:flex'}`}>
                                                        <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[120px] px-1">{REACTIONS_LIST.map(emoji => <button key={emoji} onClick={(e) => { e.stopPropagation(); addReaction(chatId!, msg.id, emoji); setActiveMessageId(null); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-lg transition-transform hover:scale-125 shrink-0">{emoji}</button>)}</div>
                                                        <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0"></div>
                                                        <div className="flex gap-1 shrink-0">
                                                            <button onClick={(e) => { e.stopPropagation(); handleReply(msg); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300" title="Reply"><Reply size={16} /></button>
                                                            {msg.type === 'text' && <button onClick={(e) => { e.stopPropagation(); handleTranslate(msg.id); }} className={`p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300 ${isTranslated ? 'text-wa-teal' : ''}`} title="Translate"><Languages size={16} /></button>}
                                                            <button onClick={(e) => { e.stopPropagation(); togglePinMessage(chatId!, msg.id); setActiveMessageId(null); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300" title="Pin"><Pin size={16} fill={msg.isPinned ? "currentColor" : "none"} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); toggleSelection(msg.id); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300" title="Select"><CheckSquare size={16} /></button>
                                                        </div>
                                                    </div>
                                                )}
                                                {msg.replyToId && <div className="mb-1 p-1 bg-black/5 dark:bg-white/10 rounded border-l-4 border-wa-teal text-xs opacity-70"><span className="font-bold block text-wa-teal">{users[chatMessages.find(m => m.id === msg.replyToId)?.senderId || '']?.name || 'User'}</span><span className="line-clamp-1">{chatMessages.find(m => m.id === msg.replyToId)?.text || 'Message'}</span></div>}
                                                {msg.isPinned && <div className="absolute -top-2 -right-2 bg-gray-100 dark:bg-gray-700 rounded-full p-1 shadow-sm z-10"><Pin size={10} className="text-gray-500" fill="currentColor" /></div>}
                                                {msg.isForwarded && <div className="flex items-center gap-1 text-[11px] text-gray-500 italic mb-1 px-1"><Forward size={12} /> Forwarded</div>}

                                                <div className={`${getFontSizeClass()} ${isMediaMessage ? '' : 'px-1'}`}>
                                                    {msg.isDeleted ? (
                                                        <span className="italic text-gray-500 flex items-center gap-1 pb-1"><Info size={14} /> {msg.text}</span>
                                                    ) : (
                                                        <>
                                                            {msg.mediaUrls && msg.mediaUrls.length > 0 ? (
                                                                <MediaCarousel mediaUrls={msg.mediaUrls} />
                                                            ) : msg.type === 'video' ? (
                                                                <VideoMessage src={msg.mediaUrl || ''} poster={msg.mediaUrl} duration={msg.duration} />
                                                            ) : msg.type === 'image' ? (
                                                                <div className="rounded-lg overflow-hidden cursor-pointer relative">
                                                                    <img src={msg.mediaUrl} alt="Sent media" className="w-full max-h-[400px] object-cover" />
                                                                </div>
                                                            ) : msg.type === 'voice' ? (
                                                                <div className="flex items-center gap-3 pr-4 min-w-[150px] py-1">
                                                                    <div className="w-10 h-10 rounded-full bg-wa-teal flex items-center justify-center text-white cursor-pointer relative shrink-0">
                                                                        <Mic size={20} />
                                                                    </div>
                                                                    <div className="flex flex-col flex-1 gap-1">
                                                                        <div className="h-1 bg-black/20 dark:bg-white/20 rounded-full w-full mt-2 relative overflow-hidden">
                                                                            <div className="absolute top-0 left-0 h-full bg-gray-500 w-1/3"></div>
                                                                        </div>
                                                                        <span className="text-xs opacity-70">{msg.duration || '0:00'}</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="relative">
                                                                    <span className="whitespace-pre-wrap break-words text-[#111b21] dark:text-gray-100">{displayText}<span className="inline-block w-16 h-3"></span></span>
                                                                    <span className="absolute bottom-[-3px] right-0 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 select-none whitespace-nowrap">{formattedTime} <StatusIcon /></span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                {/* Timestamp for Media (Overlay Style) */}
                                                {isMediaMessage && !msg.isDeleted && (
                                                    <div className="absolute bottom-1 right-2 bg-black/40 text-white rounded-full px-1.5 py-0.5 backdrop-blur-sm flex items-center gap-1 select-none pointer-events-none z-10">
                                                        <span className="text-[10px] text-white/90">{formattedTime}</span>
                                                        {isMe && <CheckCheck size={14} className="text-white/90" />}
                                                    </div>
                                                )}
                                                
                                                {msg.isDeleted && <div className="flex justify-end items-center gap-1 px-1 pb-1 select-none"><span className="text-[10px] text-gray-500 dark:text-gray-400">{formattedTime}</span></div>}
                                                {msg.reactions && Object.keys(msg.reactions).length > 0 && !msg.isDeleted && <div className="absolute -bottom-2.5 left-2 bg-white dark:bg-wa-dark-paper border border-gray-100 dark:border-gray-700 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5 z-10">{Object.values(msg.reactions).slice(0, 3).map((emoji, i) => <span key={i} className="text-[10px]">{emoji}</span>)}{Object.values(msg.reactions).length > 1 && <span className="text-[10px] text-gray-500 ml-0.5">{Object.values(msg.reactions).length}</span>}</div>}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : <div className="flex flex-col items-center justify-center py-6 mb-4 opacity-60"><Lock size={16} className="text-gray-400 mb-1" /><span className="text-[10px] text-gray-400 uppercase tracking-widest">Messages Hidden</span></div>}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {replyTo && <div className="bg-gray-100 dark:bg-wa-dark-paper px-4 py-2 border-l-4 border-wa-teal flex justify-between items-center z-10 mx-2 mt-2 rounded-lg"><div className="flex flex-col text-sm max-w-[90%]"><span className="text-wa-teal font-medium text-xs">Replying to {users[replyTo.senderId]?.name || 'User'}</span><span className="truncate text-gray-600 dark:text-gray-300">{replyTo.text}</span></div><button onClick={() => setReplyTo(null)}><X size={20} className="text-gray-500" /></button></div>}
            
            {/* --- Chat Footer / Input Area --- */}
            {isSelectionMode ? (
                <div className="p-3 bg-wa-grayBg dark:bg-wa-dark-header border-t border-wa-border dark:border-wa-dark-border z-10 flex items-center justify-center text-sm text-gray-500">Selection Mode Active</div> 
            ) : isRecording ? (
                // Recording UI
                <div className="p-2 md:p-3 bg-wa-grayBg dark:bg-wa-dark-header border-t border-wa-border dark:border-wa-dark-border z-10 flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-200">
                    <button onClick={cancelRecording} className="p-3 text-red-500 hover:bg-black/5 rounded-full transition-colors">
                        <Trash2 size={22} />
                    </button>
                    
                    <div className="flex-1 flex items-center gap-3">
                        <div className="flex items-center gap-2 text-[#54656f] dark:text-gray-300 text-lg font-mono">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                            {formatRecordingTime(recordingSeconds)}
                        </div>
                        <span className="text-xs text-[#667781] dark:text-gray-500 animate-pulse">Recording...</span>
                    </div>

                    <button onClick={finishRecording} className="p-3 bg-wa-teal text-white rounded-full shadow-md hover:scale-105 transition-transform">
                        <Send size={20} className="ml-0.5" />
                    </button>
                </div>
            ) : (
                // Standard Input UI
                <div className="p-2 md:p-3 bg-wa-grayBg dark:bg-wa-dark-header border-t border-wa-border dark:border-wa-dark-border z-10 flex items-center gap-2">
                    <button onClick={() => setShowPicker(!showPicker)} className="p-2 text-[#54656f] dark:text-gray-400 hover:bg-black/5 rounded-full transition-colors"><Smile size={24} /></button>
                    <button className="p-2 text-[#54656f] dark:text-gray-400 hover:bg-black/5 rounded-full transition-colors"><Paperclip size={24} /></button>
                    <div className="flex-1 bg-white dark:bg-wa-dark-input rounded-lg flex items-center px-4 py-2"><input type="text" className="w-full bg-transparent outline-none text-[#111b21] dark:text-gray-100 placeholder:text-[#667781] dark:placeholder:text-gray-500 text-[15px]" placeholder="Type a message" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown} /></div>
                    {inputText.trim() ? (
                        <button onClick={() => handleSendMessage()} className="p-3 bg-wa-teal text-white rounded-full shadow-md hover:scale-105 transition-transform"><Send size={20} className="ml-0.5" /></button> 
                    ) : (
                        <button onClick={startRecording} className="p-3 bg-wa-teal text-white rounded-full shadow-md hover:scale-105 transition-transform active:scale-95"><Mic size={20} /></button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
