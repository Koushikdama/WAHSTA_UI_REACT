
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Video, ArrowUpRight, ArrowDownLeft, Link, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useCall } from '../context/CallContext';
import { formatTimestamp } from '../utils/formatTime';

const CallsTab = () => {
  const navigate = useNavigate();
  const { calls, users } = useApp();
  const { startCall } = useCall();

  const handleCallClick = (contactId: string, type: 'voice' | 'video') => {
      startCall(contactId, type);
  };

  return (
    <div className="flex flex-col pb-20 bg-white dark:bg-wa-dark-bg min-h-full">
      
      {/* Desktop Header with Back Button - Only visible on md+ screens */}
      <div className="hidden md:flex h-[60px] bg-wa-grayBg dark:bg-wa-dark-header items-center gap-3 px-4 shrink-0 border-b border-wa-border dark:border-wa-dark-border text-[#111b21] dark:text-gray-100 transition-colors sticky top-0 z-10">
          <button onClick={() => navigate('/chats')} className="p-2 -ml-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
              <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-medium md:text-lg">Calls</h2>
      </div>

      <div className="flex items-center gap-4 px-4 py-3 cursor-pointer active:bg-wa-grayBg dark:active:bg-wa-dark-paper hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover transition-colors">
         <div className="w-12 h-12 rounded-full bg-wa-teal flex items-center justify-center text-white">
            <Link size={24} className="-rotate-45" />
         </div>
         <div>
            <h3 className="text-[17px] text-[#111b21] dark:text-gray-100 font-medium">Create call link</h3>
            <p className="text-[13px] text-[#667781] dark:text-gray-500">Share a link for your WhatsApp call</p>
         </div>
      </div>

      <div className="px-4 py-2 text-[#667781] dark:text-gray-400 text-[15px] font-medium mt-2">Recent</div>

      {calls.map((call) => {
          const user = users[call.contactId];
          if (!user) return null;
          const isMissed = call.direction === 'missed';
          
          return (
            <div 
                key={call.id} 
                className="flex items-center gap-4 px-4 py-3 cursor-pointer active:bg-wa-grayBg dark:active:bg-wa-dark-paper hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover transition-colors"
                onClick={() => handleCallClick(call.contactId, call.type)}
            >
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                <div className="flex-1 border-b border-wa-border dark:border-wa-dark-border pb-3 -mb-3 flex justify-between items-center">
                    <div>
                        <h3 className={`text-[17px] font-medium ${isMissed ? 'text-red-500' : 'text-[#111b21] dark:text-gray-100'}`}>
                            {user.name}
                        </h3>
                        <div className="flex items-center gap-1 mt-0.5">
                            {call.direction === 'incoming' && <ArrowDownLeft size={16} className="text-wa-lightGreen" />}
                            {call.direction === 'outgoing' && <ArrowUpRight size={16} className="text-wa-lightGreen" />}
                            {call.direction === 'missed' && <ArrowDownLeft size={16} className="text-red-500" />}
                            <span className="text-[13px] text-[#667781] dark:text-gray-500">{formatTimestamp(call.timestamp)}</span>
                        </div>
                    </div>
                    <div className="text-wa-teal dark:text-wa-teal p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        {call.type === 'voice' ? <Phone size={22} /> : <Video size={24} />}
                    </div>
                </div>
            </div>
          );
      })}
    </div>
  );
};

export default CallsTab;
