import React from 'react';
import { ArrowLeft } from 'lucide-react';
import TrackList from './TrackList';

function AlbumView({ 
  albums, 
  selectedAlbum, 
  onAlbumClick, 
  onBack,
  filteredTracks,
  currentTrack,
  onTrackClick
}) {
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
              <div 
                key={album.id} 
                onClick={() => onAlbumClick(album)}
                className="border border-white/10 p-4 hover:bg-white/5 cursor-pointer"
              >
                <div className="text-sm font-medium mb-1">{album.title}</div>
                <div className="text-xs text-white/50">{album.artists?.name}</div>
                <div className="text-xs text-white/30 mt-1">{album.release_year}</div>
              </div>
            ))
          )}
        </div>
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
      <div className="mb-6">
        <h1 className="text-2xl mb-2">{selectedAlbum.title}</h1>
        <p className="text-white/50 text-sm">
          {selectedAlbum.artists?.name} â€¢ {selectedAlbum.release_year}
        </p>
        <p className="text-white/50 text-sm">{filteredTracks.length} tracks</p>
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