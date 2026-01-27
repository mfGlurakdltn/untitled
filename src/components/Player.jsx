import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';

function Player({ 
  currentTrack, 
  isPlaying, 
  currentTime, 
  duration, 
  volume,
  audioRef,
  onPlayPause,
  onSkipForward,
  onSkipBackward,
  onSeek,
  onVolumeChange
}) {
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 px-6 py-4">
      <div className="flex items-center gap-6">
        {/* Current Track Info */}
        <div className="w-48">
          {currentTrack && (
            <div>
              <div className="text-sm truncate">{currentTrack.title}</div>
              <div className="text-xs text-white/50 truncate">
                {currentTrack.albums?.artists?.name || 'Unknown Artist'}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={onSkipBackward}
              className="hover:text-white/70"
              disabled={!currentTrack}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={onPlayPause}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10"
              disabled={!currentTrack}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            
            <button
              onClick={onSkipForward}
              className="hover:text-white/70"
              disabled={!currentTrack}
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-2xl flex items-center gap-3">
            <span className="text-xs text-white/50 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={duration ? (currentTime / duration) * 100 : 0}
              onChange={onSeek}
              className="flex-1 h-1 bg-white/10 appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, white ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%)`
              }}
            />
            <span className="text-xs text-white/50 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="w-48 flex items-center gap-3">
          <Volume2 className="w-4 h-4" />
          <input
            type="range"
            min="0"
            max="100"
            value={volume * 100}
            onChange={onVolumeChange}
            className="flex-1 h-1 bg-white/10 appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`
            }}
          />
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={() => {}}
        onLoadedMetadata={() => {}}
        onEnded={onSkipForward}
      />
    </footer>
  );
}

export default Player;