
import React, { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, Lock, BadgeCheck, Camera, Edit2, X, Send, Smile, Type, Crop, User, Archive, ChevronDown, ChevronUp, MoreVertical, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTimestamp } from '../utils/formatTime';
import { StatusUpdate, StatusPrivacyType } from '../types';
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
  const navigate = useNavigate();
  const { users, currentUserId, statusUpdates, channels, addStatusUpdate, searchQuery, chats, securitySettings, statusPrivacy } = useApp();
  const myStatusUser = users[currentUserId];
  
  // UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isArchiveExpanded, setIsArchiveExpanded] = useState(false);
  const [isViewedExpanded, setIsViewedExpanded] = useState(false);
  const [showArchiveAuth, setShowArchiveAuth] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [authError, setAuthError] = useState('');

  // Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPreview, setUploadPreview] = useState<{ url: string, file: File } | null>(null);
  const [uploadCaption, setUploadCaption] = useState('');

  // Viewer State
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean;
    updates: StatusUpdate[];
    startIndex: number;
  }>({ isOpen: false, updates: [], startIndex: 0 });

  // --- Filtering Logic ---
  const { myUpdates, recentUpdates, viewedUpdates, archivedUpdates } = useMemo(() => {
      const archivedContactIds = new Set(
          chats.filter(c => c.isArchived).map(c => c.contactId)
      );

      const filtered = statusUpdates.filter(s => {
          if (!searchQuery) return true;
          const user = users[s.userId];
          return user && user.name.toLowerCase().includes(searchQuery.toLowerCase());
      });

      const myBucket: StatusUpdate[] = [];
      const archivedBucket: StatusUpdate[] = [];
      const recentBucket: StatusUpdate[] = [];
      const viewedBucket: StatusUpdate[] = [];

      filtered.forEach(s => {
          if (s.userId === currentUserId) {
              myBucket.push(s);
          } else if (archivedContactIds.has(s.userId)) {
              archivedBucket.push(s);
          } else {
              if (s.viewed) viewedBucket.push(s);
              else recentBucket.push(s);
          }
      });

      return {
          myUpdates: myBucket,
          archivedUpdates: archivedBucket,
          recentUpdates: recentBucket,
          viewedUpdates: viewedBucket
      };
  }, [statusUpdates, chats, currentUserId, searchQuery, users]);

  // --- Handlers ---

  const handleArchiveHeaderClick = () => {
      if (isArchiveExpanded) {
          setIsArchiveExpanded(false);
      } else {
          setAuthPin('');
          setAuthError('');
          setShowArchiveAuth(true);
      }
  };

  const verifyArchivePin = (e?: React.FormEvent) => {
      e?.preventDefault();
      const requiredPin = securitySettings.chatLockPassword || '0000';
      if (authPin === requiredPin) {
          setShowArchiveAuth(false);
          setIsArchiveExpanded(true);
      } else {
          setAuthError('Incorrect PIN');
          setAuthPin('');
      }
  };

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

  const getPrivacyLabel = (type: StatusPrivacyType) => {
      switch(type) {
          case 'all': return 'Status (All Friends)';
          case 'followers': return 'Status (Followers)';
          case 'followings': return 'Status (Followings)';
          case 'archive': return 'Status (Archive)';
          case 'contacts': return 'Status (Contacts)';
          case 'except': return 'Status (Custom)';
          case 'only': return 'Status (Custom)';
          default: return 'Status (All)';
      }
  };

  if (!myStatusUser) return null;

  const hasUnviewedArchived = archivedUpdates.some(s => !s.viewed);

  return (
    <div className="flex flex-col pb-20 bg-white dark:bg-wa-dark-bg min-h-full relative">
      
      {/* Header Row for Status */}
      <div className="flex items-center justify-between px-4 py-4 md:hidden">
          <h1 className="text-xl font-medium text-[#111b21] dark:text-gray-100">Status</h1>
          <div className="relative">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 -mr-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                  <MoreVertical size={20} className="text-[#54656f] dark:text-gray-400" />
              </button>
              {isMenuOpen && (
                  <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-wa-dark-paper rounded-lg shadow-xl border border-wa-border dark:border-gray-700 z-50 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                          <button onClick={() => { setIsMenuOpen(false); navigate('/status/privacy'); }} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">Status privacy</button>
                          <button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-wa-dark-hover text-[#111b21] dark:text-gray-100 text-[15px]">Settings</button>
                      </div>
                  </>
              )}
          </div>
      </div>

      <input 
          type="file" 
          accept="image/*,video/*" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileSelect}
      />

      {/* Archive Lock Modal */}
      {showArchiveAuth && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
              <div className="bg-white dark:bg-wa-dark-paper rounded-xl shadow-2xl w-full max-w-xs p-6 flex flex-col items-center animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 bg-wa-teal rounded-full flex items-center justify-center mb-4 text-white">
                      <Lock size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-[#111b21] dark:text-gray-100 mb-2">Locked Status</h3>
                  <p className="text-xs text-[#667781] dark:text-gray-400 mb-6 text-center">
                      Enter Chat Lock PIN to view archived statuses.
                  </p>
                  
                  <form onSubmit={verifyArchivePin} className="w-full flex flex-col items-center">
                      <input 
                          type="password" 
                          maxLength={4}
                          value={authPin}
                          onChange={(e) => { setAuthPin(e.target.value); setAuthError(''); }}
                          className="w-full text-center text-2xl tracking-[0.5em] font-medium py-2 border-b-2 border-wa-teal bg-transparent outline-none mb-2 text-[#111b21] dark:text-gray-100 placeholder-transparent"
                          placeholder="****"
                          autoFocus
                      />
                      
                      {authError && <p className="text-red-500 text-xs mb-4 font-medium">{authError}</p>}

                      <div className="flex gap-3 w-full mt-4">
                          <button type="button" onClick={() => setShowArchiveAuth(false)} className="flex-1 py-2 text-wa-teal font-medium hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover rounded-full transition-colors">
                              Cancel
                          </button>
                          <button type="submit" className="flex-1 py-2 bg-wa-teal text-white font-medium rounded-full shadow-sm hover:shadow-md transition-all">
                              Unlock
                          </button>
                      </div>
                  </form>
              </div>
          </div>,
          document.body
      )}

      {/* Upload Preview Modal */}
      {uploadPreview && createPortal(
          <div className="fixed inset-0 z-[100] bg-[#111b21] flex flex-col animate-in fade-in duration-200">
              <div className="flex items-center justify-between p-4 z-10 absolute top-0 w-full">
                  <button onClick={() => setUploadPreview(null)} className="p-2 rounded-full hover:bg-white/10 text-white">
                      <X size={24} />
                  </button>
                  <div className="flex gap-4 text-white">
                      <button className="p-2 rounded-full hover:bg-white/10"><Crop size={24} /></button>
                      <button className="p-2 rounded-full hover:bg-white/10"><Smile size={24} /></button>
                      <button className="p-2 rounded-full hover:bg-white/10"><Type size={24} /></button>
                  </div>
              </div>
              <div className="flex-1 flex items-center justify-center bg-black relative">
                  <img src={uploadPreview.url} alt="Preview" className="max-h-full max-w-full object-contain" />
              </div>
              
              {/* Caption & Send Area */}
              <div className="bg-[#111b21] p-2 flex flex-col gap-2 relative z-20">
                  <div className="flex items-center bg-[#1f2c34] rounded-full px-4 py-2 border border-transparent focus-within:border-gray-500 transition-colors mx-2">
                      <div className="text-gray-400 mr-2"><Plus size={20} className="rotate-45" /></div>
                      <input 
                          type="text" 
                          placeholder="Add a caption..." 
                          className="flex-1 bg-transparent text-white placeholder:text-gray-400 outline-none text-[15px]"
                          value={uploadCaption}
                          onChange={(e) => setUploadCaption(e.target.value)}
                          autoFocus
                      />
                  </div>
                  
                  <div className="flex items-center justify-between px-3 pb-1">
                      <div 
                        onClick={() => { setUploadPreview(null); navigate('/status/privacy'); }}
                        className="bg-[#1f2c34] hover:bg-[#2a3942] rounded-full px-3 py-1.5 flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                          <div className="text-gray-300 text-[11px] font-medium flex items-center gap-1">
                              {getPrivacyLabel(statusPrivacy)}
                          </div>
                      </div>
                      
                      <button 
                          onClick={handleSendStatus}
                          className="w-12 h-12 bg-wa-teal rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"
                      >
                          <Send size={22} className="ml-1" />
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
      {(!searchQuery || myStatusUser.name.toLowerCase().includes(searchQuery.toLowerCase())) && (
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
      )}

      {/* Archived Status Dropdown */}
      {archivedUpdates.length > 0 && (
          <div className="border-t border-wa-border dark:border-wa-dark-border">
              <div 
                  onClick={handleArchiveHeaderClick}
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover active:bg-[#e9edef] dark:active:bg-wa-dark-paper transition-colors"
              >
                  <div className="flex items-center gap-4 opacity-90">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-transparent">
                          <Archive size={20} className="text-[#667781] dark:text-gray-400" />
                      </div>
                      <div className="flex flex-col">
                          <h3 className="text-[17px] text-[#111b21] dark:text-gray-200 font-medium flex items-center gap-2">
                              Archived updates
                              {!isArchiveExpanded && hasUnviewedArchived && (
                                  <div className="w-2 h-2 rounded-full bg-wa-lightGreen animate-pulse"></div>
                              )}
                          </h3>
                          {!isArchiveExpanded && (
                              <p className="text-[13px] text-[#667781] dark:text-gray-500">{archivedUpdates.length} updates hidden</p>
                          )}
                      </div>
                  </div>
                  <div className="text-[#667781] dark:text-gray-400">
                      {isArchiveExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
              </div>

              {isArchiveExpanded && (
                  <div className="animate-in slide-in-from-top-2 duration-200 bg-gray-50/50 dark:bg-white/5 pb-2">
                      {archivedUpdates.map((s, idx) => (
                          <StatusItem key={s.id} update={s} isViewed={s.viewed} onClick={() => openViewer(archivedUpdates, idx)} />
                      ))}
                  </div>
              )}
          </div>
      )}

      {recentUpdates.length > 0 && (
          <>
            <div className="px-4 py-2 bg-transparent text-[#667781] dark:text-gray-400 text-[13px] font-medium uppercase mt-2">
                Recent updates
            </div>
            
            {recentUpdates.map((s, idx) => (
                <StatusItem key={s.id} update={s} isViewed={false} onClick={() => openViewer(recentUpdates, idx)} />
            ))}
          </>
      )}

      {/* Viewed Updates Dropdown */}
      {viewedUpdates.length > 0 && (
          <div className="border-t border-wa-border dark:border-wa-dark-border mt-2">
              <div 
                  onClick={() => setIsViewedExpanded(!isViewedExpanded)}
                  className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-wa-grayBg dark:hover:bg-wa-dark-hover transition-colors"
              >
                  <div className="text-[#667781] dark:text-gray-400 text-[13px] font-medium uppercase">
                      Viewed updates
                  </div>
                  <div className="text-[#667781] dark:text-gray-400">
                      {isViewedExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
              </div>
              
              {isViewedExpanded && (
                  <div className="animate-in slide-in-from-top-2 duration-200">
                      {viewedUpdates.map((s, idx) => (
                          <StatusItem key={s.id} update={s} isViewed={true} onClick={() => openViewer(viewedUpdates, idx)} />
                      ))}
                  </div>
              )}
          </div>
      )}

      {/* No Results State */}
      {searchQuery && myUpdates.length === 0 && recentUpdates.length === 0 && viewedUpdates.length === 0 && archivedUpdates.length === 0 && (
          <div className="p-8 text-center text-[#667781] dark:text-gray-500 text-sm">
              No status updates found for "{searchQuery}"
          </div>
      )}

      {!searchQuery && (
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
      )}

      <div className="flex justify-center items-center gap-1 mt-4 text-[11px] text-[#667781] dark:text-gray-500">
          <Lock size={10} /> Your status updates are end-to-end encrypted
      </div>
      
      <div className="h-20"></div>

      {/* Status FABs */}
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
