import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft } from 'lucide-react';
import { StatusUpdate } from '../types';
import { useApp } from '../context/AppContext';

interface StatusViewerProps {
  updates: StatusUpdate[];
  initialIndex: number;
  onClose: () => void;
}

const StatusViewer: React.FC<StatusViewerProps> = ({ updates, initialIndex, onClose }) => {
  const { users } = useApp();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    setProgress(0);
    const intervalTime = 30; 
    const duration = 5000; 
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, updates.length]);

  const handleNext = () => {
    if (currentIndex < updates.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!updates || updates.length === 0 || !updates[currentIndex]) return null;

  const update = updates[currentIndex];
  const user = users[update.userId];
  if (!user) return null;

  const bgImage = update.imageUrl || `https://picsum.photos/seed/${update.id}/600/1000`;

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-200">
       <div className="flex gap-1 p-2 pt-4 absolute top-0 w-full z-20">
         {updates.map((_, idx) => (
           <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
             <div 
                className="h-full bg-white transition-all duration-30 ease-linear"
                style={{ 
                  width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                }}
             />
           </div>
         ))}
       </div>

       <div className="flex items-center justify-between px-4 py-8 z-20 text-white mt-4">
          <div className="flex items-center gap-3">
             <button onClick={onClose} className="md:hidden">
               <ArrowLeft size={24} />
             </button>
             <img src={user.avatar} className="w-10 h-10 rounded-full border border-white" alt={user.name} />
             <div className="flex flex-col">
               <span className="font-semibold text-sm">{user.name}</span>
               <span className="text-xs opacity-80">{new Date(update.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
             </div>
          </div>
          <X size={24} className="cursor-pointer hidden md:block hover:opacity-80" onClick={onClose} />
       </div>

       <div className="absolute inset-0 flex z-10">
           <div className="w-1/3 h-full" onClick={handlePrev}></div>
           <div className="w-2/3 h-full" onClick={handleNext}></div>
       </div>

       <div className="flex-1 relative flex items-center justify-center bg-gray-900 pointer-events-none">
           <img src={bgImage} className="max-h-full max-w-full object-contain" alt="Status" />
           {update.caption && (
             <div className="absolute bottom-16 w-full text-center text-white bg-black/50 p-4 backdrop-blur-sm">
               {update.caption}
             </div>
           )}
       </div>
       
       <div className="absolute bottom-0 w-full p-4 z-20 flex flex-col items-center">
            <div className="text-white text-xs mb-2 animate-pulse">Tap to view next</div>
       </div>
    </div>,
    document.body
  );
};

export default StatusViewer;