import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, Home, Music, Disc, List } from 'lucide-react';
import { supabase } from './supabaseClient';
import TrackList from './components/TrackList';
import Player from './components/Player';
import UploadModal from './components/UploadModal';
import ArtistView from './components/ArtistView';
import AlbumView from './components/AlbumView';
import PlaylistView from './components/PlaylistView';

function App() {
  const [currentView, setCurrentView] = useState('browse');
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const audioRef = useRef(null);

  const [uploadForm, setUploadForm] = useState({
    audioFile: null,
    coverFile: null,
    title: '',
    artistName: '',
    albumTitle: '',
    trackNumber: 1,
    releaseYear: new Date().getFullYear()
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    loadTracks();
    loadArtists();
    loadAlbums();
    loadPlaylists();
  };

  const loadTracks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tracks')
      .select('*, albums (id, title, artists (id, name))')
      .order('created_at', { ascending: false });
    setTracks(data || []);
    setLoading(false);
  };

  const loadArtists = async () => {
    const { data } = await supabase.from('artists').select('*').order('name');
    setArtists(data || []);
  };

  const loadAlbums = async () => {
    const { data } = await supabase
      .from('albums')
      .select('*, artists (id, name)')
      .order('release_year', { ascending: false });
    setAlbums(data || []);
  };

  const loadPlaylists = async () => {
    const { data } = await supabase.from('playlists').select('*').order('created_at', { ascending: false });
    setPlaylists(data || []);
  };

  const loadPlaylistTracks = async (playlistId) => {
    const { data } = await supabase
      .from('playlist_tracks')
      .select('*, tracks (*, albums (title, artists (name)))')
      .eq('playlist_id', playlistId)
      .order('position');
    return data || [];
  };

  const addTrackToPlaylist = async (playlistId, trackId) => {
    try {
      // Check if track is already in playlist
      const { data: existing } = await supabase
        .from('playlist_tracks')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('track_id', trackId)
        .single();

      if (existing) {
        alert('Track is already in this playlist');
        return;
      }

      const playlistTracks = await loadPlaylistTracks(playlistId);
      const position = playlistTracks.length;
      const { error } = await supabase
        .from('playlist_tracks')
        .insert([{ playlist_id: playlistId, track_id: trackId, position }]);
      
      if (error) {
        console.error('Error adding track:', error);
        alert('Error adding track to playlist');
      } else {
        alert('Track added to playlist!');
      }
    } catch (error) {
      // Duplicate check returns error if not found - that's ok
      if (error.code !== 'PGRST116') {
        console.error('Error:', error);
      }
      
      const playlistTracks = await loadPlaylistTracks(playlistId);
      const position = playlistTracks.length;
      const { error: insertError } = await supabase
        .from('playlist_tracks')
        .insert([{ playlist_id: playlistId, track_id: trackId, position }]);
      
      if (insertError) {
        console.error('Error adding track:', insertError);
        alert('Error adding track to playlist');
      } else {
        alert('Track added to playlist!');
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.audioFile || !uploadForm.title || !uploadForm.artistName || !uploadForm.albumTitle) {
      alert('Please fill all required fields');
      return;
    }
    setUploading(true);
    try {
      // Upload cover if provided
      let coverUrl = null;
      if (uploadForm.coverFile) {
        const coverExt = uploadForm.coverFile.name.split('.').pop();
        const coverFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${coverExt}`;
        const { error: coverUploadError } = await supabase.storage.from('covers').upload(coverFileName, uploadForm.coverFile);
        if (coverUploadError) throw coverUploadError;
        const { data: coverUrlData } = supabase.storage.from('covers').getPublicUrl(coverFileName);
        coverUrl = coverUrlData.publicUrl;
      }

      let artistId;
      const { data: existingArtist } = await supabase.from('artists').select('id, cover_url').eq('name', uploadForm.artistName).single();
      if (existingArtist) {
        artistId = existingArtist.id;
        // Update artist cover if new cover provided and artist has no cover
        if (coverUrl && !existingArtist.cover_url) {
          await supabase.from('artists').update({ cover_url: coverUrl }).eq('id', artistId);
        }
      } else {
        const { data: newArtist, error } = await supabase.from('artists').insert([{ name: uploadForm.artistName, cover_url: coverUrl }]).select().single();
        if (error) throw error;
        artistId = newArtist.id;
      }

      let albumId;
      const { data: existingAlbum } = await supabase.from('albums').select('id, cover_url').eq('title', uploadForm.albumTitle).eq('artist_id', artistId).single();
      if (existingAlbum) {
        albumId = existingAlbum.id;
        // Update album cover if new cover provided and album has no cover
        if (coverUrl && !existingAlbum.cover_url) {
          await supabase.from('albums').update({ cover_url: coverUrl }).eq('id', albumId);
        }
      } else {
        const { data: newAlbum, error } = await supabase.from('albums').insert([{ title: uploadForm.albumTitle, artist_id: artistId, release_year: uploadForm.releaseYear, cover_url: coverUrl }]).select().single();
        if (error) throw error;
        albumId = newAlbum.id;
      }

      const fileExt = uploadForm.audioFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('audio-files').upload(fileName, uploadForm.audioFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('audio-files').getPublicUrl(fileName);
      const audio = new Audio(URL.createObjectURL(uploadForm.audioFile));
      audio.onloadedmetadata = async () => {
        await supabase.from('tracks').insert([{
          title: uploadForm.title,
          album_id: albumId,
          track_number: uploadForm.trackNumber,
          duration: Math.floor(audio.duration),
          audio_url: urlData.publicUrl
        }]);
        alert('Track uploaded successfully!');
        setShowUploadModal(false);
        setUploadForm({ audioFile: null, coverFile: null, title: '', artistName: '', albumTitle: '', trackNumber: 1, releaseYear: new Date().getFullYear() });
        loadData();
        setUploading(false);
      };
    } catch (error) {
      alert('Error: ' + error.message);
      setUploading(false);
    }
  };

  const createPlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    await supabase.from('playlists').insert([{ name: newPlaylistName }]);
    setNewPlaylistName('');
    setShowPlaylistModal(false);
    loadPlaylists();
    alert('Playlist created!');
  };

  const removeTrackFromPlaylist = async (playlistTrackId) => {
    await supabase.from('playlist_tracks').delete().eq('id', playlistTrackId);
    if (selectedPlaylist) {
      const updated = await loadPlaylistTracks(selectedPlaylist.id);
      setSelectedPlaylist({ ...selectedPlaylist, tracks: updated });
    }
  };

  const deletePlaylist = async (playlistId) => {
    await supabase.from('playlists').delete().eq('id', playlistId);
    loadPlaylists();
    alert('Playlist deleted!');
  };
  
  const renamePlaylist = async (playlistId, newName) => {
    await supabase.from('playlists').update({ name: newName }).eq('id', playlistId);
    loadPlaylists();
    alert('Playlist renamed!');
  };

  const updatePlaylistCover = async (playlistId, coverFile) => {
    try {
      const coverExt = coverFile.name.split('.').pop();
      const coverFileName = `playlist_${playlistId}_${Date.now()}.${coverExt}`;
      const { error: uploadError } = await supabase.storage.from('covers').upload(coverFileName, coverFile);
      if (uploadError) throw uploadError;
      
      const { data: coverUrlData } = supabase.storage.from('covers').getPublicUrl(coverFileName);
      await supabase.from('playlists').update({ cover_url: coverUrlData.publicUrl }).eq('id', playlistId);
      
      loadPlaylists();
      if (selectedPlaylist && selectedPlaylist.id === playlistId) {
        setSelectedPlaylist({ ...selectedPlaylist, cover_url: coverUrlData.publicUrl });
      }
      alert('Cover updated!');
    } catch (error) {
      alert('Error updating cover: ' + error.message);
    }
  };

  const playTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipForward = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack?.id);
    if (idx < tracks.length - 1) playTrack(tracks[idx + 1]);
  };

  const skipBackward = () => {
    const idx = tracks.findIndex(t => t.id === currentTrack?.id);
    if (idx > 0) playTrack(tracks[idx - 1]);
  };

  const handleArtistClick = (artist) => {
    setSelectedArtist(artist);
    setCurrentView('artist-detail');
  };

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    setCurrentView('album-detail');
  };

  const handlePlaylistClick = async (playlist) => {
    const playlistTracks = await loadPlaylistTracks(playlist.id);
    setSelectedPlaylist({ ...playlist, tracks: playlistTracks });
    setCurrentView('playlist-detail');
  };

  const getFilteredTracks = () => {
    let filtered = tracks;
    if (selectedArtist) filtered = tracks.filter(t => t.albums?.artists?.id === selectedArtist.id);
    else if (selectedAlbum) filtered = tracks.filter(t => t.albums?.id === selectedAlbum.id);
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.albums?.artists?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.albums?.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audio_url;
      audioRef.current.play();
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      const updateTime = () => setCurrentTime(audioRef.current.currentTime);
      const updateDuration = () => setDuration(audioRef.current.duration);
      audioRef.current.addEventListener('timeupdate', updateTime);
      audioRef.current.addEventListener('loadedmetadata', updateDuration);
      return () => {
        audioRef.current?.removeEventListener('timeupdate', updateTime);
        audioRef.current?.removeEventListener('loadedmetadata', updateDuration);
      };
    }
  }, []);

  const filteredTracks = getFilteredTracks();

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="text-xl tracking-wider">untitled</div>
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <input
              type="text"
              placeholder="Search tracks, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-10 py-2 text-sm focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="px-4 py-2 border border-white/20 hover:bg-white/5 text-sm flex items-center gap-2">
          <Upload className="w-4 h-4" />
          UPLOAD
        </button>
      </header>

      <div className="flex">
        <aside className="w-48 border-r border-white/10 min-h-[calc(100vh-140px)]">
          <nav className="p-4 space-y-1">
            <button onClick={() => { setCurrentView('browse'); setSelectedArtist(null); setSelectedAlbum(null); setSelectedPlaylist(null); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 ${currentView === 'browse' ? 'bg-white/10' : ''}`}>
              <Home className="w-4 h-4" />
              BROWSE
            </button>
            <button onClick={() => { setCurrentView('artists'); setSelectedArtist(null); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 ${currentView === 'artists' || currentView === 'artist-detail' ? 'bg-white/10' : ''}`}>
              <Music className="w-4 h-4" />
              ARTISTS
            </button>
            <button onClick={() => { setCurrentView('albums'); setSelectedAlbum(null); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 ${currentView === 'albums' || currentView === 'album-detail' ? 'bg-white/10' : ''}`}>
              <Disc className="w-4 h-4" />
              ALBUMS
            </button>
            <button onClick={() => { setCurrentView('playlists'); setSelectedPlaylist(null); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 ${currentView === 'playlists' || currentView === 'playlist-detail' ? 'bg-white/10' : ''}`}>
              <List className="w-4 h-4" />
              PLAYLISTS
            </button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {loading ? (
            <div className="text-center py-12 text-white/50">Loading...</div>
          ) : (
            <>
              {currentView === 'browse' && (
                <>
                  <div className="mb-6">
                    <h1 className="text-2xl mb-2">ALL TRACKS</h1>
                    <p className="text-white/50 text-sm">{filteredTracks.length} tracks</p>
                  </div>
                  <TrackList 
                    tracks={filteredTracks} 
                    currentTrack={currentTrack} 
                    onTrackClick={playTrack}
                    onAddToPlaylist={addTrackToPlaylist}
                    playlists={playlists}
                  />
                </>
              )}

              {(currentView === 'artists' || currentView === 'artist-detail') && (
                <ArtistView
                  artists={artists}
                  selectedArtist={selectedArtist}
                  onArtistClick={handleArtistClick}
                  onBack={() => {
                    setSelectedArtist(null);
                    setCurrentView('artists');
                  }}
                  filteredTracks={filteredTracks}
                  currentTrack={currentTrack}
                  onTrackClick={playTrack}
                  onAddToPlaylist={addTrackToPlaylist}
                  playlists={playlists}
                />
              )}

              {(currentView === 'albums' || currentView === 'album-detail') && (
                <AlbumView
                  albums={albums}
                  selectedAlbum={selectedAlbum}
                  onAlbumClick={handleAlbumClick}
                  onBack={() => {
                    setSelectedAlbum(null);
                    setCurrentView('albums');
                  }}
                  filteredTracks={filteredTracks}
                  currentTrack={currentTrack}
                  onTrackClick={playTrack}
                  onAddToPlaylist={addTrackToPlaylist}
                  playlists={playlists}
                />
              )}

              {(currentView === 'playlists' || currentView === 'playlist-detail') && (
              <PlaylistView
              playlists={playlists}
              selectedPlaylist={selectedPlaylist}
              onPlaylistClick={handlePlaylistClick}
              onBack={() => {
                setSelectedPlaylist(null);
                setCurrentView('playlists');
              }}
              currentTrack={currentTrack}
              onTrackClick={playTrack}
              onRemoveTrack={removeTrackFromPlaylist}
              onDeletePlaylist={deletePlaylist}
              onRenamePlaylist={renamePlaylist}
              onUpdatePlaylistCover={updatePlaylistCover}
              showCreateModal={showPlaylistModal}
              setShowCreateModal={setShowPlaylistModal}
              newPlaylistName={newPlaylistName}
              setNewPlaylistName={setNewPlaylistName}
              onCreatePlaylist={createPlaylist}
            />
              )}
            </>
          )}
        </main>
      </div>

      <Player
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        audioRef={audioRef}
        onPlayPause={togglePlayPause}
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
        onSeek={(e) => { const t = (e.target.value / 100) * duration; if (audioRef.current) { audioRef.current.currentTime = t; }}}
        onVolumeChange={(e) => { const v = e.target.value / 100; setVolume(v); if (audioRef.current) audioRef.current.volume = v; }}
      />

      <UploadModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadForm={uploadForm}
        setUploadForm={setUploadForm}
        onUpload={handleUpload}
        uploading={uploading}
      />
    </div>
  );
}

export default App;