
import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';

const SnakeLaddersGame = () => {
    const { gameConfig } = useApp();
    const config = gameConfig?.snakeAndLadders || {
        snakes: { "16": 6, "47": 26, "49": 11, "56": 53, "62": 19, "64": 60, "87": 24, "93": 73, "95": 75, "98": 78 },
        ladders: { "1": 38, "4": 14, "9": 31, "21": 42, "28": 84, "36": 44, "51": 67, "71": 91, "80": 100 }
    };
    
    const [players, setPlayers] = useState([
        { id: 'p1', pos: 1, color: 'bg-blue-500', border: 'border-white', name: 'You' },
        { id: 'p2', pos: 1, color: 'bg-red-500', border: 'border-white', name: 'CPU' }
    ]);
    const [turn, setTurn] = useState(0); 
    const [dice, setDice] = useState<number | null>(null);
    const [rolling, setRolling] = useState(false);
    const [message, setMessage] = useState('Roll to start');

    const handleRoll = () => {
        if (rolling || (turn === 1)) return; 
        performTurn(turn);
    };

    const performTurn = (pIdx: number) => {
        setRolling(true);
        setMessage(pIdx === 0 ? 'Rolling...' : 'CPU Rolling...');
        
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            setDice(roll);
            setRolling(false);
            
            // Move Logic
            setPlayers(prev => {
                const newPlayers = [...prev];
                const p = newPlayers[pIdx];
                let next = p.pos + roll;
                
                if (next > 100) {
                    setMessage(`${p.name} rolled ${roll} (Too high)`);
                } else {
                    if (config.snakes[next]) {
                        setMessage(`${p.name} bit by Snake! 🐍`);
                        next = config.snakes[next];
                    } else if (config.ladders[next]) {
                        setMessage(`${p.name} climbed Ladder! 🪜`);
                        next = config.ladders[next];
                    } else {
                        setMessage(`${p.name} moved to ${next}`);
                    }
                    newPlayers[pIdx].pos = next;
                }
                
                // Turn Switch
                if (roll !== 6 && next !== 100) {
                    setTimeout(() => {
                        const nextTurn = pIdx === 0 ? 1 : 0;
                        setTurn(nextTurn);
                        setDice(null);
                        if (nextTurn === 1) setTimeout(() => performTurn(1), 1000);
                    }, 1500);
                } else if (roll === 6 && next !== 100) {
                    setMessage(`${p.name} rolled 6! Roll again.`);
                    setTimeout(() => {
                        setDice(null);
                        if (pIdx === 1) setTimeout(() => performTurn(1), 1000);
                    }, 1500);
                } else if (next === 100) {
                    setMessage(`${p.name} Wins! 🏆`);
                }

                return newPlayers;
            });

        }, 600);
    };

    // Correct ZigZag Grid Generation
    const renderBoard = () => {
        const cells = [];
        for (let row = 9; row >= 0; row--) {
            const rowCells = [];
            for (let col = 0; col < 10; col++) {
                // Determine number based on zigzag
                // Row 0 (bottom) -> 1 to 10
                // Row 1 -> 20 to 11
                // We are rendering from top (row 9) down to 0
                
                let num;
                if (row % 2 === 0) {
                    // Even row: Left to Right (e.g., 0-> 1-10)
                    num = (row * 10) + (col + 1);
                } else {
                    // Odd row: Right to Left (e.g., 1-> 20-11)
                    num = (row * 10) + (10 - col);
                }

                const isSnake = config.snakes[num];
                const isLadder = config.ladders[num];
                const bg = (row + col) % 2 === 0 ? 'bg-red-50 dark:bg-white/5' : 'bg-white dark:bg-white/10';

                rowCells.push(
                    <div key={num} className={`relative flex items-center justify-center border-[0.5px] border-black/10 ${bg}`}>
                        <span className="absolute top-0.5 left-1 text-[9px] text-gray-400 font-bold">{num}</span>
                        
                        {isSnake && <span className="text-xl opacity-80" title={`Snake to ${isSnake}`}>🐍</span>}
                        {isLadder && <span className="text-xl opacity-80" title={`Ladder to ${isLadder}`}>🪜</span>}
                        
                        <div className="absolute inset-0 flex items-center justify-center gap-1">
                            {players.map((p, i) => p.pos === num && (
                                <div key={i} className={`w-4 h-4 md:w-5 md:h-5 rounded-full ${p.color} border-2 ${p.border} shadow-md z-10 transition-all transform hover:scale-125`}></div>
                            ))}
                        </div>
                    </div>
                );
            }
            cells.push(...rowCells);
        }
        return cells;
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-[#1f2937]">
            <div className="w-full max-w-[400px] aspect-square bg-white rounded-lg shadow-2xl overflow-hidden grid grid-cols-10 grid-rows-10 border-4 border-[#374151]">
                {renderBoard()}
            </div>

            <div className="w-full max-w-[400px] mt-4 flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg">
                <div className={`flex flex-col items-center ${turn === 0 ? 'opacity-100 scale-105' : 'opacity-50'}`}>
                    <div className="w-10 h-10 bg-blue-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">You</div>
                    <span className="text-xs text-gray-500 font-medium mt-1">Pos: {players[0].pos}</span>
                </div>

                <div className="flex flex-col items-center">
                    <button 
                        onClick={handleRoll}
                        disabled={turn !== 0 || rolling}
                        className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg border-b-4 active:border-b-0 active:translate-y-1 transition-all
                            ${turn === 0 ? 'bg-indigo-500 border-indigo-700 text-white' : 'bg-gray-200 border-gray-300 text-gray-400'}
                        `}
                    >
                        {dice || '🎲'}
                    </button>
                    <span className="text-xs font-bold text-white mt-2 max-w-[120px] truncate">{message}</span>
                </div>

                <div className={`flex flex-col items-center ${turn === 1 ? 'opacity-100 scale-105' : 'opacity-50'}`}>
                    <div className="w-10 h-10 bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white font-bold">CPU</div>
                    <span className="text-xs text-gray-500 font-medium mt-1">Pos: {players[1].pos}</span>
                </div>
            </div>
        </div>
    );
};

export default SnakeLaddersGame;
