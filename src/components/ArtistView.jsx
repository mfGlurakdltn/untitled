import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
import TrackList from './TrackList';

function ArtistView({ 
  artists, 
  selectedArtist, 
  onArtistClick, 
  onBack,
  filteredTracks,
  currentTrack,
  onTrackClick,
  onAddToPlaylist,
  playlists
}) {
  // Artist Overview
  if (!selectedArtist) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl mb-2">ARTISTS</h1>
          <p className="text-white/50 text-sm">{artists.length} artists</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {artists.length === 0 ? (
            <p className="text-white/50 col-span-full text-center py-8">No artists yet</p>
          ) : (
            artists.map(artist => (
              <div 
                key={artist.id} 
                onClick={() => onArtistClick(artist)}
                className="group cursor-pointer"
              >
                <div className="aspect-square bg-white/5 mb-3 overflow-hidden flex items-center justify-center border border-white/10 rounded-full">
                  {artist.cover_url ? (
                    <img 
                      src={artist.cover_url} 
                      alt={artist.name}
                      className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    />
                  ) : (
                    <User className="w-12 h-12 text-white/20" />
                  )}
                </div>
                <div className="text-sm font-medium text-center truncate">{artist.name}</div>
                <div className="text-xs text-white/50 text-center">Artist</div>
              </div>
            ))
          )}
        </div>
      </>
    );
  }

  // Artist Detail
  return (
    <>
      <button 
        onClick={onBack}
        className="flex items-center gap-2 mb-6 text-white/70 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Artists
      </button>
      <div className="flex gap-6 mb-8">
        <div className="w-48 h-48 bg-white/5 flex-shrink-0 flex items-center justify-center border border-white/10 rounded-full overflow-hidden">
          {selectedArtist.cover_url ? (
            <img 
              src={selectedArtist.cover_url} 
              alt={selectedArtist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-20 h-20 text-white/20" />
          )}
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-xs text-white/50 mb-2">ARTIST</p>
          <h1 className="text-4xl font-bold mb-4">{selectedArtist.name}</h1>
          <p className="text-sm text-white/50">{filteredTracks.length} tracks</p>
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

export default ArtistView;
