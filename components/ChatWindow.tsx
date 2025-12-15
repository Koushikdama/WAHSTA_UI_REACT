
import React from 'react';
import { 
  ArrowLeft, MoreVertical, Phone, Video as VideoIcon, Search, Smile, Paperclip, Mic, Send, 
  Check, CheckCheck, Reply, Trash2, Star, Forward, Info, X,
  Languages, Pin, Lock, ArrowUp, ArrowDown, CheckSquare,
} from 'lucide-react';
import { useChatWindowController } from '../hooks/useChatWindowController';
import MediaCarousel from './media/MediaCarousel';
import VideoMessage from './media/VideoMessage';

const REACTIONS_LIST = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const ChatWindow = () => {
    const ctrl = useChatWindowController();

    if (!ctrl.chat) return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-wa-bg">
            <p>Chat not found</p>
            <button onClick={ctrl.navigateToChats} className="mt-4 text-wa-teal">Go back</button>
        </div>
    );

    const filteredMessages = ctrl.messageSearchQuery 
        ? ctrl.chatMessages.filter(m => m.text.toLowerCase().includes(ctrl.messageSearchQuery.toLowerCase()))
        : ctrl.chatMessages;

    const groupedMessages: { date: string, msgs: typeof ctrl.chatMessages }[] = [];
    filteredMessages.forEach(msg => {
        let date = 'Unknown Date';
        try { date = new Date(msg.timestamp).toLocaleDateString(); } catch (e) { }
        const lastGroup = groupedMessages[groupedMessages.length - 1];
        if (lastGroup && lastGroup.date === date) lastGroup.msgs.push(msg);
        else groupedMessages.push({ date, msgs: [msg] });
    });

    const getBubbleColor = (isMe: boolean) => isMe ? ctrl.chatSettings.outgoingBubbleColor : ctrl.chatSettings.incomingBubbleColor;
    const getFontSizeClass = () => {
         switch(ctrl.chatSettings.fontSize) {
             case 'small': return 'text-[13px]';
             case 'large': return 'text-[17px]';
             default: return 'text-[15px]';
         }
    };

    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full bg-[#EFEAE2] dark:bg-[#0b141a] relative">
            <div className="absolute inset-0 opacity-40 pointer-events-none z-0" 
                 style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundRepeat: 'repeat', backgroundSize: '400px' }}>
            </div>

            {/* Date Lock Modal */}
            {ctrl.dateLockTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-wa-dark-paper rounded-xl shadow-2xl w-full max-w-xs p-6 flex flex-col items-center">
                        <div className="w-12 h-12 bg-wa-teal rounded-full flex items-center justify-center mb-4 text-white"><Lock size={24} /></div>
                        <h3 className="text-lg font-medium text-[#111b21] dark:text-gray-100 mb-1">{ctrl.chat.hiddenDates?.includes(ctrl.dateLockTarget) ? 'Unlock Date' : 'Lock Date'}</h3>
                        <p className="text-xs text-[#667781] dark:text-gray-400 mb-6 text-center">Enter Daily PIN (1234) to {ctrl.chat.hiddenDates?.includes(ctrl.dateLockTarget) ? 'show' : 'hide'} messages from <br/><strong>{ctrl.dateLockTarget}</strong></p>
                        <form onSubmit={ctrl.handleLockVerify} className="w-full flex flex-col items-center">
                            <input type="password" maxLength={4} value={ctrl.lockPin} onChange={(e) => { ctrl.setLockPin(e.target.value); ctrl.setLockError(''); }} className="w-full text-center text-2xl tracking-[0.5em] font-medium py-2 border-b-2 border-wa-teal bg-transparent outline-none mb-2 text-[#111b21] dark:text-gray-100 placeholder-transparent" placeholder="****" autoFocus />
                            {ctrl.lockError && <p className="text-red-500 text-xs mb-4 font-medium">{ctrl.lockError}</p>}
                            <div className="flex gap-3 w-full mt-4">
                                <button type="button" onClick={() => ctrl.setDateLockTarget(null)} className="flex-1 py-2 text-wa-teal font-medium hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-full transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-2 bg-wa-teal text-white font-medium rounded-full shadow-sm hover:shadow-md transition-all">{ctrl.chat.hiddenDates?.includes(ctrl.dateLockTarget) ? 'Unlock' : 'Lock'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header / Selection Mode / Search */}
            {ctrl.isSelectionMode ? (
                 <div className="h-[60px] bg-wa-teal dark:bg-wa-dark-header flex items-center px-4 gap-6 text-white z-10 shrink-0 shadow-md">
                    <div className="flex items-center gap-4"><button onClick={() => { ctrl.setIsSelectionMode(false); ctrl.setSelectedMessages(new Set()); }}><X size={24} /></button><span className="font-bold text-xl">{ctrl.selectedMessages.size}</span></div>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-6"><button><Reply size={24} className="scale-x-[-1]" /></button><button><Star size={24} /></button><button onClick={ctrl.handleDeleteSelected}><Trash2 size={24} /></button><button><Forward size={24} /></button></div>
                 </div>
            ) : ctrl.isSearchOpen ? (
                <div className="h-[60px] bg-white dark:bg-wa-dark-header flex items-center px-2 z-10 shrink-0 border-b border-gray-200 dark:border-gray-700 animate-in fade-in duration-200">
                    <button onClick={() => { ctrl.setIsSearchOpen(false); ctrl.setMessageSearchQuery(''); }} className="p-2 text-gray-500 dark:text-gray-300"><ArrowLeft size={24} /></button>
                    <div className="flex-1 mx-2 bg-gray-100 dark:bg-wa-dark-input rounded-lg px-3 py-1.5 flex items-center"><input autoFocus type="text" className="w-full bg-transparent outline-none text-[#111b21] dark:text-gray-100" placeholder="Search in chat..." value={ctrl.messageSearchQuery} onChange={(e) => ctrl.setMessageSearchQuery(e.target.value)} /></div>
                    <div className="flex items-center text-gray-400"><button className="p-2"><ArrowUp size={20} /></button><button className="p-2"><ArrowDown size={20} /></button></div>
                </div>
            ) : (
                <div className="h-[60px] bg-wa-grayBg dark:bg-wa-dark-header flex items-center px-4 justify-between border-b border-wa-border dark:border-wa-dark-border z-10 shrink-0">
                    <div className="flex items-center gap-3 cursor-pointer flex-1 min-w-0 mr-2" onClick={ctrl.navigateToInfo}>
                        <button onClick={(e) => { e.stopPropagation(); ctrl.navigateToChats(); }} className="md:hidden mr-1 shrink-0"><ArrowLeft size={24} className="text-[#54656f] dark:text-gray-400" /></button>
                        <img src={ctrl.chat.isGroup ? 'https://picsum.photos/300' : ctrl.contact?.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        <div className="flex flex-col justify-center min-w-0">
                            <h2 className="text-[#111b21] dark:text-gray-100 font-medium text-base truncate">{ctrl.chat.isGroup ? ctrl.chat.groupName : ctrl.contact?.name}</h2>
                            <p className="text-xs text-[#667781] dark:text-gray-400 overflow-x-auto whitespace-nowrap no-scrollbar">{ctrl.chat.isGroup ? (ctrl.chat.groupParticipants?.map(p => ctrl.users[p]?.name).join(', ') || 'click for info') : 'online'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 text-wa-teal dark:text-wa-teal shrink-0">
                        {!ctrl.chat.isLocked && <button onClick={() => ctrl.openGameInvite({ isGroup: ctrl.chat?.isGroup || false, chatId: ctrl.chat?.id, opponentId: ctrl.chat?.isGroup ? 'group' : ctrl.chat?.contactId })} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full md:block hidden" title="Play Game"><span className="text-xl">🎮</span></button>}
                        <button onClick={() => ctrl.contact && ctrl.startCall(ctrl.contact.id, 'video')} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"><VideoIcon size={24} /></button>
                        <button onClick={() => ctrl.contact && ctrl.startCall(ctrl.contact.id, 'voice')} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"><Phone size={22} /></button>
                        <button className="hidden md:block p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full" onClick={() => ctrl.setIsSearchOpen(true)}><Search size={22} className="text-[#54656f] dark:text-gray-400" /></button>
                        <div className="relative">
                            <button onClick={() => ctrl.setIsMenuOpen(!ctrl.isMenuOpen)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-[#54656f] dark:text-gray-400"><MoreVertical size={22} /></button>
                            {ctrl.isMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => ctrl.setIsMenuOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl border border-wa-border dark:border-wa-dark-border z-50 py-2 origin-top-right animate-in fade-in zoom-in-95 duration-200">
                                        <button onClick={() => { ctrl.navigateToInfo(); ctrl.setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">{ctrl.chat.isGroup ? 'Group info' : 'Contact info'}</button>
                                        {!ctrl.chat.isLocked && <button onClick={() => { ctrl.openGameInvite({ isGroup: ctrl.chat?.isGroup || false, chatId: ctrl.chat?.id, opponentId: ctrl.chat?.isGroup ? 'group' : ctrl.chat?.contactId }); ctrl.setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px] flex items-center gap-2"><span>Play Game</span><span className="text-sm">🎮</span></button>}
                                        <button onClick={() => { ctrl.setIsSearchOpen(true); ctrl.setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">Search</button>
                                        <button onClick={() => { ctrl.deleteMessages(ctrl.chatId!, [], true); ctrl.setIsMenuOpen(false); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">Clear chat</button>
                                        <button onClick={() => { ctrl.setIsMenuOpen(false); ctrl.navigateToChats(); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">Close chat</button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-2 md:p-4 z-0 relative scroll-smooth" ref={ctrl.chatContainerRef}>
                {!ctrl.messageSearchQuery && <div className="flex justify-center mb-6"><div className="bg-[#FFEECD] dark:bg-[#1f2c34] text-[#54656f] dark:text-[#ffcc00] text-[10px] md:text-xs px-3 py-1.5 rounded-lg text-center shadow-sm max-w-[80%] flex items-center gap-1.5"><Lock size={10} /> Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.</div></div>}
                
                {groupedMessages.map((group, gIdx) => {
                    const isDateLocked = ctrl.chat?.hiddenDates?.includes(group.date);
                    return (
                        <div key={gIdx}>
                            <div className="flex justify-center mb-4 sticky top-2 z-30 cursor-pointer select-none group" onDoubleClick={() => ctrl.setDateLockTarget(group.date)} title="Double-click to lock/unlock date">
                                <span className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm border uppercase tracking-wide transition-all ${isDateLocked ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 border-red-100 dark:border-red-800' : 'bg-white dark:bg-wa-dark-paper text-[#54656f] dark:text-gray-400 border-gray-100 dark:border-gray-800 group-hover:scale-105'}`}>
                                    {isDateLocked && <Lock size={10} />} {group.date === new Date().toLocaleDateString() ? 'Today' : group.date}
                                </span>
                            </div>
                            {!isDateLocked ? (
                                group.msgs.map((msg) => {
                                    const isMe = msg.senderId === ctrl.currentUserId;
                                    const isActive = ctrl.activeMessageId === msg.id;
                                    const isSelected = ctrl.selectedMessages.has(msg.id);
                                    const isTranslated = ctrl.translatedMessages.has(msg.id);
                                    const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                    
                                    let displayText: React.ReactNode = msg.text;
                                    if (ctrl.messageSearchQuery && msg.type === 'text') {
                                        const parts = msg.text.split(new RegExp(`(${ctrl.messageSearchQuery})`, 'gi'));
                                        displayText = parts.map((part, i) => part.toLowerCase() === ctrl.messageSearchQuery.toLowerCase() ? <span key={i} className="bg-yellow-200 text-black">{part}</span> : part);
                                    }

                                    const StatusIcon = () => (
                                        isMe && !msg.isDeleted ? (msg.status === 'read' ? <CheckCheck size={14} className="text-wa-blue" /> : msg.status === 'delivered' ? <CheckCheck size={14} className="text-gray-400" /> : <Check size={14} className="text-gray-400" />) : null
                                    );

                                    const isMediaMessage = (msg.type === 'image' || msg.type === 'video' || (msg.mediaUrls && msg.mediaUrls.length > 0)) && !msg.isDeleted;
                                    const bubblePadding = isMediaMessage ? 'p-[3px]' : 'p-1.5';

                                    return (
                                        <div key={msg.id} className={`relative flex mb-3.5 md:mb-4 ${isMe ? 'justify-end' : 'justify-start'} ${ctrl.isSelectionMode ? 'cursor-pointer hover:bg-blue-100/10 -mx-4 px-4 py-1' : ''} ${isSelected ? 'bg-blue-100/30 dark:bg-blue-900/20' : ''}`} onClick={() => ctrl.isSelectionMode && ctrl.toggleSelection(msg.id)} onContextMenu={(e) => { e.preventDefault(); if(!ctrl.isSelectionMode) { ctrl.setIsSelectionMode(true); ctrl.setSelectedMessages(new Set([msg.id])); } }}>
                                            {ctrl.isSelectionMode && (
                                                <div className={`flex items-center mr-3 ${isMe ? 'order-last ml-3 mr-0' : ''}`}>
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-wa-teal border-wa-teal' : 'border-gray-400 bg-white dark:bg-transparent'}`}>{isSelected && <Check size={14} className="text-white" strokeWidth={3} />}</div>
                                                </div>
                                            )}
                                            <div 
                                                className={`group relative max-w-[85%] md:max-w-[65%] rounded-lg shadow-sm ${bubblePadding} ${isMe ? 'rounded-tr-none' : 'rounded-tl-none'} ${isActive ? 'z-[1]' : 'z-0'}`}
                                                style={{ backgroundColor: getBubbleColor(isMe), color: '#111b21' }}
                                                onMouseEnter={() => !ctrl.isSelectionMode && ctrl.setActiveMessageId(msg.id)}
                                                onMouseLeave={() => !ctrl.isSelectionMode && ctrl.setActiveMessageId(null)}
                                            >
                                                {!msg.isDeleted && !ctrl.isSelectionMode && (
                                                    <div className={`absolute -top-10 bg-white dark:bg-wa-dark-paper rounded-full shadow-lg p-1.5 flex items-center animate-in fade-in zoom-in duration-200 z-50 ${isMe ? 'right-0 origin-bottom-right' : 'left-0 origin-bottom-left'} ${isActive || 'hidden group-hover:flex'}`}>
                                                        <div className="flex gap-1 overflow-x-auto no-scrollbar max-w-[120px] px-1">{REACTIONS_LIST.map(emoji => <button key={emoji} onClick={(e) => { e.stopPropagation(); ctrl.addReaction(ctrl.chatId!, msg.id, emoji); ctrl.setActiveMessageId(null); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-lg transition-transform hover:scale-125 shrink-0">{emoji}</button>)}</div>
                                                        <div className="w-[1px] h-6 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0"></div>
                                                        <div className="flex gap-1 shrink-0">
                                                            <button onClick={(e) => { e.stopPropagation(); ctrl.handleReply(msg); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300" title="Reply"><Reply size={16} /></button>
                                                            {msg.type === 'text' && <button onClick={(e) => { e.stopPropagation(); ctrl.handleTranslate(msg.id); }} className={`p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300 ${isTranslated ? 'text-wa-teal' : ''}`} title="Translate"><Languages size={16} /></button>}
                                                            <button onClick={(e) => { e.stopPropagation(); ctrl.togglePinMessage(ctrl.chatId!, msg.id); ctrl.setActiveMessageId(null); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300" title="Pin"><Pin size={16} fill={msg.isPinned ? "currentColor" : "none"} /></button>
                                                            <button onClick={(e) => { e.stopPropagation(); ctrl.toggleSelection(msg.id); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-gray-300" title="Select"><CheckSquare size={16} /></button>
                                                        </div>
                                                    </div>
                                                )}
                                                {msg.replyToId && <div className="mb-1 p-1 bg-black/5 dark:bg-white/10 rounded border-l-4 border-wa-teal text-xs opacity-70"><span className="font-bold block text-wa-teal">{ctrl.users[ctrl.chatMessages.find(m => m.id === msg.replyToId)?.senderId || '']?.name || 'User'}</span><span className="line-clamp-1">{ctrl.chatMessages.find(m => m.id === msg.replyToId)?.text || 'Message'}</span></div>}
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
                <div ref={ctrl.messagesEndRef} />
            </div>

            {ctrl.replyTo && <div className="bg-gray-100 dark:bg-wa-dark-paper px-4 py-2 border-l-4 border-wa-teal flex justify-between items-center z-10 mx-2 mt-2 rounded-lg"><div className="flex flex-col text-sm max-w-[90%]"><span className="text-wa-teal font-medium text-xs">Replying to {ctrl.users[ctrl.replyTo.senderId]?.name || 'User'}</span><span className="truncate text-gray-600 dark:text-gray-300">{ctrl.replyTo.text}</span></div><button onClick={() => ctrl.setReplyTo(null)}><X size={20} className="text-gray-500" /></button></div>}
            
            {/* Input Area */}
            {ctrl.isSelectionMode ? (
                <div className="p-3 bg-wa-grayBg dark:bg-wa-dark-header border-t border-wa-border dark:border-wa-dark-border z-10 flex items-center justify-center text-sm text-gray-500">Selection Mode Active</div> 
            ) : ctrl.isRecording ? (
                <div className="p-2 md:p-3 bg-wa-grayBg dark:bg-wa-dark-header border-t border-wa-border dark:border-wa-dark-border z-10 flex items-center gap-4 animate-in slide-in-from-bottom-2 duration-200">
                    <button onClick={ctrl.cancelRecording} className="p-3 text-red-500 hover:bg-black/5 rounded-full transition-colors">
                        <Trash2 size={22} />
                    </button>
                    
                    <div className="flex-1 flex items-center gap-3">
                        <div className="flex items-center gap-2 text-[#54656f] dark:text-gray-300 text-lg font-mono">
                            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                            {formatRecordingTime(ctrl.recordingSeconds)}
                        </div>
                        <span className="text-xs text-[#667781] dark:text-gray-500 animate-pulse">Recording...</span>
                    </div>

                    <button onClick={ctrl.finishRecording} className="p-3 bg-wa-teal text-white rounded-full shadow-md hover:scale-105 transition-transform">
                        <Send size={20} className="ml-0.5" />
                    </button>
                </div>
            ) : (
                <div className="p-2 md:p-3 bg-wa-grayBg dark:bg-wa-dark-header border-t border-wa-border dark:border-wa-dark-border z-10 flex items-center gap-2">
                    <button onClick={() => ctrl.setShowPicker(!ctrl.showPicker)} className="p-2 text-[#54656f] dark:text-gray-400 hover:bg-black/5 rounded-full transition-colors"><Smile size={24} /></button>
                    <button className="p-2 text-[#54656f] dark:text-gray-400 hover:bg-black/5 rounded-full transition-colors"><Paperclip size={24} /></button>
                    <div className="flex-1 bg-white dark:bg-wa-dark-input rounded-lg flex items-center px-4 py-2"><input type="text" className="w-full bg-transparent outline-none text-[#111b21] dark:text-gray-100 placeholder:text-[#667781] dark:placeholder:text-gray-500 text-[15px]" placeholder="Type a message" value={ctrl.inputText} onChange={(e) => ctrl.setInputText(e.target.value)} onKeyDown={ctrl.handleKeyDown} /></div>
                    {ctrl.inputText.trim() ? (
                        <button onClick={() => ctrl.handleSendMessage()} className="p-3 bg-wa-teal text-white rounded-full shadow-md hover:scale-105 transition-transform"><Send size={20} className="ml-0.5" /></button> 
                    ) : (
                        <button onClick={ctrl.startRecording} className="p-3 bg-wa-teal text-white rounded-full shadow-md hover:scale-105 transition-transform active:scale-95"><Mic size={20} /></button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
