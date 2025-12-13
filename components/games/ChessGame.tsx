import React, { useState, useEffect } from 'react';
import { Chess, Square } from 'chess.js';

interface ChessGameProps {
    onMove?: (fen: string) => void;
}

const ChessGame: React.FC<ChessGameProps> = ({ onMove }) => {
    const [game, setGame] = useState(new Chess());
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
    
    // Pieces Map for simple rendering
    const PIECES: Record<string, string> = {
        'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
        'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
    };

    const handleSquareClick = (square: Square) => {
        // If selecting a piece to move
        if (!selectedSquare) {
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                setSelectedSquare(square);
                const moves = game.moves({ square, verbose: true }).map(m => m.to as Square);
                setPossibleMoves(moves);
            }
            return;
        }

        // If clicking same square, deselect
        if (selectedSquare === square) {
            setSelectedSquare(null);
            setPossibleMoves([]);
            return;
        }

        // Try move
        try {
            const move = game.move({
                from: selectedSquare,
                to: square,
                promotion: 'q' // always promote to queen for simplicity
            });

            if (move) {
                setGame(new Chess(game.fen())); // Trigger re-render
                setSelectedSquare(null);
                setPossibleMoves([]);
                if (onMove) onMove(game.fen());
                
                // Simulate simple random opponent move for demo if single player context
                if (!game.isGameOver()) {
                    setTimeout(() => {
                        const moves = game.moves();
                        if (moves.length > 0) {
                            const randomMove = moves[Math.floor(Math.random() * moves.length)];
                            game.move(randomMove);
                            setGame(new Chess(game.fen()));
                        }
                    }, 500);
                }
            } else {
                // If invalid move but clicking another own piece, select that instead
                const piece = game.get(square);
                if (piece && piece.color === game.turn()) {
                    setSelectedSquare(square);
                    const moves = game.moves({ square, verbose: true }).map(m => m.to as Square);
                    setPossibleMoves(moves);
                } else {
                    setSelectedSquare(null);
                    setPossibleMoves([]);
                }
            }
        } catch (e) {
            setSelectedSquare(null);
            setPossibleMoves([]);
        }
    };

    const board = [];
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
            const square = (files[f] + ranks[r]) as Square;
            const piece = game.get(square);
            const isDark = (r + f) % 2 === 1;
            const isSelected = selectedSquare === square;
            const isPossible = possibleMoves.includes(square);
            const inCheck = piece?.type === 'k' && piece.color === game.turn() && game.inCheck();

            board.push(
                <div 
                    key={square}
                    onClick={() => handleSquareClick(square)}
                    className={`
                        w-[12.5%] aspect-square flex items-center justify-center text-3xl cursor-pointer relative select-none
                        ${isDark ? 'bg-[#769656]' : 'bg-[#eeeed2]'}
                        ${isSelected ? 'bg-yellow-200 ring-inset ring-4 ring-yellow-400' : ''}
                        ${inCheck ? 'bg-red-500' : ''}
                    `}
                >
                    {isPossible && (
                        <div className={`absolute w-3 h-3 rounded-full ${piece ? 'ring-4 ring-black/20 w-full h-full rounded-none' : 'bg-black/20'}`}></div>
                    )}
                    <span className={`${piece?.color === 'w' ? 'text-white drop-shadow-md' : 'text-black'}`}>
                        {piece ? PIECES[piece.type === 'p' ? (piece.color === 'w' ? 'P' : 'p') : piece.type] : ''} 
                        {/* Fallback to text if unicode fails visually, but using piece.type for logic mapping above */}
                        {piece && PIECES[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}
                    </span>
                    
                    {f === 0 && <span className={`absolute top-0.5 left-0.5 text-[8px] font-bold ${isDark ? 'text-[#eeeed2]' : 'text-[#769656]'}`}>{ranks[r]}</span>}
                    {r === 7 && <span className={`absolute bottom-0.5 right-0.5 text-[8px] font-bold ${isDark ? 'text-[#eeeed2]' : 'text-[#769656]'}`}>{files[f]}</span>}
                </div>
            );
        }
    }

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex flex-wrap w-full max-w-[350px] shadow-lg border-4 border-[#3a3a3a]">
                {board}
            </div>
            {game.isGameOver() && (
                <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-bold animate-pulse">
                    Game Over {game.isDraw() ? '(Draw)' : '(Checkmate)'}
                </div>
            )}
        </div>
    );
};

export default ChessGame;
