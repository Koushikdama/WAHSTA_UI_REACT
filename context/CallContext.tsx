
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ActiveCall } from '../types';

interface CallContextType {
  activeCall: ActiveCall | null;
  startCall: (contactId: string, type: 'voice' | 'video') => void;
  endCall: () => void;
  minimizeCall: () => void;
  maximizeCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const ringTimerRef = useRef<number | null>(null);

  const startCall = (contactId: string, type: 'voice' | 'video') => {
      // Create new call instance
      const newCall: ActiveCall = {
          id: `call_${Date.now()}`,
          contactId,
          type,
          status: 'ringing',
          isMinimized: false,
          isMuted: false,
          isVideoEnabled: type === 'video'
      };
      setActiveCall(newCall);

      // Simulate connection delay
      if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
      ringTimerRef.current = window.setTimeout(() => {
          setActiveCall(prev => prev ? { ...prev, status: 'connected', startTime: Date.now() } : null);
      }, 3000);
  };

  const endCall = () => {
      if (ringTimerRef.current) clearTimeout(ringTimerRef.current);
      setActiveCall(prev => prev ? { ...prev, status: 'ended' } : null);
      
      // Clear call data after animation
      setTimeout(() => {
          setActiveCall(null);
      }, 1000);
  };

  const minimizeCall = () => {
      setActiveCall(prev => prev ? { ...prev, isMinimized: true } : null);
  };

  const maximizeCall = () => {
      setActiveCall(prev => prev ? { ...prev, isMinimized: false } : null);
  };

  const toggleMute = () => {
      setActiveCall(prev => prev ? { ...prev, isMuted: !prev.isMuted } : null);
  };

  const toggleVideo = () => {
      setActiveCall(prev => prev ? { ...prev, isVideoEnabled: !prev.isVideoEnabled } : null);
  };

  return (
    <CallContext.Provider value={{ 
        activeCall, 
        startCall, 
        endCall, 
        minimizeCall, 
        maximizeCall, 
        toggleMute, 
        toggleVideo 
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within CallProvider');
  return context;
};
