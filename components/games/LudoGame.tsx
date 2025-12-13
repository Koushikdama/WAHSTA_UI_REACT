import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

// Simple Ludo implementation: 4 tokens per player (Red vs Green for demo)
// Simplified path logic for demo purposes

const LudoGame = () => {
    const { gameConfig } = useApp();
    const [dice, setDice] = useState<number | null>(null);
    const [turn, setTurn] = useState<'red' | 'green'>('red');
    const [rolling, setRolling] = useState(false);
    
    // Positions: 0 (home), 1-52 (path), 53-57 (home run), 100 (finished)
    const [redPositions, setRedPositions] = useState([0, 0, 0, 0]);
    const [greenPositions, setGreenPositions] = useState([0, 0, 0, 0]); // AI or opponent

    const rollDice = () => {
        if (rolling || dice) return;
        setRolling(true);
        setTimeout(() => {
            const val = Math.floor(Math.random() * 6) + 1;
            setDice(val);
            setRolling(false);
            
            // Check if no moves possible (simple check: if all home and not 6)
            if (turn === 'red' && val !== 6 && redPositions.every(p => p === 0)) {
                setTimeout(() => changeTurn(), 1000);
            } else if (turn === 'green' && val !== 6 && greenPositions.every(p => p === 0)) {
                setTimeout(() => changeTurn(), 1000);
            } else if (turn === 'green') {
                // Simple AI move for green
                setTimeout(() => makeAiMove(val), 1000);
            }
        }, 600);
    };

    const changeTurn = () => {
        setDice(null);
        setTurn(prev => prev === 'red' ? 'green' : 'red');
        if (turn === 'red') { // Switching to green, so trigger AI roll
             setTimeout(() => document.getElementById('ai-roll-btn')?.click(), 1000);
        }
    };

    const makeAiMove = (roll: number) => {
        const movableIdx = greenPositions.findIndex(p => p > 0 || roll === 6);
        if (movableIdx !== -1) {
            handleMove(movableIdx, 'green', roll);
        } else {
            changeTurn();
        }
    };

    const handleMove = (index: number, player: 'red' | 'green', rollVal: number) => {
        if (!rollVal) return;
        
        const isRed = player === 'red';
        const positions = isRed ? [...redPositions] : [...greenPositions];
        const currentPos = positions[index];

        // Opening rule
        if (currentPos === 0) {
            if (rollVal === 6) {
                positions[index] = 1; // Start position
            } else {
                return; // Cannot move
            }
        } else {
            // Move logic (simplified path)
            const newPos = currentPos + rollVal;
            if (newPos <= 57) {
                positions[index] = newPos;
            }
        }

        if (isRed) setRedPositions(positions);
        else setGreenPositions(positions);

        if (rollVal !== 6) {
            changeTurn();
        } else {
            setDice(null); // Roll again
            if (player === 'green') { // AI rolls again
                 setTimeout(() => rollDice(), 1000);
            }
        }
    };

    const renderBoard = () => {
        // Simplified visual board using CSS Grid
        return (
            <div className="relative w-[300px] h-[300px] bg-white border-2 border-black grid grid-cols-11 grid-rows-11">
                {/* Red Base */}
                <div className="col-span-4 row-span-4 bg-red-500 border-r-2 border-b-2 border-black p-4 grid grid-cols-2 gap-4">
                    {redPositions.map((p, i) => (
                        <div key={i} className="bg-white rounded-full flex items-center justify-center">
                            {p === 0 && <div className="w-4 h-4 rounded-full bg-red-500 ring-2 ring-black cursor-pointer" onClick={() => turn === 'red' && dice && handleMove(i, 'red', dice)}></div>}
                        </div>
                    ))}
                </div>
                
                {/* Top Path */}
                <div className="col-span-3 row-span-4 grid grid-cols-3 grid-rows-6">
                     {/* Visual placeholders for grid cells */}
                     {Array.from({length: 18}).map((_, i) => <div key={i} className="border border-gray-400 bg-white"></div>)}
                </div>

                {/* Green Base */}
                <div className="col-span-4 row-span-4 bg-green-500 border-l-2 border-b-2 border-black p-4 grid grid-cols-2 gap-4">
                     {greenPositions.map((p, i) => (
                        <div key={i} className="bg-white rounded-full flex items-center justify-center">
                            {p === 0 && <div className="w-4 h-4 rounded-full bg-green-500 ring-2 ring-black"></div>}
                        </div>
                    ))}
                </div>

                {/* Left Path */}
                <div className="col-span-4 row-span-3 grid grid-rows-3 grid-cols-6">
                     {Array.from({length: 18}).map((_, i) => <div key={i} className="border border-gray-400 bg-white"></div>)}
                </div>

                {/* Center Home */}
                <div className="col-span-3 row-span-3 bg-blue-100 flex items-center justify-center relative">
                    <div className="text-[10px] text-center">HOME</div>
                    {/* Render pieces on path/home simplistically by absolute overlay based on 'p' value would be complex here, 
                        so for this demo, we just show tokens in base or "On Board" status text below */}
                </div>

                {/* Right Path */}
                <div className="col-span-4 row-span-3 grid grid-rows-3 grid-cols-6">
                     {Array.from({length: 18}).map((_, i) => <div key={i} className="border border-gray-400 bg-white"></div>)}
                </div>

                {/* Blue Base (Inactive for demo) */}
                <div className="col-span-4 row-span-4 bg-blue-500 border-r-2 border-t-2 border-black p-4"></div>

                {/* Bottom Path */}
                <div className="col-span-3 row-span-4 grid grid-cols-3 grid-rows-6">
                     {Array.from({length: 18}).map((_, i) => <div key={i} className="border border-gray-400 bg-white"></div>)}
                </div>

                {/* Yellow Base (Inactive for demo) */}
                <div className="col-span-4 row-span-4 bg-yellow-400 border-l-2 border-t-2 border-black p-4"></div>
            </div>
        )
    };

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            {renderBoard()}
            
            <div className="flex justify-between w-full px-8 items-center">
                <div className={`flex flex-col items-center ${turn === 'red' ? 'opacity-100 scale-110' : 'opacity-50'}`}>
                    <div className="text-red-500 font-bold">You (Red)</div>
                    <div className="flex gap-1 h-6">
                        {redPositions.map((p, i) => p > 0 && <div key={i} className="w-4 h-4 bg-red-500 rounded-full border border-black" title={`Pos: ${p}`}></div>)}
                    </div>
                </div>

                <div 
                    onClick={() => turn === 'red' ? rollDice() : null}
                    id={turn === 'green' ? 'ai-roll-btn' : undefined}
                    className={`
                        w-16 h-16 bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center text-3xl shadow-lg cursor-pointer transition-transform active:scale-95
                        ${rolling ? 'animate-spin' : ''}
                        ${turn === 'red' ? 'ring-4 ring-red-200' : ''}
                    `}
                >
                    {dice || '🎲'}
                </div>

                <div className={`flex flex-col items-center ${turn === 'green' ? 'opacity-100 scale-110' : 'opacity-50'}`}>
                    <div className="text-green-500 font-bold">Opponent</div>
                    <div className="flex gap-1 h-6">
                        {greenPositions.map((p, i) => p > 0 && <div key={i} className="w-4 h-4 bg-green-500 rounded-full border border-black" title={`Pos: ${p}`}></div>)}
                    </div>
                </div>
            </div>
            
            <div className="text-sm text-gray-500">
                {turn === 'red' ? (dice && dice !== 6 && redPositions.every(p => p===0) ? "Need a 6 to start!" : "Your Turn") : "Opponent's Turn"}
            </div>
        </div>
    );
};

export default LudoGame;