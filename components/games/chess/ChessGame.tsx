
import React, { useState } from 'react';
import { Chess, Square } from 'chess.js';

interface ChessGameProps {
    onMove?: (fen: string) => void;
}

const ChessGame: React.FC<ChessGameProps> = ({ onMove }) => {
    const [game, setGame] = useState(new Chess());
    const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
    const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
    
    const PIECES: Record<string, string> = {
        'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
        'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
    };

    const handleSquareClick = (square: Square) => {
        if (!selectedSquare) {
            const piece = game.get(square);
            if (piece && piece.color === game.turn()) {
                setSelectedSquare(square);
                const moves = game.moves({ square, verbose: true }).map(m => m.to as Square);
                setPossibleMoves(moves);
            }
            return;
        }

        if (selectedSquare === square) {
            setSelectedSquare(null);
            setPossibleMoves([]);
            return;
        }

        try {
            const move = game.move({
                from: selectedSquare,
                to: square,
                promotion: 'q'
            });

            if (move) {
                const newGame = new Chess(game.fen());
                setGame(newGame);
                setSelectedSquare(null);
                setPossibleMoves([]);
                if (onMove) onMove(newGame.fen());
                
                if (!newGame.isGameOver()) {
                    setTimeout(() => {
                        const moves = newGame.moves();
                        if (moves.length > 0) {
                            const randomMove = moves[Math.floor(Math.random() * moves.length)];
                            newGame.move(randomMove);
                            setGame(new Chess(newGame.fen()));
                        }
                    }, 500);
                }
            } else {
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

    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-[#302e2b]">
            <div className="flex justify-between w-full max-w-[400px] px-2 mb-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center text-white">AI</div>
                    <span className="text-gray-300 text-sm font-medium">Opponent</span>
                </div>
                {game.turn() === 'b' && <span className="text-xs text-green-400 animate-pulse">Thinking...</span>}
            </div>

            {/* Board Container */}
            <div className="w-full max-w-[400px] aspect-square bg-[#ebecd0] rounded-sm overflow-hidden shadow-2xl border-4 border-[#4d4d4d] relative">
                <div className="w-full h-full grid grid-cols-8 grid-rows-8">
                    {ranks.map((rank, rIdx) => 
                        files.map((file, fIdx) => {
                            const square = (file + rank) as Square;
                            const piece = game.get(square);
                            const isDark = (rIdx + fIdx) % 2 === 1;
                            const isSelected = selectedSquare === square;
                            const isPossible = possibleMoves.includes(square);
                            const inCheck = piece?.type === 'k' && piece.color === game.turn() && game.inCheck();
                            const lastMove = game.history({ verbose: true }).pop();
                            const isLastMove = lastMove && (lastMove.from === square || lastMove.to === square);

                            return (
                                <div 
                                    key={square}
                                    onClick={() => handleSquareClick(square)}
                                    className={`
                                        relative flex items-center justify-center text-4xl cursor-pointer select-none
                                        ${isDark ? 'bg-[#779556]' : 'bg-[#ebecd0]'}
                                        ${isSelected ? 'bg-[#baca44]' : ''}
                                        ${isLastMove ? 'bg-[#f5f682] opacity-80' : ''}
                                        ${inCheck ? 'bg-red-500 radial-gradient' : ''}
                                    `}
                                >
                                    {/* Rank Number (Left side) */}
                                    {fIdx === 0 && (
                                        <span className={`absolute top-0.5 left-1 text-[10px] font-bold ${isDark ? 'text-[#ebecd0]' : 'text-[#779556]'}`}>
                                            {rank}
                                        </span>
                                    )}
                                    
                                    {/* File Letter (Bottom side) */}
                                    {rIdx === 7 && (
                                        <span className={`absolute bottom-0 right-1 text-[10px] font-bold ${isDark ? 'text-[#ebecd0]' : 'text-[#779556]'}`}>
                                            {file}
                                        </span>
                                    )}

                                    {/* Move Indicator */}
                                    {isPossible && (
                                        <div className={`
                                            absolute rounded-full z-10
                                            ${piece 
                                                ? 'w-full h-full border-[6px] border-black/10' 
                                                : 'w-4 h-4 bg-black/10'
                                            }
                                        `}></div>
                                    )}

                                    {/* Piece */}
                                    {piece && (
                                        <span className={`
                                            z-20 transform transition-transform hover:scale-110
                                            ${piece.color === 'w' 
                                                ? 'text-white drop-shadow-[0_2px_1px_rgba(0,0,0,0.6)]' 
                                                : 'text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]'
                                            }
                                        `}>
                                            {PIECES[piece.color === 'w' ? piece.type.toUpperCase() : piece.type]}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="flex justify-between w-full max-w-[400px] px-2 mt-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black font-bold">ME</div>
                    <span className="text-white text-sm font-medium">You</span>
                </div>
                {game.turn() === 'w' && <span className="text-xs text-green-400 font-bold">YOUR TURN</span>}
            </div>

            {game.isGameOver() && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#262421] p-6 rounded-xl shadow-2xl text-center border border-gray-600">
                        <h3 className="text-2xl font-bold mb-2 text-white">
                            {game.isCheckmate() ? 'Checkmate!' : 'Draw'}
                        </h3>
                        <p className="text-gray-400 mb-6">
                            {game.isCheckmate() 
                                ? (game.turn() === 'w' ? 'Black Wins' : 'White Wins') 
                                : 'Game Over'
                            }
                        </p>
                        <button 
                            onClick={() => setGame(new Chess())}
                            className="bg-[#81b64c] text-white px-8 py-3 rounded-lg font-bold shadow-[0_4px_0_#45752a] active:shadow-none active:translate-y-1 transition-all"
                        >
                            New Game
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChessGame;
