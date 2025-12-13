import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const SnakeLaddersGame = () => {
    const { gameConfig } = useApp();
    const config = gameConfig?.snakeAndLadders;
    
    const [players, setPlayers] = useState([
        { id: 'p1', pos: 1, color: 'bg-blue-500' },
        { id: 'p2', pos: 1, color: 'bg-red-500' } // AI
    ]);
    const [turn, setTurn] = useState(0); // 0 or 1
    const [dice, setDice] = useState<number | null>(null);
    const [rolling, setRolling] = useState(false);
    const [message, setMessage] = useState('Roll the dice!');

    const handleRoll = () => {
        if (rolling || (turn === 1 && players[1].id === 'p2')) return; // Prevent clicking during AI turn or roll
        
        performTurn(turn);
    };

    const performTurn = (playerIdx: number) => {
        setRolling(true);
        setMessage('Rolling...');
        
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            setDice(roll);
            setRolling(false);
            
            movePlayer(playerIdx, roll);
        }, 600);
    };

    const movePlayer = (playerIdx: number, roll: number) => {
        setPlayers(prev => {
            const newPlayers = [...prev];
            let newPos = newPlayers[playerIdx].pos + roll;
            
            if (newPos > 100) newPos = newPlayers[playerIdx].pos; // Must hit 100 exactly
            
            // Check Snakes & Ladders
            let msg = `Moved to ${newPos}`;
            if (config?.snakes[newPos]) {
                newPos = config.snakes[newPos];
                msg = `Oops! Snake bit down to ${newPos}`;
            } else if (config?.ladders[newPos]) {
                newPos = config.ladders[newPos];
                msg = `Yay! Ladder up to ${newPos}`;
            }

            newPlayers[playerIdx].pos = newPos;
            setMessage(msg);
            
            if (newPos === 100) {
                setMessage(playerIdx === 0 ? 'You Won!' : 'Opponent Won!');
                return newPlayers;
            }

            // Next Turn
            if (roll !== 6) {
                setTimeout(() => {
                    setTurn(t => {
                        const nextT = t === 0 ? 1 : 0;
                        if (nextT === 1) { // AI Turn
                            setTimeout(() => performTurn(1), 1000);
                        }
                        return nextT;
                    });
                    setDice(null);
                }, 1500);
            } else {
                setMessage("Rolled 6! Roll again.");
                if (playerIdx === 1) { // AI rolls again
                     setTimeout(() => performTurn(1), 1500);
                } else {
                     setDice(null); // Player can click again
                }
            }

            return newPlayers;
        });
    };

    const renderBoard = () => {
        const cells = [];
        for (let row = 9; row >= 0; row--) {
            for (let col = 0; col < 10; col++) {
                // Zigzag calculation
                // Visual Row 0 (Top): 100 99 ... 91
                // Visual Row 9 (Bottom): 1 2 ... 10
                
                let renderNum = 0;
                const visualRow = 9 - row; // 0 at top
                if (visualRow % 2 === 0) {
                    renderNum = (row * 10) + (10 - col);
                } else {
                    renderNum = (row * 10) + (col + 1);
                }

                const isSnakeHead = config?.snakes[renderNum];
                const isLadderBase = config?.ladders[renderNum];

                cells.push(
                    <div key={renderNum} className={`
                        relative border-[0.5px] border-gray-300 dark:border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-400
                        ${isSnakeHead ? 'bg-red-100 dark:bg-red-900/20' : ''}
                        ${isLadderBase ? 'bg-green-100 dark:bg-green-900/20' : ''}
                    `}>
                        <span className="absolute top-0.5 left-0.5 opacity-50">{renderNum}</span>
                        {isSnakeHead && <span className="text-red-500 text-lg">🐍</span>}
                        {isLadderBase && <span className="text-green-600 text-lg">🪜</span>}
                        
                        {/* Players */}
                        <div className="flex gap-1 z-10">
                            {players.map((p, idx) => p.pos === renderNum && (
                                <div key={idx} className={`w-3 h-3 rounded-full ${p.color} shadow-sm border border-white ring-1 ring-black`}></div>
                            ))}
                        </div>
                    </div>
                );
            }
        }
        return cells;
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="w-[300px] h-[300px] bg-white dark:bg-[#1a2c38] grid grid-cols-10 grid-rows-10 shadow-lg border border-gray-400">
                {renderBoard()}
            </div>

            <div className="flex justify-between w-full px-8 items-center">
                <div className={`flex flex-col items-center transition-opacity ${turn === 0 ? 'opacity-100 scale-110' : 'opacity-50'}`}>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">You</div>
                    <span className="text-xs mt-1">Pos: {players[0].pos}</span>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={handleRoll}
                        disabled={turn !== 0}
                        className={`
                            w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg transition-all active:scale-95
                            ${turn === 0 ? 'bg-wa-teal text-white cursor-pointer hover:bg-wa-tealDark' : 'bg-gray-200 text-gray-400'}
                            ${rolling ? 'animate-bounce' : ''}
                        `}
                    >
                        {dice || '🎲'}
                    </button>
                    <span className="text-xs font-medium mt-2 text-wa-teal dark:text-wa-teal h-4">{message}</span>
                </div>

                <div className={`flex flex-col items-center transition-opacity ${turn === 1 ? 'opacity-100 scale-110' : 'opacity-50'}`}>
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">AI</div>
                    <span className="text-xs mt-1">Pos: {players[1].pos}</span>
                </div>
            </div>
        </div>
    );
};

export default SnakeLaddersGame;