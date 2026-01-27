import React from 'react';
import { ArrowLeft, Plus, X } from 'lucide-react';
import TrackList from './TrackList';

function PlaylistView({ 
  playlists, 
  selectedPlaylist, 
  onPlaylistClick, 
  onBack,
  currentTrack,
  onTrackClick,
  onRemoveTrack,
  showCreateModal,
  setShowCreateModal,
  newPlaylistName,
  setNewPlaylistName,
  onCreatePlaylist
}) {
  // Playlist Overview
  if (!selectedPlaylist) {
    return (
      <>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl mb-2">PLAYLISTS</h1>
            <p className="text-white/50 text-sm">{playlists.length} playlists</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 border border-white/20 hover:bg-white/5 text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            NEW PLAYLIST
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {playlists.length === 0 ? (
            <p className="text-white/50 col-span-full text-center py-8">No playlists yet</p>
          ) : (
            playlists.map(playlist => (
              <div 
                key={playlist.id} 
                onClick={() => onPlaylistClick(playlist)}
                className="border border-white/10 p-4 hover:bg-white/5 cursor-pointer"
              >
                <div className="text-sm font-medium">{playlist.name}</div>
                <div className="text-xs text-white/50 mt-1">{playlist.description || 'Playlist'}</div>
              </div>
            ))
          )}
        </div>

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-black border border-white/20 w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl">NEW PLAYLIST</h2>
                <button onClick={() => setShowCreateModal(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/50 mb-2">PLAYLIST NAME *</label>
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="My Playlist"
                  />
                </div>
                <button
                  onClick={onCreatePlaylist}
                  className="w-full py-3 border border-white/20 hover:bg-white/5 text-sm"
                >
                  CREATE PLAYLIST
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Playlist Detail
  const playlistTracks = selectedPlaylist.tracks || [];
  
  return (
    <>
      <button 
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-white/70 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Playlists
      </button>
      <div className="mb-6">
        <h1 className="text-2xl mb-2">{selectedPlaylist.name}</h1>
        <p className="text-white/50 text-sm">{playlistTracks.length} tracks</p>
      </div>
      <TrackList 
        tracks={playlistTracks.map(pt => pt.tracks)}
        currentTrack={currentTrack}
        onTrackClick={onTrackClick}
        onRemoveFromPlaylist={(track) => {
          const pt = playlistTracks.find(p => p.tracks.id === track.id);
          if (pt) onRemoveTrack(pt.id);
        }}
        showRemove={true}
      />
    </>
  );
}

export default PlaylistView;