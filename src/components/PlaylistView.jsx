import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Trash2, Edit2, Music } from 'lucide-react';
import TrackList from './TrackList';

function PlaylistView({ 
  playlists, 
  selectedPlaylist, 
  onPlaylistClick, 
  onBack,
  currentTrack,
  onTrackClick,
  onRemoveTrack,
  onDeletePlaylist,
  onRenamePlaylist,
  showCreateModal,
  setShowCreateModal,
  newPlaylistName,
  setNewPlaylistName,
  onCreatePlaylist,
  onUpdatePlaylistCover
}) {
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState('');
  const [editingCover, setEditingCover] = useState(null);

  const startEditing = (playlist) => {
    setEditingPlaylist(playlist.id);
    setEditName(playlist.name);
  };

  const saveEdit = () => {
    if (editName.trim()) {
      onRenamePlaylist(editingPlaylist, editName.trim());
      setEditingPlaylist(null);
      setEditName('');
    }
  };

  const cancelEdit = () => {
    setEditingPlaylist(null);
    setEditName('');
  };

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
              <div key={playlist.id} className="border border-white/10 p-4 hover:bg-white/5 relative group">
                {editingPlaylist === playlist.id ? (
                  <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit();
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      className="w-full bg-white/5 border border-white/10 px-2 py-1 text-sm focus:outline-none focus:border-white/30"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveEdit}
                        className="flex-1 px-2 py-1 bg-white/10 hover:bg-white/20 text-xs rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex-1 px-2 py-1 border border-white/10 hover:bg-white/5 text-xs rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div onClick={() => onPlaylistClick(playlist)} className="cursor-pointer">
                      <div className="w-full aspect-square bg-white/5 border border-white/10 flex items-center justify-center mb-2 relative group">
                        {playlist.cover_url ? (
                          <img src={playlist.cover_url} alt={playlist.name} className="w-full h-full object-cover" />
                        ) : (
                          <Music className="w-8 h-8 text-white/20" />
                        )}
                      </div>
                      <div className="text-sm font-medium">{playlist.name}</div>
                      <div className="text-xs text-white/50 mt-1">{playlist.description || 'Playlist'}</div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCover(playlist);
                        }}
                        className="text-white/50 hover:text-white p-1 bg-black/60 rounded"
                        title="Edit cover"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(playlist);
                        }}
                        className="text-white/50 hover:text-white p-1 bg-black/60 rounded"
                        title="Rename playlist"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete playlist "${playlist.name}"?`)) {
                            onDeletePlaylist(playlist.id);
                          }
                        }}
                        className="text-white/50 hover:text-red-500 p-1 bg-black/60 rounded"
                        title="Delete playlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
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
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPlaylistName.trim()) {
                        onCreatePlaylist();
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                    placeholder="My Playlist"
                    autoFocus
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

        {/* Cover Upload Modal */}
        {editingCover && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-black border border-white/20 w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl">EDIT COVER</h2>
                <button onClick={() => setEditingCover(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="w-full aspect-square bg-white/5 border border-white/10 flex items-center justify-center">
                  {editingCover.cover_url ? (
                    <img src={editingCover.cover_url} alt={editingCover.name} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-12 h-12 text-white/20" />
                  )}
                </div>
                <label className="block w-full py-3 border border-white/20 hover:bg-white/5 text-sm text-center cursor-pointer">
                  UPLOAD NEW COVER
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0] && onUpdatePlaylistCover) {
                        onUpdatePlaylistCover(editingCover.id, e.target.files[0]);
                        setEditingCover(null);
                      }
                    }}
                  />
                </label>
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
