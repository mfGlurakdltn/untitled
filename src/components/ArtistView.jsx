import React from 'react';
import { ArrowLeft } from 'lucide-react';
import TrackList from './TrackList';

function ArtistView({ 
  artists, 
  selectedArtist, 
  onArtistClick, 
  onBack,
  filteredTracks,
  currentTrack,
  onTrackClick
}) {
  // Artist Overview
  if (!selectedArtist) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl mb-2">ARTISTS</h1>
          <p className="text-white/50 text-sm">{artists.length} artists</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {artists.length === 0 ? (
            <p className="text-white/50 col-span-full text-center py-8">No artists yet</p>
          ) : (
            artists.map(artist => (
              <div 
                key={artist.id} 
                onClick={() => onArtistClick(artist)}
                className="border border-white/10 p-4 hover:bg-white/5 cursor-pointer"
              >
                <div className="text-sm font-medium">{artist.name}</div>
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
      <div className="mb-6">
        <h1 className="text-2xl mb-2">{selectedArtist.name}</h1>
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

export default ArtistView;