import React from 'react';
import { ArrowLeft, Music } from 'lucide-react';
import TrackList from './TrackList';

function AlbumView({ 
  albums, 
  selectedAlbum, 
  onAlbumClick, 
  onBack,
  filteredTracks,
  currentTrack,
  onTrackClick,
  onAddToPlaylist,
  playlists
}) {
  // Album Overview
  if (!selectedAlbum) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl mb-2">ALBUMS</h1>
          <p className="text-white/50 text-sm">{albums.length} albums</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.length === 0 ? (
            <p className="text-white/50 col-span-full text-center py-8">No albums yet</p>
          ) : (
            albums.map(album => (
              <div 
                key={album.id} 
                onClick={() => onAlbumClick(album)}
                className="group cursor-pointer"
              >
                <div className="aspect-square bg-white/5 mb-3 overflow-hidden flex items-center justify-center border border-white/10">
                  {album.cover_url ? (
                    <img 
                      src={album.cover_url} 
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <Music className="w-12 h-12 text-white/20" />
                  )}
                </div>
                <div className="text-sm font-medium mb-1 truncate">{album.title}</div>
                <div className="text-xs text-white/50 truncate">{album.artists?.name}</div>
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
      <div className="flex gap-6 mb-8">
        <div className="w-48 h-48 bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10">
          {selectedAlbum.cover_url ? (
            <img 
              src={selectedAlbum.cover_url} 
              alt={selectedAlbum.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Music className="w-20 h-20 text-white/20" />
          )}
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-xs text-white/50 mb-2">ALBUM</p>
          <h1 className="text-4xl font-bold mb-4">{selectedAlbum.title}</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white">{selectedAlbum.artists?.name}</span>
            <span className="text-white/30">•</span>
            <span className="text-white/50">{selectedAlbum.release_year}</span>
            <span className="text-white/30">•</span>
            <span className="text-white/50">{filteredTracks.length} tracks</span>
          </div>
        </div>
      </div>
      <TrackList 
        tracks={filteredTracks}
        currentTrack={currentTrack}
        onTrackClick={onTrackClick}
        onAddToPlaylist={onAddToPlaylist}
        playlists={playlists}
      />
    </>
  );
}

export default AlbumView;
