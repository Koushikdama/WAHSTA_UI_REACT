import React, { createContext, useContext, useState } from 'react';
import { Game, GameType, GamePlayer } from '../types';
import { useApp } from './AppContext';

interface GameContextType {
  activeGame: Game | null;
  isGameInviteOpen: boolean;
  inviteOptions: { isGroup: boolean };
  openGameInvite: (options?: { isGroup: boolean }) => void;
  closeGameInvite: () => void;
  createGame: (type: GameType, chatId: string, opponentId: string) => void;
  closeGame: () => void;
  minimizeGame: () => void;
  maximizeGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUserId } = useApp();
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [isGameInviteOpen, setIsGameInviteOpen] = useState(false);
  const [inviteOptions, setInviteOptions] = useState({ isGroup: false });

  const openGameInvite = (options?: { isGroup: boolean }) => {
      if (options) {
          setInviteOptions(options);
      } else {
          setInviteOptions({ isGroup: false });
      }
      setIsGameInviteOpen(true);
  };

  const closeGameInvite = () => {
      setIsGameInviteOpen(false);
      setInviteOptions({ isGroup: false });
  };

  const createGame = (type: GameType, chatId: string, opponentId: string) => {
    const newGame: Game = {
        id: `g_${Date.now()}`,
        type,
        chatId,
        status: 'in_progress', 
        timestamp: new Date().toISOString(),
        currentTurn: currentUserId, 
        players: [
            { userId: currentUserId, status: 'playing', color: 'white' },
            { userId: opponentId, status: 'playing', color: 'black' }
        ],
        isMinimized: false
    };
    setActiveGame(newGame);
    setIsGameInviteOpen(false);
  };

  const closeGame = () => setActiveGame(null);
  
  const minimizeGame = () => {
      if (activeGame) setActiveGame({ ...activeGame, isMinimized: true });
  };

  const maximizeGame = () => {
      if (activeGame) setActiveGame({ ...activeGame, isMinimized: false });
  };

  return (
    <GameContext.Provider value={{ 
        activeGame, 
        isGameInviteOpen, 
        inviteOptions,
        openGameInvite, 
        closeGameInvite, 
        createGame,
        closeGame,
        minimizeGame,
        maximizeGame
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};