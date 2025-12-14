
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MoreVertical, Phone, Video, Search, Smile, Paperclip, Mic, Send, 
  Check, CheckCheck, Reply, Trash2, Copy, Star, Forward, Info, X, ChevronDown,
  Image as ImageIcon, FileText, Camera, Languages, Pin, Lock, ArrowUp, ArrowDown, CheckSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useGame } from '../context/GameContext';
import { useCall } from '../context/CallContext';
import { formatTimestamp } from '../utils/formatTime';
import { Message } from '../types';

const REACTIONS_LIST = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

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
    // Ensure chatMessages is always an array to prevent crashes
    const chatMessages = (chatId && messages[chatId]) ? messages[chatId] : [];
    const contact = chat ? (chat.isGroup ? null : users[chat.contactId]) : null;

    useEffect(() => {
        // Scroll to bottom whenever messages update or chat changes, unless searching
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

    // --- Date Lock Handlers ---
    const handleDateDoubleClick = (date: string) => {
        setDateLockTarget(date);
        setLockPin('');
        setLockError('');
    };

    const handleLockVerify = (e: React.FormEvent) => {
        e.preventDefault();
        const correctPin = securitySettings.chatLockPassword || '0000';
        if (lockPin === correctPin) {
            if (chatId && dateLockTarget) {
                toggleDateLock(chatId, dateLockTarget);
            }
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

    // Filter messages if search is active
    const filteredMessages = messageSearchQuery 
        ? chatMessages.filter(m => m.text.toLowerCase().includes(messageSearchQuery.toLowerCase()))
        : chatMessages;

    const groupedMessages: { date: string, msgs: Message[] }[] = [];
    filteredMessages.forEach(msg => {
        // Robust date parsing
        let date = 'Unknown Date';
        try {
             date = new Date(msg.timestamp).toLocaleDateString();
        } catch (e) {
             console.error("Invalid date", msg.timestamp);
        }

        const lastGroup = groupedMessages[groupedMessages.length - 1];
        if (lastGroup && lastGroup.date === date) {
            lastGroup.msgs.push(msg);
        } else {
            groupedMessages.push({ date, msgs: [msg] });
        }
    });

    const getBubbleColor = (isMe: boolean) => {
        return isMe ? chatSettings.outgoingBubbleColor : chatSettings.incomingBubbleColor;
    };

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
                        <div className="w-12 h-12 bg-wa-teal rounded-full flex items-center justify-center mb-4 text-white">
                            <Lock size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-[#111b21] dark:text-gray-100 mb-1">
                            {chat.hiddenDates?.includes(dateLockTarget) ? 'Unlock Date' : 'Lock Date'}
                        </h3>
                        <p className="text-xs text-[#667781] dark:text-gray-400 mb-6 text-center">
                            Enter PIN to {chat.hiddenDates?.includes(dateLockTarget) ? 'show' : 'hide'} messages from <br/><strong>{dateLockTarget}</strong>
                        </p>
                        
                        <form onSubmit={handleLockVerify} className="w-full flex flex-col items-center">
                            <input 
                                type="password" 
                                maxLength={4}
                                value={lockPin}
                                onChange={(e) => {
                                    setLockPin(e.target.value);
                                    setLockError('');
                                }}
                                className="w-full text-center text-2xl tracking-[0.5em] font-medium py-2 border-b-2 border-wa-teal bg-transparent outline-none mb-2 text-[#111b21] dark:text-gray-100 placeholder-transparent"
                                placeholder="****"
                                autoFocus
                            />
                            
                            {lockError && <p className="text-red-500 text-xs mb-4 font-medium">{lockError}</p>}

                            <div className="flex gap-3 w-full mt-4">
                                <button type="button" onClick={() => setDateLockTarget(null)} className="flex-1 py-2 text-wa-teal font-medium hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-full transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2 bg-wa-teal text-white font-medium rounded-full shadow-sm hover:shadow-md transition-all">
                                    {chat.hiddenDates?.includes(dateLockTarget) ? 'Unlock' : 'Lock'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isSelectionMode ? (
                 <div className="h-[60px] bg-wa-teal dark:bg-wa-dark-header flex items-center px-4 gap-6 text-white z-10 shrink-0 shadow-md">
                    <div className="flex items-center gap-4">
                        <button onClick={() => { setIsSelectionMode(false); setSelectedMessages(new Set()); }}>
                            <X size={24} />
                        </button>
                        <span className="font-bold text-xl">{selectedMessages.size}</span>
                    </div>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-6">
                        <button><Reply size={24} className="scale-x-[-1]" /></button>
                        <button><Star size={24} /></button>
                        <button onClick={handleDeleteSelected}><Trash2 size={24} /></button>
                        <button><Forward size={24} /></button>
                    </div>
                 </div>
            ) : isSearchOpen ? (
                <div className="h-[60px] bg-white dark:bg-wa-dark-header flex items-center px-2 z-10 shrink-0 border-b border-gray-200 dark:border-gray-700 animate-in fade-in duration-200">
                    <button onClick={() => { setIsSearchOpen(false); setMessageSearchQuery(''); }} className="p-2 text-gray-500 dark:text-gray-300">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1 mx-2 bg-gray-100 dark:bg-wa-dark-input rounded-lg px-3 py-1.5 flex items-center">
                        <input 
                            autoFocus
                            type="text" 
                            className="w-full bg-transparent outline-none text-[#111b21] dark:text-gray-100"
                            placeholder="Search in chat..."
                            value={messageSearchQuery}
                            onChange={(e) => setMessageSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center text-gray-400">
                        <button className="p-2"><ArrowUp size={20} /></button>
                        <button className="p-2"><ArrowDown size={20} /></button>
                    </div>
                </div>
            ) : (
                <div className="h-[60px] bg-wa-grayBg dark:bg-wa-dark-header flex items-center px-4 justify-between border-b border-wa-border dark:border-wa-dark-border z-10 shrink-0">
                    <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 mr-2" onClick={() => navigate(`/chat/${chatId}/info`)}>
                        <button onClick={(e) => { e.stopPropagation(); navigate('/chats'); }} className="md:hidden mr-1 shrink-0">
                            <ArrowLeft size={24} className="text-[#54656f] dark:text-gray-400" />
                        </button>
                        <img 
                            src={chat.isGroup ? 'https://picsum.photos/300' : contact?.avatar} 
                            alt="Avatar" 
                            className="w-10 h-10 rounded-full object-cover shrink-0" 
                        />
                        <div className="flex flex-col justify-center min-w-0">
                            <h2 className="text-[#111b21] dark:text-gray-100 font-medium text-base truncate">
                                {chat.isGroup ? chat.groupName : contact?.name}
                            </h2>
                            <p className="text-xs text-[#667781] dark:text-gray-400 overflow-x-auto whitespace-nowrap no-scrollbar">
                                {chat.isGroup ? 
                                    (chat.groupParticipants?.map(p => users[p]?.name).join(', ') || 'click for info') : 
                                    'online'
                                }
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-4 text-wa-teal dark:text-wa-teal shrink-0">
                        {!chat.isLocked && (
                            <button onClick={() => openGameInvite({ isGroup: chat.isGroup })} className="hidden md:block p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full" title="Play Game">
                                <span className="text-xl">🎮</span>
                            </button>
                        )}
                        <button onClick={() => contact && startCall(contact.id, 'video')} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                            <Video size={24} />
                        </button>
                        <button onClick={() => contact && startCall(contact.id, 'voice')} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full">
                            <Phone size={22} />
                        </button>
                        
                        <button 
                            className="hidden md:block p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                            onClick={() => setIsSearchOpen(true)}
                        >
                            <Search size={22} className="text-[#54656f] dark:text-gray-400" />
                        </button>
                        
                        <div className="relative">
                            <button 
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-[#54656f] dark:text-gray-400"
                            >
                                <MoreVertical size={22} />
                            </button>

                            {isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl border border-wa-border dark:border-wa-dark-border z-50 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                                        <button 
                                            onClick={() => { navigate(`/chat/${chatId}/info`); setIsMenuOpen(false); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]"
                                        >
                                            {chat.isGroup ? 'Group info' : 'Contact info'}
                                        </button>
                                        <button 
                                            onClick={() => { setIsSearchOpen(true); setIsMenuOpen(false); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]"
                                        >
                                            Search
                                        </button>
                                        <button 
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]"
                                        >
                                            Mute notifications
                                        </button>
                                        <button 
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]"
                                        >
                                            Disappearing messages
                                        </button>
                                        <button 
                                            onClick={() => setIsMenuOpen(false)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]"
                                        >
                                            Wallpaper
                                        </button>
                                        <button 
                                            onClick={() => { deleteMessages(chatId!, [], true); setIsMenuOpen(false); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]"
                                        >
                                            Clear chat
                                        </button>
                                        <button 
                                            onClick={() => { setIsMenuOpen(false); navigate('/chats'); }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]"
                                        >
                                            Close chat
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 z-0 relative scroll-smooth" ref={chatContainerRef}>
                {!messageSearchQuery && (
                    <div className="flex justify-center mb-6">
                        <div className="bg-[#FFEECD] dark:bg-[#1f2c34] text-[#54656f] dark:text-[#ffcc00] text-[10px] md:text-xs px-3 py-1.5 rounded-lg text-center shadow-sm max-w-[80%] flex items-center gap-1.5">
                            <Lock size={10} />
                            Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
                        </div>
                    </div>
                )}

                {groupedMessages.length === 0 && (
                     <div className="text-center text-gray-400 text-sm mt-10">
                         {messageSearchQuery ? `No matches found for "${messageSearchQuery}"` : 'No messages here yet...'}
                     </div>
                )}

                {groupedMessages.map((group, gIdx) => {
                    const isDateLocked = chat.hiddenDates?.includes(group.date);

                    return (
                        <div key={gIdx}>
                            {/* Date Separator with Lock Capability */}
                            <div 
                                className="flex justify-center mb-4 sticky top-2 z-30 cursor-pointer select-none group"
                                onDoubleClick={() => handleDateDoubleClick(group.date)}
                                title="Double-click to lock/unlock date"
                            >
                                <span className={`
                                    flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm border uppercase tracking-wide transition-all
                                    ${isDateLocked 
                                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-100 dark:border-red-800' 
                                        : 'bg-white dark:bg-wa-dark-paper text-[#54656f] dark:text-gray-400 border-gray-100 dark:border-gray-800 group-hover:scale-105'}
                                `}>
                                    {isDateLocked && <Lock size={10} />}
                                    {group.date === new Date().toLocaleDateString() ? 'Today' : group.date}
                                </span>
                            </div>

                            {/* Messages - Only show if not locked */}
                            {!isDateLocked ? (
                                group.msgs.map((msg) => {
                                    const isMe = msg.senderId === currentUserId;
                                    const isActive = activeMessageId === msg.id;
                                    const isSelected = selectedMessages.has(msg.id);
                                    const isTranslated = translatedMessages.has(msg.id);
                                    const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                    
                                    // Highlight search term
                                    let displayText: React.ReactNode = msg.text;
                                    if (messageSearchQuery && msg.type === 'text') {
                                        const parts = msg.text.split(new RegExp(`(${messageSearchQuery})`, 'gi'));
                                        displayText = parts.map((part, i) => 
                                            part.toLowerCase() === messageSearchQuery.toLowerCase() 
                                                ? <span key={i} className="bg-yellow-200 text-black">{part}</span> 
                                                : part
                                        );
                                    }

                                    const StatusIcon = () => (
                                        isMe && !msg.isDeleted ? (
                                            msg.status === 'read' ? (
                                                <CheckCheck size={14} className="text-wa-blue" />
                                            ) : msg.status === 'delivered' ? (
                                                <CheckCheck size={14} className="text-gray-400" />
                                            ) : (
                                                <Check size={14} className="text-gray-400" />
                                            )
                                        ) : null
                                    );

                                    return (
                                        <div 
                                            key={msg.id} 
                                            className={`
                                                relative flex mb-1
                                                ${isMe ? 'justify-end' : 'justify-start'}
                                                ${isSelectionMode ? 'cursor-pointer hover:bg-blue-100/10 -mx-4 px-4 py-1' : ''}
                                                ${isSelected ? 'bg-blue-100/30 dark:bg-blue-900/20' : ''}
                                            `}
                                            onClick={() => isSelectionMode && toggleSelection(msg.id)}
                                            onContextMenu={(e) => handleContextMenu(e, msg.id)}
                                        >
                                            {isSelectionMode && (
                                                <div className={`flex items-center mr-3 ${isMe ? 'order-last ml-3 mr-0' : ''}`}>
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-wa-teal border-wa-teal' : 'border-gray-400 bg-white dark:bg-transparent'}`}>
                                                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                                                    </div>
                                                </div>
                                            )}

                                            <div 
                                                className={`
                                                    group relative max-w-[85%] md:max-w-[65%] rounded-lg shadow-sm p-1.5
                                                    ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'}
                                                `}
                                                style={{ 
                                                    backgroundColor: getBubbleColor(isMe),
                                                    color: '#111b21'
                                                }}
                                                onMouseEnter={() => !isSelectionMode && setActiveMessageId(msg.id)}
                                                onMouseLeave={() => !isSelectionMode && setActiveMessageId(null)}
                                            >
                                                {!msg.isDeleted && !isSelectionMode && (
                                                    <div className={`
                                                        absolute -top-10 bg-white dark:bg-wa-dark-paper rounded-full shadow-lg p-1.5 flex items-center animate-in fade-in zoom-in duration-200 z-50
                                                        ${isMe ? 'right-0 origin-bottom-right' : 'left-0 origin-bottom-left'}
                                                        ${isActive || 'hidden group-hover:flex'}
                                                    `}>
                                                        <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[120px] px-1">
                                                            {REACTIONS_LIST.map(emoji => (
                                                                <button 
                                                                    key={emoji}
                                                                    onClick={(e) => { e.stopPropagation(); addReaction(chatId!, msg.id, emoji); setActiveMessageId(null); }}
                                                                    className={`p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-lg transition-transform hover:scale-125 shrink-0 ${msg.reactions?.[currentUser.id] === emoji ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>

                                                        <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0"></div>
                                                        
                                                        <div className="flex gap-1 shrink-0">
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
                                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300"
                                                                title="Select"
                                                            >
                                                                <CheckSquare size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {msg.replyToId && (
                                                    <div className="mb-1 p-1 bg-black/5 dark:bg-white/10 rounded border-l-4 border-wa-teal text-xs opacity-70">
                                                        <span className="font-bold block text-wa-teal">
                                                            {users[chatMessages.find(m => m.id === msg.replyToId)?.senderId || '']?.name || 'User'}
                                                        </span>
                                                        <span className="line-clamp-1">{chatMessages.find(m => m.id === msg.replyToId)?.text || 'Message'}</span>
                                                    </div>
                                                )}

                                                {msg.isPinned && (
                                                    <div className="absolute -top-2 -right-2 bg-gray-100 dark:bg-gray-700 rounded-full p-1 shadow-sm z-10">
                                                        <Pin size={10} className="text-gray-500" fill="currentColor" />
                                                    </div>
                                                )}
                                                
                                                {msg.isForwarded && (
                                                    <div className="flex items-center gap-1 text-[11px] text-gray-500 italic mb-1 px-1">
                                                        <Forward size={12} /> Forwarded
                                                    </div>
                                                )}

                                                <div className={`${getFontSizeClass()} px-1`}>
                                                    {msg.isDeleted ? (
                                                        <span className="italic text-gray-500 flex items-center gap-1 pb-1">
                                                            <Info size={14} /> {msg.text}
                                                        </span>
                                                    ) : (
                                                        <>
                                                            {msg.type === 'image' && (
                                                                <div className="mb-1 rounded-lg overflow-hidden cursor-pointer">
                                                                    <img src={msg.mediaUrl} alt="Sent media" className="max-w-full max-h-[300px] object-cover" />
                                                                </div>
                                                            )}
                                                            {msg.type === 'video' && (
                                                                <div className="mb-1 rounded-lg overflow-hidden relative bg-black flex items-center justify-center h-[200px] cursor-pointer">
                                                                    <Video size={40} className="text-white opacity-80" />
                                                                    <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-1 rounded">{msg.duration}</span>
                                                                </div>
                                                            )}
                                                            {msg.type === 'voice' && (
                                                                <div className="flex items-center gap-3 pr-4 min-w-[150px] py-1">
                                                                    <div className="w-10 h-10 rounded-full bg-wa-teal flex items-center justify-center text-white cursor-pointer">
                                                                        <Mic size={20} />
                                                                    </div>
                                                                    <div className="flex flex-col flex-1">
                                                                        <div className="h-1 bg-gray-300 dark:bg-gray-600 rounded-full w-full mb-1"></div>
                                                                        <span className="text-xs text-gray-500">{msg.duration}</span>
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {msg.type === 'text' && (
                                                                <div className="relative">
                                                                    <span className="whitespace-pre-wrap break-words text-[#111b21] dark:text-gray-100">
                                                                        {displayText}
                                                                        {/* Invisible spacer to reserve area on the last line if possible */}
                                                                        <span className="inline-block w-16 h-3"></span>
                                                                    </span>
                                                                    {/* Timestamp positioned absolutely within the reserved space */}
                                                                    <span className="absolute bottom-[-3px] right-0 flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400 select-none whitespace-nowrap">
                                                                        {formattedTime}
                                                                        <StatusIcon />
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>

                                                {/* Separate Timestamp Block for Media Types (Non-Text) */}
                                                {msg.type !== 'text' && !msg.isDeleted && (
                                                    <div className="flex justify-end items-center gap-1 mt-1 px-1 pb-1 select-none">
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            {formattedTime}
                                                        </span>
                                                        <StatusIcon />
                                                    </div>
                                                )}
                                                
                                                {/* Timestamp for Deleted Messages */}
                                                {msg.isDeleted && (
                                                    <div className="flex justify-end items-center gap-1 px-1 pb-1 select-none">
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                                            {formattedTime}
                                                        </span>
                                                    </div>
                                                )}

                                                {msg.reactions && Object.keys(msg.reactions).length > 0 && !msg.isDeleted && (
                                                    <div className="absolute -bottom-2.5 left-2 bg-white dark:bg-wa-dark-paper border border-gray-100 dark:border-gray-700 rounded-full px-1.5 py-0.5 shadow-sm flex items-center gap-0.5 z-10">
                                                        {Object.values(msg.reactions).slice(0, 3).map((emoji, i) => (
                                                            <span key={i} className="text-[10px]">{emoji}</span>
                                                        ))}
                                                        {Object.values(msg.reactions).length > 1 && (
                                                            <span className="text-[10px] text-gray-500 ml-0.5">{Object.values(msg.reactions).length}</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 mb-4 opacity-60">
                                    <Lock size={16} className="text-gray-400 mb-1" />
                                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">Messages Hidden</span>
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {replyTo && (
                <div className="bg-gray-100 dark:bg-wa-dark-paper px-4 py-2 border-l-4 border-wa-teal flex justify-between items-center z-10 mx-2 mt-2 rounded-lg">
                    <div className="flex flex-col text-sm max-w-[90%]">
                        <span className="text-wa-teal font-medium text-xs">Replying to {users[replyTo.senderId]?.name || 'User'}</span>
                        <span className="truncate text-gray-600 dark:text-gray-300">{replyTo.text}</span>
                    </div>
                    <button onClick={() => setReplyTo(null)}><X size={20} className="text-gray-500" /></button>
                </div>
            )}

            {isSelectionMode ? (
                <div className="p-3 bg-wa-grayBg dark:bg-wa-dark-header border-t border-wa-border dark:border-wa-dark-border z-10 flex items-center justify-center text-sm text-gray-500">
                    Selection Mode Active
                </div>
            ) : (
                <div className="p-2 md:p-3 bg-wa-grayBg dark:bg-wa-dark-header border-t border-wa-border dark:border-wa-dark-border z-10 flex items-center gap-2">
                    <button 
                        onClick={() => setShowPicker(!showPicker)} 
                        className="p-2 text-[#54656f] dark:text-gray-400 hover:bg-black/5 rounded-full transition-colors"
                    >
                        <Smile size={24} />
                    </button>
                    <button className="p-2 text-[#54656f] dark:text-gray-400 hover:bg-black/5 rounded-full transition-colors">
                        <Paperclip size={24} />
                    </button>

                    <div className="flex-1 bg-white dark:bg-wa-dark-input rounded-lg flex items-center px-4 py-2">
                        <input 
                            type="text" 
                            className="w-full bg-transparent outline-none text-[#111b21] dark:text-gray-100 placeholder:text-[#667781] dark:placeholder:text-gray-500 text-[15px]"
                            placeholder="Type a message"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>
                    
                    {inputText.trim() ? (
                         <button 
                            onClick={() => handleSendMessage()}
                            className="p-3 bg-wa-teal text-white rounded-full shadow-md hover:scale-105 transition-transform"
                        >
                            <Send size={20} className="ml-0.5" />
                        </button>
                    ) : (
                        <button className="p-3 bg-wa-teal text-white rounded-full shadow-md hover:scale-105 transition-transform">
                            <Mic size={20} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
