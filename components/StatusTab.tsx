
import React, { useState } from 'react';
import { Plus, Lock, BadgeCheck } from 'lucide-react';
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
  const { users, currentUserId, statusUpdates, channels } = useApp();
  const myStatus = users[currentUserId];
  const recentUpdates = statusUpdates.filter(s => !s.viewed && s.userId !== currentUserId);
  const viewedUpdates = statusUpdates.filter(s => s.viewed && s.userId !== currentUserId);

  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    updates: StatusUpdate[];
    startIndex: number;
  }>({ isOpen: false, updates: [], startIndex: 0 });

  const openViewer = (updates: StatusUpdate[], startIndex: number) => {
      setViewerState({ isOpen: true, updates, startIndex });
  };

  const closeViewer = () => {
      setViewerState(prev => ({ ...prev, isOpen: false }));
  };

  if (!myStatus) return null;

  return (
    <div className="flex flex-col pb-20 bg-white dark:bg-wa-dark-bg min-h-full">
      {viewerState.isOpen && (
          <StatusViewer 
            updates={viewerState.updates} 
            initialIndex={viewerState.startIndex} 
            onClose={closeViewer} 
          />
      )}

      {/* My Status */}
      <div className="flex items-center gap-4 px-4 py-4 cursor-pointer active:bg-wa-grayBg dark:active:bg-wa-dark-paper hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover transition-colors">
        <div className="relative">
             <img src={myStatus.avatar} alt="Me" className="w-12 h-12 rounded-full object-cover" />
             <div className="absolute bottom-0 right-0 bg-wa-lightGreen rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-wa-dark-bg text-white">
                 <Plus size={14} strokeWidth={3} />
             </div>
        </div>
        <div>
            <h3 className="text-[17px] text-[#111b21] dark:text-gray-200 font-medium">My Status</h3>
            <p className="text-[13px] text-[#667781] dark:text-gray-500">Tap to add status update</p>
        </div>
      </div>

      <div className="px-4 py-2 bg-transparent text-[#667781] dark:text-gray-400 text-[13px] font-medium uppercase">
          Recent updates
      </div>
      
      {recentUpdates.map((s, idx) => (
        <StatusItem key={s.id} update={s} isViewed={false} onClick={() => openViewer(recentUpdates, idx)} />
      ))}

      <div className="px-4 py-2 bg-transparent text-[#667781] dark:text-gray-400 text-[13px] font-medium uppercase mt-2">
          Viewed updates
      </div>
      
      {viewedUpdates.map((s, idx) => (
        <StatusItem key={s.id} update={s} isViewed={true} onClick={() => openViewer(viewedUpdates, idx)} />
      ))}

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
      
      <div className="h-10"></div>
    </div>
  );
};

export default StatusTab;
