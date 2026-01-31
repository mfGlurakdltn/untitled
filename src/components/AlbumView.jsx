import React, { useState } from 'react';
import { ArrowLeft, Edit2, X, Disc } from 'lucide-react';
import TrackList from './TrackList';

function AlbumView({ 
  albums, 
  selectedAlbum, 
  onAlbumClick, 
  onBack,
  filteredTracks,
  currentTrack,
  onTrackClick,
  onUpdateAlbumCover
}) {
  const [editingCover, setEditingCover] = useState(null);

  // Album Overview
  if (!selectedAlbum) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl mb-2">ALBUMS</h1>
          <p className="text-white/50 text-sm">{albums.length} albums</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {albums.length === 0 ? (
            <p className="text-white/50 col-span-full text-center py-8">No albums yet</p>
          ) : (
            albums.map(album => (
              <div key={album.id} className="border border-white/10 p-4 hover:bg-white/5 cursor-pointer relative group">
                <div onClick={() => onAlbumClick(album)}>
                  <div className="w-full aspect-square bg-white/5 border border-white/10 flex items-center justify-center mb-2 overflow-hidden">
                    {album.cover_url ? (
                      <img src={album.cover_url} alt={album.title} className="w-full h-full object-cover" />
                    ) : (
                      <Disc className="w-8 h-8 text-white/20" />
                    )}
                  </div>
                  <div className="text-sm font-medium">{album.title}</div>
                  <div className="text-xs text-white/50">{album.artists?.name}</div>
                  <div className="text-xs text-white/30 mt-1">{album.release_year}</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingCover(album);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/50 hover:text-white p-1 bg-black/60 rounded"
                  title="Edit cover"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

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
                <div className="w-full aspect-square bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                  {editingCover.cover_url ? (
                    <img src={editingCover.cover_url} alt={editingCover.title} className="w-full h-full object-cover" />
                  ) : (
                    <Disc className="w-12 h-12 text-white/20" />
                  )}
                </div>
                <p className="text-sm text-center">{editingCover.title}</p>
                <label className="block w-full py-3 border border-white/20 hover:bg-white/5 text-sm text-center cursor-pointer">
                  UPLOAD NEW COVER
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files[0] && onUpdateAlbumCover) {
                        onUpdateAlbumCover(editingCover.id, e.target.files[0]);
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

  // Album Detail
  return (
    <>
      <button 
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-white/70 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Albums
      </button>
      <div className="mb-6 flex items-center gap-6">
        <div className="w-32 h-32 bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
          {selectedAlbum.cover_url ? (
            <img src={selectedAlbum.cover_url} alt={selectedAlbum.title} className="w-full h-full object-cover" />
          ) : (
            <Disc className="w-10 h-10 text-white/20" />
          )}
        </div>
        <div>
          <h1 className="text-2xl mb-1">{selectedAlbum.title}</h1>
          <p className="text-white/50 text-sm">
            {selectedAlbum.artists?.name} • {selectedAlbum.release_year}
          </p>
          <p className="text-white/50 text-sm">{filteredTracks.length} tracks</p>
        </div>
      </div>
      <TrackList 
        tracks={filteredTracks}
        currentTrack={currentTrack}
        onTrackClick={onTrackClick}
      />
    </>
  );
}

export default AlbumView;
