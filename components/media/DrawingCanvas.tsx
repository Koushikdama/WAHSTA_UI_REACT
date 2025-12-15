
import React, { useRef, useState, useEffect } from 'react';
import { X, Send, Trash2, Undo } from 'lucide-react';

interface DrawingCanvasProps {
    onClose: () => void;
    onSend: (dataUrl: string) => void;
}

const COLORS = [
    { color: '#000000', label: 'Black' },
    { color: '#EF4444', label: 'Red' },
    { color: '#3B82F6', label: 'Blue' },
    { color: '#22C55E', label: 'Green' },
    { color: '#EAB308', label: 'Yellow' },
    { color: '#FFFFFF', label: 'White' },
];

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onClose, onSend }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(3);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Initialize Canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                ctxRef.current = ctx;
                
                // Fill white background initially
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, []);

    // Update context when color/width changes
    useEffect(() => {
        if (ctxRef.current) {
            ctxRef.current.strokeStyle = color;
            ctxRef.current.lineWidth = lineWidth;
        }
    }, [color, lineWidth]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const { offsetX, offsetY } = getCoordinates(e);
        if (ctxRef.current) {
            ctxRef.current.beginPath();
            ctxRef.current.moveTo(offsetX, offsetY);
            setIsDrawing(true);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctxRef.current) return;
        const { offsetX, offsetY } = getCoordinates(e);
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
    };

    const stopDrawing = () => {
        if (ctxRef.current) {
            ctxRef.current.closePath();
        }
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        if ((e as React.TouchEvent).touches) {
            const touch = (e as React.TouchEvent).touches[0];
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            return {
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top
            };
        } else {
            return {
                offsetX: (e as React.MouseEvent).nativeEvent.offsetX,
                offsetY: (e as React.MouseEvent).nativeEvent.offsetY
            };
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas && ctxRef.current) {
            ctxRef.current.fillStyle = '#FFFFFF';
            ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    const handleSend = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            onSend(dataUrl);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/5 absolute top-0 w-full z-10 backdrop-blur-sm">
                <button onClick={onClose} className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors text-gray-700">
                    <X size={24} />
                </button>
                <div className="flex gap-4">
                    <button onClick={clearCanvas} className="p-2 rounded-full bg-white shadow-sm hover:bg-red-50 text-red-500 transition-colors" title="Clear">
                        <Trash2 size={24} />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <canvas
                ref={canvasRef}
                className="touch-none cursor-crosshair flex-1"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />

            {/* Footer / Controls */}
            <div className="absolute bottom-0 w-full p-4 bg-black/5 backdrop-blur-sm flex flex-col gap-4">
                {/* Color Picker */}
                <div className="flex justify-center gap-3">
                    {COLORS.map((c) => (
                        <button
                            key={c.color}
                            onClick={() => setColor(c.color)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c.color ? 'border-gray-900 scale-110' : 'border-white shadow-sm'}`}
                            style={{ backgroundColor: c.color }}
                            title={c.label}
                        />
                    ))}
                </div>

                {/* Send Button */}
                <div className="flex justify-end">
                    <button 
                        onClick={handleSend}
                        className="w-14 h-14 bg-wa-teal rounded-full shadow-lg flex items-center justify-center text-white active:scale-95 transition-transform"
                    >
                        <Send size={24} className="ml-1" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DrawingCanvas;
