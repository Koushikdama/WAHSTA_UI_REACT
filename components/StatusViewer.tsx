
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft, Send, ChevronUp } from 'lucide-react';
import { StatusUpdate } from '../types';
import { useApp } from '../context/AppContext';

interface StatusViewerProps {
  updates: StatusUpdate[];
  initialIndex: number;
  onClose: () => void;
}

const REACTIONS = ["😂", "😮", "😍", "😢", "👏", "🔥", "🙏", "🎉"];

const StatusViewer: React.FC<StatusViewerProps> = ({ updates, initialIndex, onClose }) => {
  const { users, startChat, addMessage, currentUserId } = useApp();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setProgress(0);
    // Don't auto-advance if replying
    if (isReplying) return;

    const intervalTime = 30; 
    const duration = 5000; 
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, updates.length, isReplying]);

  // Focus input when replying starts
  useEffect(() => {
      if (isReplying && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isReplying]);

  const handleNext = () => {
    if (currentIndex < updates.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleReplyClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsReplying(true);
  };

  const handleSendReply = (text: string = replyText) => {
      if (!text.trim()) return;
      const update = updates[currentIndex];
      // Find chat ID for this user
      const chatId = startChat(update.userId);
      // Send message
      addMessage(chatId, `Replying to status: ${text}`, 'text');
      
      setReplyText('');
      setIsReplying(false);
      // Optional: Auto close or continue viewing? WhatsApp stays on status.
  };

  const handleReaction = (emoji: string) => {
      handleSendReply(emoji);
  };

  if (!updates || updates.length === 0 || !updates[currentIndex]) return null;

  const update = updates[currentIndex];
  const user = users[update.userId];
  const isMe = update.userId === currentUserId;
  if (!user && !isMe) return null; // Should have user data

  const bgImage = update.imageUrl || `https://picsum.photos/seed/${update.id}/600/1000`;
  const displayedUser = isMe ? { name: 'My Status', avatar: users[currentUserId].avatar } : user;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-200">
       <div className="flex gap-1 p-2 pt-4 absolute top-0 w-full z-20">
         {updates.map((_, idx) => (
           <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
             <div 
                className="h-full bg-white transition-all duration-30 ease-linear"
                style={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                }}
             />
           </div>
         ))}
       </div>

       <div className="flex items-center justify-between px-4 py-8 z-20 text-white mt-4">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="md:hidden">
               <ArrowLeft size={24} />
             </button>
             <img src={displayedUser.avatar} className="w-10 h-10 rounded-full border border-white" alt={displayedUser.name} />
             <div className="flex flex-col">
               <span className="font-semibold text-sm">{displayedUser.name}</span>
               <span className="text-xs opacity-80">{new Date(update.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
             </div>
          </div>
          <X size={24} className="cursor-pointer hidden md:block hover:opacity-80" onClick={onClose} />
       </div>

       {/* Navigation Areas */}
       <div className="absolute inset-0 flex z-10">
           <div className="w-1/3 h-full" onClick={handlePrev}></div>
           <div className="w-2/3 h-full" onClick={handleNext}></div>
       </div>

       <div className="flex-1 relative flex items-center justify-center bg-gray-900 pointer-events-none">
           <img src={bgImage} className="max-h-full max-w-full object-contain" alt="Status" />
           {update.caption && (
             <div className="absolute bottom-32 w-full text-center text-white bg-black/50 p-4 backdrop-blur-sm">
               {update.caption}
             </div>
           )}
       </div>
       
       {/* Reply Section */}
       {!isMe && (
           <div className={`absolute bottom-0 w-full z-30 transition-all duration-300 ${isReplying ? 'bg-black/80 backdrop-blur-md pb-4 pt-2 h-auto' : 'h-24 bg-gradient-to-t from-black/80 to-transparent'}`}>
                
                {/* Reactions (Visible only when replying) */}
                {isReplying && (
                    <div className="flex justify-center gap-4 mb-4 animate-in slide-in-from-bottom-5 duration-300 px-4 flex-wrap">
                        {REACTIONS.map(emoji => (
                            <button 
                                key={emoji}
                                onClick={(e) => { e.stopPropagation(); handleReaction(emoji); }}
                                className="text-3xl hover:scale-125 transition-transform"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area or Trigger */}
                <div className="px-4 w-full flex flex-col items-center">
                    {isReplying ? (
                        <div className="flex items-center gap-2 w-full max-w-lg">
                            <input 
                                ref={inputRef}
                                type="text" 
                                placeholder="Type a reply..." 
                                className="flex-1 bg-white/20 border border-white/30 rounded-full px-4 py-2 text-white placeholder:text-white/70 outline-none backdrop-blur-sm"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                                onBlur={() => !replyText && setIsReplying(false)}
                            />
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleSendReply(); }}
                                className="p-2 bg-wa-teal rounded-full text-white shadow-lg disabled:opacity-50"
                                disabled={!replyText.trim()}
                            >
                                <Send size={20} className="ml-0.5" />
                            </button>
                        </div>
                    ) : (
                        <div 
                            onClick={handleReplyClick}
                            className="flex flex-col items-center gap-1 cursor-pointer opacity-80 hover:opacity-100 transition-opacity mb-4"
                        >
                            <ChevronUp size={20} className="text-white" />
                            <span className="text-white text-sm font-medium">Reply</span>
                        </div>
                    )}
                </div>
           </div>
       )}
       
       {isMe && (
           <div className="absolute bottom-8 w-full flex justify-center z-30">
               <div className="flex items-center gap-2 text-white/90 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                   <span className="text-sm font-medium">Your Status</span>
               </div>
           </div>
       )}
    </div>,
    document.body
  );
};

export default StatusViewer;
