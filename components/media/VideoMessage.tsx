
import React, { useState, useRef } from 'react';
import { Play, Video } from 'lucide-react';

interface VideoMessageProps {
    src: string;
    poster?: string;
    duration?: string;
}

const VideoMessage: React.FC<VideoMessageProps> = ({ src, poster, duration }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const togglePlay = (e: React.MouseEvent) => {
        e?.stopPropagation();
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(e => console.log("Video play failed:", e));
            }
            setIsPlaying(!isPlaying);
        }
    }

    return (
        <div className="relative w-full max-h-[400px] min-w-[200px] bg-black rounded-lg overflow-hidden cursor-pointer group" onClick={togglePlay}>
            <video 
                ref={videoRef}
                src={src} 
                poster={poster}
                className="w-full h-full object-contain max-h-[400px]"
                onEnded={() => setIsPlaying(false)}
                onPause={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                playsInline
                controls={isPlaying} 
            />
            
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all z-10">
                    <div className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-sm border border-white/20 shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play size={20} fill="currentColor" className="ml-1 opacity-90" />
                    </div>
                </div>
            )}

            {duration && !isPlaying && (
                <span className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-md font-medium z-10 flex items-center gap-1">
                    <Video size={10} /> {duration}
                </span>
            )}
        </div>
    )
};

export default VideoMessage;
