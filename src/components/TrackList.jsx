import React, { useState } from 'react';
import { Trash2, Plus } from 'lucide-react';

function TrackList({ tracks, currentTrack, onTrackClick, onRemoveFromPlaylist, onAddToPlaylist, showRemove = false, playlists = [] }) {
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(null);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border border-white/10">
      <table className="w-full">
        <thead className="border-b border-white/10 bg-white/5">
          <tr>
            <th className="text-left p-3 text-xs font-normal text-white/50 w-12">#</th>
            <th className="text-left p-3 text-xs font-normal text-white/50">TITLE</th>
            <th className="text-left p-3 text-xs font-normal text-white/50">ARTIST</th>
            <th className="text-left p-3 text-xs font-normal text-white/50">ALBUM</th>
            <th className="text-right p-3 text-xs font-normal text-white/50 w-20">TIME</th>
            {(showRemove || onAddToPlaylist) && <th className="text-center p-3 text-xs font-normal text-white/50 w-12"></th>}
          </tr>
        </thead>
        <tbody>
          {tracks.length === 0 ? (
            <tr>
              <td colSpan={showRemove || onAddToPlaylist ? "6" : "5"} className="p-8 text-center text-white/50">
                No tracks yet
              </td>
            </tr>
          ) : (
            tracks.map((track, index) => (
              <tr
                key={track.id}
                className={`border-b border-white/5 hover:bg-white/5 ${
                  currentTrack?.id === track.id ? 'bg-white/10' : ''
                }`}
              >
                <td className="p-3 text-white/50 text-sm">{index + 1}</td>
                <td className="p-3 text-sm cursor-pointer" onClick={() => onTrackClick(track)}>{track.title}</td>
                <td className="p-3 text-sm text-white/70">{track.albums?.artists?.name || track.artist || 'Unknown'}</td>
                <td className="p-3 text-sm text-white/70">{track.albums?.title || track.album || 'Unknown'}</td>
                <td className="p-3 text-right text-sm text-white/50">{formatTime(track.duration)}</td>
                {(showRemove || onAddToPlaylist) && (
                  <td className="p-3 text-center relative">
                    {showRemove && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemoveFromPlaylist(track); }}
                        className="text-white/50 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {onAddToPlaylist && !showRemove && (
                      <>
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setShowPlaylistMenu(showPlaylistMenu === track.id ? null : track.id);
                          }}
                          className="text-white/50 hover:text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        {showPlaylistMenu === track.id && (
                          <div className="absolute right-0 top-full mt-1 bg-black border border-white/20 rounded shadow-lg z-50 min-w-[200px]">
                            <div className="p-2">
                              <div className="text-xs text-white/50 px-2 py-1">Add to playlist:</div>
                              {playlists.length === 0 ? (
                                <div className="text-xs text-white/30 px-2 py-2">No playlists yet</div>
                              ) : (
                                playlists.map(playlist => (
                                  <button
                                    key={playlist.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onAddToPlaylist(playlist.id, track.id);
                                      setShowPlaylistMenu(null);
                                    }}
                                    className="w-full text-left px-2 py-2 text-sm hover:bg-white/10 rounded"
                                  >
                                    {playlist.name}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TrackList;