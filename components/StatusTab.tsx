
import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Lock, BadgeCheck, Camera, Edit2, X, Send, Smile, Type, Crop, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTimestamp } from '../utils/formatTime';
import { StatusUpdate } from '../types';
import StatusViewer from './StatusViewer';

interface StatusItemProps {
  update: StatusUpdate;
  isViewed: boolean;
  onClick: () => void;
}

const StatusItem: React.FC<StatusItemProps> = ({ update, isViewed, onClick }) => {
    const { users } = useApp();
    const user = users[update.userId];
    if (!user) return null;

    return (
        <div onClick={onClick} className="flex items-center gap-4 px-4 py-3 active:bg-wa-grayBg dark:active:bg-wa-dark-paper hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover transition-colors cursor-pointer">
            <div className={`p-[2px] rounded-full border-2 ${isViewed ? 'border-gray-300 dark:border-gray-600' : 'border-wa-lightGreen'}`}>
              <img src={user.avatar} alt="" className="w-12 h-12 rounded-full object-cover border border-white dark:border-wa-dark-bg" />
            </div>
            <div className="flex-1 border-b border-wa-border dark:border-wa-dark-border pb-3 -mb-3">
                <h3 className="text-[17px] text-[#111b21] dark:text-gray-200 font-medium">{user.name}</h3>
                <p className="text-[13px] text-[#667781] dark:text-gray-500">{formatTimestamp(update.timestamp)}</p>
            </div>
        </div>
    )
};

const StatusTab = () => {
  const { users, currentUserId, statusUpdates, channels, addStatusUpdate } = useApp();
  const myStatusUser = users[currentUserId];
  
  // Filter Updates
  const myUpdates = statusUpdates.filter(s => s.userId === currentUserId);
  const recentUpdates = statusUpdates.filter(s => !s.viewed && s.userId !== currentUserId);
  const viewedUpdates = statusUpdates.filter(s => s.viewed && s.userId !== currentUserId);

  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    updates: StatusUpdate[];
    startIndex: number;
  }>({ isOpen: false, updates: [], startIndex: 0 });

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPreview, setUploadPreview] = useState<{ url: string, file: File } | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');

  const openViewer = (updates: StatusUpdate[], startIndex: number) => {
      setViewerState({ isOpen: true, updates, startIndex });
  };

  const closeViewer = () => {
      setViewerState(prev => ({ ...prev, isOpen: false }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          setUploadPreview({ url, file });
          setUploadCaption('');
      }
      // Reset input
      e.target.value = '';
  };

  const handleSendStatus = () => {
      if (uploadPreview) {
          const newStatus: StatusUpdate = {
              id: `s_${Date.now()}`,
              userId: currentUserId,
              timestamp: new Date().toISOString(),
              imageUrl: uploadPreview.url,
              caption: uploadCaption,
              viewed: false
          };
          addStatusUpdate(newStatus);
          setUploadPreview(null);
      }
  };

  const triggerUpload = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      fileInputRef.current?.click();
  };

  const handleMyStatusClick = () => {
      if (myUpdates.length > 0) {
          openViewer(myUpdates, 0);
      } else {
          triggerUpload();
      }
  };

  if (!myStatusUser) return null;

  return (
    <div className="flex flex-col pb-20 bg-white dark:bg-wa-dark-bg min-h-full relative">
      <input 
          type="file" 
          accept="image/*,video/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileSelect}
      />

      {/* Upload Preview Modal */}
      {uploadPreview && createPortal(
          <div className="fixed inset-0 z-[100] bg-[#111b21] flex flex-col animate-in fade-in duration-200">
              {/* Header */}
              <div className="flex items-center justify-between p-4 z-10">
                  <button onClick={() => setUploadPreview(null)} className="p-2 rounded-full hover:bg-white/10 text-white">
                      <X size={24} />
                  </button>
                  <div className="flex gap-4 text-white">
                      <button className="p-2 rounded-full hover:bg-white/10"><Crop size={24} /></button>
                      <button className="p-2 rounded-full hover:bg-white/10"><Smile size={24} /></button>
                      <button className="p-2 rounded-full hover:bg-white/10"><Type size={24} /></button>
                  </div>
              </div>

              {/* Image Preview */}
              <div className="flex-1 flex items-center justify-center p-4 bg-black/50 relative">
                  <img src={uploadPreview.url} alt="Preview" className="max-h-full max-w-full object-contain shadow-lg" />
              </div>

              {/* Caption Bar */}
              <div className="p-3 bg-[#111b21] flex flex-col gap-2">
                  <div className="flex items-center bg-[#202c33] rounded-full px-4 py-2">
                      <input 
                          type="text" 
                          placeholder="Add a caption..." 
                          className="flex-1 bg-transparent text-white placeholder:text-gray-400 outline-none"
                          value={uploadCaption}
                          onChange={(e) => setUploadCaption(e.target.value)}
                          autoFocus
                      />
                  </div>
                  <div className="flex items-center justify-between px-2 pt-2">
                      <div className="px-3 py-1.5 bg-[#202c33] rounded-full text-xs text-gray-300 font-medium flex items-center gap-1">
                          <User size={12} /> Status (Contacts)
                      </div>
                      <button 
                          onClick={handleSendStatus}
                          className="w-12 h-12 bg-wa-teal rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
                      >
                          <Send size={20} className="ml-1" />
                      </button>
                  </div>
              </div>
          </div>,
          document.body
      )}

      {viewerState.isOpen && (
          <StatusViewer 
            updates={viewerState.updates} 
            initialIndex={viewerState.startIndex} 
            onClose={closeViewer} 
          />
      )}

      {/* My Status */}
      <div 
        onClick={handleMyStatusClick}
        className="flex items-center gap-4 px-4 py-4 cursor-pointer active:bg-wa-grayBg dark:active:bg-wa-dark-paper hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover transition-colors group"
      >
        <div className="relative">
             <div className={`p-[2px] rounded-full border-2 ${myUpdates.length > 0 ? 'border-wa-lightGreen' : 'border-transparent'}`}>
                <img src={myStatusUser.avatar} alt="Me" className="w-12 h-12 rounded-full object-cover" />
             </div>
             {myUpdates.length === 0 && (
                 <div className="absolute bottom-0 right-0 bg-wa-lightGreen rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-wa-dark-bg text-white">
                     <Plus size={14} strokeWidth={3} />
                 </div>
             )}
        </div>
        <div className="flex-1">
            <h3 className="text-[17px] text-[#111b21] dark:text-gray-200 font-medium">My Status</h3>
            <p className="text-[13px] text-[#667781] dark:text-gray-500">
                {myUpdates.length > 0 ? formatTimestamp(myUpdates[0].timestamp) : 'Tap to add status update'}
            </p>
        </div>
      </div>

      <div className="px-4 py-2 bg-transparent text-[#667781] dark:text-gray-400 text-[13px] font-medium uppercase">
          Recent updates
      </div>
      
      {recentUpdates.map((s, idx) => (
        <StatusItem key={s.id} update={s} isViewed={false} onClick={() => openViewer(recentUpdates, idx)} />
      ))}

      {viewedUpdates.length > 0 && (
          <>
            <div className="px-4 py-2 bg-transparent text-[#667781] dark:text-gray-400 text-[13px] font-medium uppercase mt-2">
                Viewed updates
            </div>
            
            {viewedUpdates.map((s, idx) => (
                <StatusItem key={s.id} update={s} isViewed={true} onClick={() => openViewer(viewedUpdates, idx)} />
            ))}
          </>
      )}

      <div className="pt-6 pb-2 border-t border-wa-border dark:border-wa-dark-border mt-4">
         <div className="flex justify-between items-center px-4 mb-4">
            <h3 className="text-[#111b21] dark:text-gray-200 font-medium text-[15px]">Find channels</h3>
            <button className="text-wa-teal hover:opacity-80 text-sm font-medium transition-opacity">See all</button>
         </div>
         
         <div className="flex gap-3 overflow-x-auto px-4 pb-4 no-scrollbar">
             {channels.map(channel => (
                 <div key={channel.id} className="w-[140px] shrink-0 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex flex-col items-center gap-3 bg-white dark:bg-wa-dark-paper shadow-sm transition-transform hover:scale-[1.02] cursor-pointer">
                     <div className="relative">
                         <div className="w-16 h-16 rounded-full p-0.5 border border-gray-100 dark:border-gray-600 bg-white">
                            <img src={channel.avatar} alt={channel.name} className="w-full h-full rounded-full object-cover" />
                         </div>
                         {channel.isVerified && (
                             <div className="absolute bottom-0 right-0 bg-white dark:bg-wa-dark-paper rounded-full p-[2px]">
                                 <BadgeCheck size={18} className="text-[#008069] fill-white dark:fill-wa-dark-paper" /> 
                             </div>
                         )}
                     </div>
                     
                     <div className="text-center w-full">
                         <h4 className="text-sm font-medium text-[#111b21] dark:text-gray-100 truncate leading-tight mb-0.5">{channel.name}</h4>
                         <p className="text-[11px] text-[#667781] dark:text-gray-500 truncate">{channel.followers}</p>
                     </div>

                     <button className="w-full py-1.5 bg-[#dcf8c6] text-[#008069] dark:bg-[#005c4b]/30 dark:text-[#00a884] hover:brightness-95 transition-all rounded-full text-sm font-medium">
                        Follow
                     </button>
                 </div>
             ))}
         </div>
      </div>

      <div className="flex justify-center items-center gap-1 mt-4 text-[11px] text-[#667781] dark:text-gray-500">
          <Lock size={10} /> Your status updates are end-to-end encrypted
      </div>
      
      <div className="h-20"></div>

      {/* Status FABs - Z-Index 40 to sit above Bottom Nav (Z-30) and positioned to clear it */}
      <div 
        onClick={() => setUploadPreview({ url: 'https://picsum.photos/seed/text/800/1200', file: new File([], 'dummy') })}
        className="fixed bottom-[148px] right-6 w-10 h-10 bg-wa-grayBg dark:bg-wa-dark-paper shadow-md rounded-full flex items-center justify-center text-[#54656f] dark:text-white transition-colors cursor-pointer z-40 hover:scale-105"
      >
           <Edit2 size={18} />
      </div>
      <div 
        onClick={(e) => triggerUpload(e)}
        className="fixed bottom-[76px] right-5 w-14 h-14 bg-wa-teal dark:bg-wa-tealDark shadow-[0_4px_10px_rgba(0,0,0,0.3)] rounded-full flex items-center justify-center text-white transition-colors cursor-pointer z-40 hover:scale-105"
      >
           <Camera size={24} />
      </div>
    </div>
  );
};

export default StatusTab;
