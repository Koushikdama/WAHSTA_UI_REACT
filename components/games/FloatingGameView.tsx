
import React from 'react';
import { Minus, X, Trophy, Dice5, Gamepad2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { GameType } from '../../types';
import ChessGame from './chess/ChessGame';
import LudoGame from './ludo/LudoGame';
import SnakeLaddersGame from './snake-ladders/SnakeLaddersGame';

const FloatingGameView = () => {
    const { activeGame, closeGame, minimizeGame, maximizeGame } = useGame();

    if (!activeGame) return null;

    const getIcon = (type: GameType) => {
        switch (type) {
            case 'chess': return <Trophy size={18} />;
            case 'ludo': return <Dice5 size={18} />;
            case 'snake': return <Gamepad2 size={18} />;
        }
    };

    const getTitle = (type: GameType) => {
        switch (type) {
            case 'chess': return 'Chess';
            case 'ludo': return 'Ludo King';
            case 'snake': return 'Snake & Ladders';
        }
    };

    const getColor = (type: GameType) => {
        switch (type) {
            case 'chess': return 'bg-purple-600';
            case 'ludo': return 'bg-red-600';
            case 'snake': return 'bg-green-600';
        }
    };

    // Minimized State (Floating Pill)
    if (activeGame.isMinimized) {
        return (
            <div 
                onClick={maximizeGame}
                className="fixed bottom-20 md:bottom-6 right-4 z-50 flex items-center gap-3 bg-white dark:bg-wa-dark-paper pl-2 pr-4 py-2 rounded-full shadow-lg cursor-pointer border border-wa-border dark:border-gray-700 animate-in slide-in-from-bottom-10 hover:scale-105 transition-transform"
            >
                <div className={`w-8 h-8 rounded-full ${getColor(activeGame.type)} text-white flex items-center justify-center animate-pulse`}>
                    {getIcon(activeGame.type)}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-[#111b21] dark:text-gray-100">{getTitle(activeGame.type)}</span>
                    <span className="text-[10px] text-green-500 font-bold uppercase">Playing...</span>
                </div>
            </div>
        );
    }

    // Maximized State
    return (
        <div className="fixed inset-0 md:inset-auto md:bottom-4 md:right-4 md:w-[400px] md:h-[650px] z-50 flex flex-col bg-white dark:bg-[#111b21] md:rounded-xl md:shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 md:border border-gray-200 dark:border-gray-700">
            
            {/* Header */}
            <div className={`${getColor(activeGame.type)} p-3 flex justify-between items-center text-white shrink-0 shadow-sm z-10`}>
                <div className="flex items-center gap-2">
                    {getIcon(activeGame.type)}
                    <span className="font-medium">{getTitle(activeGame.type)}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={minimizeGame} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <Minus size={20} />
                    </button>
                    <button onClick={closeGame} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Game Content */}
            <div className="flex-1 flex flex-col bg-gray-100 dark:bg-[#0b141a] relative overflow-hidden">
                <div className="flex-1 flex items-center justify-center p-0 md:p-2 h-full w-full">
                    {activeGame.type === 'chess' && <ChessGame />}
                    {activeGame.type === 'ludo' && <LudoGame />}
                    {activeGame.type === 'snake' && <SnakeLaddersGame />}
                </div>
            </div>
        </div>
    );
};

export default FloatingGameView;
