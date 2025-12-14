
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { MessageCircle, Phone, CircleDashed, Settings, Search, Plus, ArrowLeft, Camera, Edit2, MoreVertical, Lock } from 'lucide-react';

import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import StatusTab from './components/StatusTab';
import CallsTab from './components/CallsTab';
import SettingsTab from './components/SettingsTab';
import NewChat from './components/NewChat';
import GroupInfo from './components/GroupInfo';
import ArchivedChats from './components/ArchivedChats';
import { AppProvider, useApp } from './context/AppContext';
import { GameProvider, useGame } from './context/GameContext'; // Import Game Context
import GameInviteModal from './components/games/GameInviteModal'; // Import Game Components
import FloatingGameView from './components/games/FloatingGameView';
import { CallProvider } from './context/CallContext'; // Import Call Context
import CallOverlay from './components/CallOverlay'; // Import Call Overlay

// --- Global Game Wrapper Component ---
const GlobalGameUI = () => {
    const { isGameInviteOpen, closeGameInvite, createGame, inviteOptions } = useGame();
    const handleGameSelect = (type: any) => {
        if (inviteOptions.chatId && inviteOptions.opponentId) {
            createGame(type, inviteOptions.chatId, inviteOptions.opponentId);
        } else {
            console.error("Game initialization failed: Missing chat context");
            closeGameInvite();
        }
    };

    return (
        <>
            <GameInviteModal 
                isOpen={isGameInviteOpen} 
                isGroup={inviteOptions.isGroup}
                onClose={closeGameInvite} 
                onSelectGame={handleGameSelect} 
            />
            <FloatingGameView />
        </>
    );
};

const DesktopLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('chats');
  const { searchQuery, setSearchQuery, currentUser, logoEffect, theme } = useApp();

  // Determine active view based on path
  useEffect(() => {
    if (location.pathname.startsWith('/status')) setActiveTab('status');
    else if (location.pathname.startsWith('/calls')) setActiveTab('calls');
    else if (location.pathname.startsWith('/settings')) setActiveTab('settings');
    else setActiveTab('chats');
  }, [location]);

  // Determine if we should show the main sidebar header (Avatar + Nav Icons)
  const isSubPage = 
    location.pathname.startsWith('/settings') || 
    location.pathname.startsWith('/calls') || 
    location.pathname.startsWith('/new-chat') || 
    location.pathname.startsWith('/archived');
  
  const showSidebarHeader = !isSubPage;

  // Determine effect class for desktop header
  const getDesktopEffectClass = () => {
      if (logoEffect === 'wave') return 'effect-wave';
      if (logoEffect === 'shine') {
          return theme === 'dark' ? 'effect-shine' : 'effect-shine-dark';
      }
      return '';
  };

  const desktopEffectClass = getDesktopEffectClass();
  const desktopTextColors = logoEffect === 'shine' ? '' : 'text-[#111b21] dark:text-gray-100';

  return (
    <div className="flex h-screen w-full bg-[#EFEAE2] dark:bg-[#0b141a] relative overflow-hidden xl:px-10 xl:py-5">
      {/* Green background strip for desktop visual */}
      <div className="absolute top-0 left-0 w-full h-32 bg-wa-teal dark:bg-wa-tealDark -z-10 hidden xl:block"></div>

      <div className="flex w-full h-full bg-white dark:bg-wa-dark-bg xl:shadow-lg xl:rounded-lg overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-full md:w-[400px] flex flex-col border-r border-wa-border dark:border-wa-dark-border bg-white dark:bg-wa-dark-bg h-full relative z-10">
          
          {/* Header - Only shown for main chat list and status */}
          {showSidebarHeader && (
            <div className="h-[60px] bg-wa-grayBg dark:bg-wa-dark-header flex items-center justify-between px-4 shrink-0 border-b border-wa-border dark:border-wa-dark-border">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/settings')}>
                    <img src={currentUser.avatar} alt="Me" className="w-10 h-10 rounded-full object-cover" />
                    <span className={`font-medium ${desktopTextColors} ${desktopEffectClass}`}>
                        {currentUser.name}
                    </span>
                </div>
                <div className="flex gap-6 text-wa-gray dark:text-gray-400">
                <div className="cursor-pointer" onClick={() => navigate('/status')}><CircleDashed size={24} strokeWidth={activeTab === 'status' ? 2.5 : 2} className={activeTab === 'status' ? 'text-wa-teal dark:text-wa-teal' : ''} /></div>
                <div className="cursor-pointer" onClick={() => navigate('/new-chat')}><MessageCircle size={24} strokeWidth={activeTab === 'chats' ? 2.5 : 2} className={location.pathname === '/new-chat' ? 'text-wa-teal dark:text-wa-teal' : ''} /></div>
                <div className="cursor-pointer" onClick={() => navigate('/calls')}><Phone size={24} strokeWidth={activeTab === 'calls' ? 2.5 : 2} className={activeTab === 'calls' ? 'text-wa-teal dark:text-wa-teal' : ''} /></div>
                </div>
            </div>
          )}

          {/* Search - Only shown when Sidebar Header is shown */}
          {showSidebarHeader && location.pathname !== '/status' && (
            <div className="bg-white dark:bg-wa-dark-bg p-2 border-b border-wa-border dark:border-wa-dark-border">
                <div className="bg-wa-grayBg dark:bg-wa-dark-input rounded-lg px-4 py-2 flex items-center gap-4 text-wa-gray dark:text-gray-400 h-9 transition-colors">
                <Search size={18} />
                <input 
                    type="text" 
                    placeholder="Search or start new chat" 
                    className="bg-transparent outline-none text-sm w-full text-black dark:text-white placeholder:text-wa-gray dark:placeholder:text-gray-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                </div>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-white dark:bg-wa-dark-bg">
             <Routes>
                <Route path="/" element={<ChatList />} />
                <Route path="/chats" element={<ChatList />} />
                <Route path="/status" element={<StatusTab />} />
                <Route path="/calls" element={<CallsTab />} />
                <Route path="/settings" element={<SettingsTab />} />
                <Route path="/new-chat" element={<NewChat />} />
                <Route path="/archived" element={<ArchivedChats />} />
                
                {/* On mobile: show chat window in sidebar area (effectively full screen). 
                    On desktop: show ChatList in sidebar while right side handles content. */}
                <Route path="/chat/:chatId" element={
                    <>
                        <div className="md:hidden h-full"><ChatWindow /></div>
                        <div className="hidden md:block h-full"><ChatList /></div>
                    </>
                } /> 
                <Route path="/chat/:chatId/info" element={
                    <>
                        <div className="md:hidden h-full"><GroupInfo /></div>
                        <div className="hidden md:block h-full"><ChatList /></div>
                    </>
                } /> 
             </Routes>
          </div>
        </div>

        {/* Right Side - Chat Window (Desktop Only) */}
        <div className="hidden md:flex flex-1 bg-wa-bg relative flex-col h-full border-l border-wa-border dark:border-wa-dark-border">
            <Routes>
                <Route path="/chat/:chatId" element={<ChatWindow />} />
                <Route path="/chat/:chatId/info" element={<GroupInfo />} />
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center h-full text-center px-10 border-b-[6px] border-wa-teal dark:border-wa-tealDark bg-[#f0f2f5] dark:bg-wa-dark-border">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-20 h-20 opacity-30 mb-8" />
                     <h1 className={`text-3xl font-light text-[#41525d] dark:text-gray-300 mb-4 ${logoEffect === 'shine' ? 'effect-shine-dark' : logoEffect === 'wave' ? 'effect-wave' : ''}`}>
                         WhatsApp Web
                     </h1>
                     <p className="text-[#667781] dark:text-gray-400 text-sm">Send and receive messages without keeping your phone online.<br/>Use WhatsApp on up to 4 linked devices and 1 phone.</p>
                  </div>
                } />
            </Routes>
        </div>
      </div>
      
      {/* Global Game System UI Overlay */}
      <GlobalGameUI />
      {/* Global Call Overlay */}
      <CallOverlay />
    </div>
  );
};

// Mobile Layout uses bottom navigation and full page transitions
const MobileLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { searchQuery, setSearchQuery, currentUser, logoEffect } = useApp();
    const [showSearch, setShowSearch] = useState(false);
    
    // Check if we are in a sub-view that should take full screen and hide nav
    const isChatOpen = location.pathname.includes('/chat/') && !location.pathname.includes('/new-chat');
    const isSubPage = location.pathname === '/new-chat' || location.pathname === '/archived';

    useEffect(() => {
        // Reset search when changing tabs, but keep it if toggling search UI
        if (!location.pathname.includes('chats')) {
             setShowSearch(false);
             setSearchQuery('');
        }
    }, [location.pathname]);

    // Wrap Mobile Chat View
    if (isChatOpen) {
        return (
             <div className="h-screen w-full bg-wa-bg">
                <Routes>
                    <Route path="/chat/:chatId" element={<ChatWindow />} />
                    <Route path="/chat/:chatId/info" element={<GroupInfo />} />
                </Routes>
                <GlobalGameUI />
                <CallOverlay />
             </div>
        );
    }

    if (isSubPage) {
        return (
            <div className="h-screen w-full bg-white dark:bg-wa-dark-bg">
                 <Routes>
                    <Route path="/new-chat" element={<NewChat />} />
                    <Route path="/archived" element={<ArchivedChats />} />
                 </Routes>
                 <CallOverlay />
            </div>
        )
    }

    return (
        <div className="h-screen w-full flex flex-col bg-white dark:bg-wa-dark-bg transition-colors">
            {/* Top Bar */}
            <div className="h-[60px] bg-wa-teal dark:bg-wa-dark-header text-white dark:text-gray-200 flex items-center justify-between px-4 shadow-sm z-20 transition-colors shrink-0">
                {showSearch ? (
                    <div className="flex items-center w-full gap-3 animate-in fade-in slide-in-from-right-4 duration-200">
                        <ArrowLeft size={24} onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="cursor-pointer" />
                        <input 
                            autoFocus
                            type="text" 
                            className="bg-transparent text-white placeholder:text-white/70 outline-none w-full text-lg" 
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                ) : (
                    <>
                        <span className={`text-xl font-medium truncate max-w-[70%] ${logoEffect === 'shine' ? 'effect-shine' : logoEffect === 'wave' ? 'effect-wave' : ''}`}>
                            {currentUser.name}
                        </span>
                        <div className="flex gap-5">
                            <Search size={22} onClick={() => setShowSearch(true)} className="cursor-pointer" />
                        </div>
                    </>
                )}
            </div>

            {/* View Content Wrapper */}
            <div className="flex-1 relative overflow-hidden bg-white dark:bg-wa-dark-bg">
                 {/* Scrollable Content */}
                 <div className="absolute inset-0 overflow-y-auto no-scrollbar pb-20">
                     <Routes>
                        <Route path="/" element={<ChatList />} />
                        <Route path="/chats" element={<ChatList />} />
                        <Route path="/status" element={<StatusTab />} />
                        <Route path="/calls" element={<CallsTab />} />
                        <Route path="/settings" element={<SettingsTab />} />
                     </Routes>
                 </div>
                 
                 {/* Floating Action Buttons */}
                 
                 {/* Chats FAB */}
                 {(location.pathname === '/' || location.pathname === '/chats') && (
                     <div 
                        onClick={() => navigate('/new-chat')}
                        className="absolute bottom-6 right-5 w-14 h-14 bg-wa-teal dark:bg-wa-tealDark rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center text-white cursor-pointer active:brightness-90 transition-all z-20 hover:scale-105"
                     >
                         <MessageCircle className="fill-white" size={24} />
                         <div className="absolute -top-1 -right-1 bg-wa-teal dark:bg-wa-tealDark rounded-full border-2 border-white dark:border-wa-dark-bg w-5 h-5 flex items-center justify-center">
                             <Plus size={10} strokeWidth={3} />
                         </div>
                     </div>
                 )}

                 {/* Calls FAB */}
                 {location.pathname === '/calls' && (
                     <div className="absolute bottom-6 right-5 w-14 h-14 bg-wa-teal dark:bg-wa-tealDark rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.3)] flex items-center justify-center text-white cursor-pointer active:brightness-90 transition-all z-20 hover:scale-105"
                     >
                         <Phone className="fill-white" size={24} />
                         <Plus size={14} strokeWidth={3} className="absolute top-2 right-2 text-white" />
                     </div>
                 )}
            </div>

            {/* Bottom Nav */}
            <div className="h-[60px] border-t border-wa-border dark:border-wa-dark-border bg-white dark:bg-wa-dark-header flex justify-around items-center text-[#54656f] dark:text-gray-400 shrink-0 z-30">
                <div className={`flex flex-col items-center gap-1 cursor-pointer ${location.pathname.includes('chats') || location.pathname === '/' ? 'text-black dark:text-white font-medium' : ''}`} onClick={() => navigate('/chats')}>
                    <MessageCircle size={24} className={location.pathname.includes('chats') || location.pathname === '/' ? 'fill-black dark:fill-white' : ''} />
                    <span className="text-[10px]">Chats</span>
                </div>
                <div className={`flex flex-col items-center gap-1 cursor-pointer ${location.pathname.includes('status') ? 'text-black dark:text-white font-medium' : ''}`} onClick={() => navigate('/status')}>
                    <CircleDashed size={24} strokeWidth={2.5} />
                    <span className="text-[10px]">Status</span>
                </div>
                <div className={`flex flex-col items-center gap-1 cursor-pointer ${location.pathname.includes('calls') ? 'text-black dark:text-white font-medium' : ''}`} onClick={() => navigate('/calls')}>
                    <Phone size={24} className={location.pathname.includes('calls') ? 'fill-black dark:fill-white' : ''} />
                    <span className="text-[10px]">Calls</span>
                </div>
                 <div className={`flex flex-col items-center gap-1 cursor-pointer ${location.pathname.includes('settings') ? 'text-black dark:text-white font-medium' : ''}`} onClick={() => navigate('/settings')}>
                    <Settings size={24} />
                    <span className="text-[10px]">Settings</span>
                </div>
            </div>
            
            {/* Global Game Overlay for non-chat screens (minimized view) */}
            <GlobalGameUI />
            {/* Global Call Overlay */}
            <CallOverlay />
        </div>
    );
};

const App = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <AppProvider>
      <GameProvider>
        <CallProvider>
            <HashRouter>
                {isMobile ? <MobileLayout /> : <DesktopLayout />}
            </HashRouter>
        </CallProvider>
      </GameProvider>
    </AppProvider>
  );
};

export default App;
