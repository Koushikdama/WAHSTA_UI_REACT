
import React, { useState } from 'react';

// Simplified Logic for Demo: 2 Players (Red vs Green)
// We track tokens abstractly. 
// -1 = Base
// 0-51 = Main Path
// 100+ = Home Run

const LudoGame = () => {
    const [dice, setDice] = useState<number | null>(null);
    const [turn, setTurn] = useState<'red' | 'green'>('red');
    const [rolling, setRolling] = useState(false);
    
    // Tokens state
    const [redTokens, setRedTokens] = useState<number[]>([-1, -1, -1, -1]); 
    const [greenTokens, setGreenTokens] = useState<number[]>([-1, -1, -1, -1]);

    // Board Generation Helpers
    // Grid is 15x15. 
    // Red Base: Top-Left (0-5, 0-5)
    // Green Base: Top-Right (0-5, 9-14)
    // Blue Base: Bottom-Left (9-14, 0-5)
    // Yellow Base: Bottom-Right (9-14, 9-14)
    
    // Paths:
    // Middle vertical col (7), Middle horizontal row (7)
    
    const rollDice = () => {
        if (rolling || dice) return;
        setRolling(true);
        setTimeout(() => {
            const val = Math.floor(Math.random() * 6) + 1;
            setDice(val);
            setRolling(false);
            
            // Simplified Auto-Pass if no moves
            const tokens = turn === 'red' ? redTokens : greenTokens;
            const canMove = tokens.some(t => t !== -1 || val === 6);
            
            if (!canMove) {
                setTimeout(() => {
                    setTurn(prev => prev === 'red' ? 'green' : 'red');
                    setDice(null);
                }, 1000);
            }
        }, 500);
    };

    const handleMove = (player: 'red' | 'green', tokenIdx: number) => {
        if (!dice || turn !== player) return;
        
        const isRed = player === 'red';
        const tokens = isRed ? [...redTokens] : [...greenTokens];
        const currentPos = tokens[tokenIdx];

        if (currentPos === -1 && dice !== 6) return;

        let newPos = currentPos;
        if (currentPos === -1) {
            newPos = isRed ? 0 : 26; // Start pos (simplified)
        } else {
            newPos = currentPos + dice;
            if (newPos > 56) return; // Cant overshoot home
        }

        tokens[tokenIdx] = newPos;
        
        if (isRed) setRedTokens(tokens);
        else setGreenTokens(tokens);

        if (dice !== 6) {
            setTurn(prev => prev === 'red' ? 'green' : 'red');
        }
        setDice(null);
    };

    // Render a single cell based on coordinates
    const renderCell = (row: number, col: number) => {
        let className = "w-full h-full border-[0.5px] border-black/20 flex items-center justify-center relative ";
        
        // --- BASES ---
        if (row < 6 && col < 6) return (
            row === 0 && col === 0 ? 
            <div key={`${row}-${col}`} className="col-span-6 row-span-6 bg-red-600 p-4 border-r-2 border-b-2 border-black">
                <div className="w-full h-full bg-white rounded-2xl flex flex-wrap items-center justify-center p-4 gap-4">
                    {redTokens.map((t, i) => t === -1 && (
                        <div key={i} onClick={() => handleMove('red', i)} className="w-8 h-8 rounded-full bg-red-600 border-2 border-dashed border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"></div>
                    ))}
                </div>
            </div> : null
        );
        if (row < 6 && col > 8) return (
            row === 0 && col === 9 ? 
            <div key={`${row}-${col}`} className="col-span-6 row-span-6 bg-green-600 p-4 border-l-2 border-b-2 border-black">
                <div className="w-full h-full bg-white rounded-2xl flex flex-wrap items-center justify-center p-4 gap-4">
                    {greenTokens.map((t, i) => t === -1 && (
                        <div key={i} onClick={() => handleMove('green', i)} className="w-8 h-8 rounded-full bg-green-600 border-2 border-dashed border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"></div>
                    ))}
                </div>
            </div> : null
        );
        if (row > 8 && col < 6) return (
            row === 9 && col === 0 ? <div key={`${row}-${col}`} className="col-span-6 row-span-6 bg-blue-600 p-4 border-r-2 border-t-2 border-black">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center opacity-50"><span className="text-blue-600 font-bold">BLUE</span></div>
            </div> : null
        );
        if (row > 8 && col > 8) return (
            row === 9 && col === 9 ? <div key={`${row}-${col}`} className="col-span-6 row-span-6 bg-yellow-500 p-4 border-l-2 border-t-2 border-black">
                <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center opacity-50"><span className="text-yellow-500 font-bold">YELLOW</span></div>
            </div> : null
        );

        // --- CENTER HOME ---
        if (row >= 6 && row <= 8 && col >= 6 && col <= 8) {
            return (row === 6 && col === 6) ? (
                <div key="center" className="col-span-3 row-span-3 relative bg-white flex flex-wrap">
                    {/* Triangles */}
                    <div className="absolute top-0 left-0 w-full h-full" style={{ background: 'conic-gradient(#4ade80 45deg, #facc15 45deg 135deg, #3b82f6 135deg 225deg, #dc2626 225deg)' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center z-10"><span className="bg-white px-1 text-[10px] font-bold rounded">HOME</span></div>
                </div>
            ) : null;
        }

        // --- PATHS ---
        let bg = 'bg-white';
        // Red Home Run (Row 7, Cols 1-5)
        if (row === 7 && col > 0 && col < 6) bg = 'bg-red-500';
        if (row === 6 && col === 1) bg = 'bg-red-500'; // Start Spot

        // Green Home Run (Col 7, Rows 1-5)
        if (col === 7 && row > 0 && row < 6) bg = 'bg-green-500';
        if (row === 1 && col === 8) bg = 'bg-green-500'; // Start Spot

        // Yellow Home Run (Row 7, Cols 9-13)
        if (row === 7 && col > 8 && col < 14) bg = 'bg-yellow-400';
        if (row === 8 && col === 13) bg = 'bg-yellow-400'; // Start

        // Blue Home Run (Col 7, Rows 9-13)
        if (col === 7 && row > 8 && row < 14) bg = 'bg-blue-500';
        if (row === 13 && col === 6) bg = 'bg-blue-500'; // Start

        // Star safe spots (simplified visual)
        const isStar = (row===6&&col===2) || (row===2&&col===8) || (row===8&&col===12) || (row===12&&col===6);

        return (
            <div key={`${row}-${col}`} className={`${className} ${bg}`}>
                {isStar && <span className="text-gray-400 text-xs">★</span>}
                
                {/* Render active tokens simplistically based on index for demo */}
                {/* Real mapping logic omitted for brevity, just showing base interaction */}
                {turn === 'red' && row===6 && col===1 && redTokens.some(t => t===0) && 
                    <div className="w-4 h-4 bg-red-600 rounded-full border border-white shadow-md animate-pulse"></div>
                }
            </div>
        );
    };

    const grid = [];
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            grid.push(renderCell(r, c));
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full h-full p-2 bg-gray-100">
            <div className="w-full max-w-[400px] aspect-square bg-white shadow-2xl border-4 border-black grid grid-cols-15 grid-rows-15">
                {grid}
            </div>

            <div className="flex items-center justify-between w-full max-w-[400px] bg-white p-4 rounded-xl shadow-md border border-gray-200">
                <div className={`flex flex-col items-center ${turn === 'red' ? 'opacity-100' : 'opacity-50'}`}>
                    <span className="font-bold text-red-600 text-sm">RED</span>
                    <div className="flex gap-1">
                        {redTokens.map((t, i) => <div key={i} className={`w-3 h-3 rounded-full ${t===-1 ? 'bg-gray-300' : 'bg-red-600'}`}></div>)}
                    </div>
                </div>

                <button 
                    onClick={rollDice}
                    disabled={rolling || !!dice}
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-lg border-2 
                        ${turn === 'red' ? 'border-red-200 bg-red-50 text-red-600' : 'border-green-200 bg-green-50 text-green-600'}
                        ${rolling ? 'animate-spin' : ''}
                    `}
                >
                    {dice || '🎲'}
                </button>

                <div className={`flex flex-col items-center ${turn === 'green' ? 'opacity-100' : 'opacity-50'}`}>
                    <span className="font-bold text-green-600 text-sm">GREEN</span>
                    <div className="flex gap-1">
                        {greenTokens.map((t, i) => <div key={i} className={`w-3 h-3 rounded-full ${t===-1 ? 'bg-gray-300' : 'bg-green-600'}`}></div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LudoGame;
