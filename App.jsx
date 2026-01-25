import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Search, Upload, X, Home, Music, Disc, List } from 'lucide-react';
import { supabase } from './supabaseClient';

function App() {
  const [currentView, setCurrentView] = useState('browse');
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const audioRef = useRef(null);

  const [uploadForm, setUploadForm] = useState({
    audioFile: null,
    title: '',
    artistName: '',
    albumTitle: '',
    trackNumber: 1,
    releaseYear: new Date().getFullYear()
  });

  useEffect(() => {
    loadTracks();
    loadArtists();
    loadAlbums();
  }, []);

  const loadTracks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tracks')
      .select(`
        *,
        albums (
          title,
          artists (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading tracks:', error);
    } else {
      setTracks(data || []);
    }
    setLoading(false);
  };

  const loadArtists = async () => {
    const { data } = await supabase
      .from('artists')
      .select('*')
      .order('name');
    setArtists(data || []);
  };

  const loadAlbums = async () => {
    const { data } = await supabase
      .from('albums')
      .select(`
        *,
        artists (name)
      `)
      .order('release_year', { ascending: false });
    setAlbums(data || []);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadForm({ ...uploadForm, audioFile: file });
    } else {
      alert('Please select a valid audio file');
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.audioFile || !uploadForm.title || !uploadForm.artistName || !uploadForm.albumTitle) {
      alert('Please fill all required fields');
      return;
    }

    setUploading(true);

    try {
      let artistId;
      const { data: existingArtist } = await supabase
        .from('artists')
        .select('id')
        .eq('name', uploadForm.artistName)
        .single();

      if (existingArtist) {
        artistId = existingArtist.id;
      } else {
        const { data: newArtist, error: artistError } = await supabase
          .from('artists')
          .insert([{ name: uploadForm.artistName }])
          .select()
          .single();
        
        if (artistError) throw artistError;
        artistId = newArtist.id;
      }

      let albumId;
      const { data: existingAlbum } = await supabase
        .from('albums')
        .select('id')
        .eq('title', uploadForm.albumTitle)
        .eq('artist_id', artistId)
        .single();

      if (existingAlbum) {
        albumId = existingAlbum.id;
      } else {
        const { data: newAlbum, error: albumError } = await supabase
          .from('albums')
          .insert([{
            title: uploadForm.albumTitle,
            artist_id: artistId,
            release_year: uploadForm.releaseYear
          }])
          .select()
          .single();
        
        if (albumError) throw albumError;
        albumId = newAlbum.id;
      }

      const fileExt = uploadForm.audioFile.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(fileName, uploadForm.audioFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('audio-files')
        .getPublicUrl(fileName);

      const audio = new Audio(URL.createObjectURL(uploadForm.audioFile));
      audio.onloadedmetadata = async () => {
        const { error: trackError } = await supabase
          .from('tracks')
          .insert([{
            title: uploadForm.title,
            album_id: albumId,
            track_number: uploadForm.trackNumber,
            duration: Math.floor(audio.duration),
            audio_url: urlData.publicUrl
          }]);

        if (trackError) throw trackError;

        alert('Track uploaded successfully!');
        setShowUploadModal(false);
        setUploadForm({
          audioFile: null,
          title: '',
          artistName: '',
          albumTitle: '',
          trackNumber: 1,
          releaseYear: new Date().getFullYear()
        });
        loadTracks();
        loadArtists();
        loadAlbums();
        setUploading(false);
      };

    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading track: ' + error.message);
      setUploading(false);
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
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex < tracks.length - 1) {
      playTrack(tracks[currentIndex + 1]);
    }
  };

  const skipBackward = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex > 0) {
      playTrack(tracks[currentIndex - 1]);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredTracks = tracks.filter(track =>
    track.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.albums?.artists?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.albums?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audio_url;
      audioRef.current.play();
    }
  }, [currentTrack]);

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

        <button 
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 border border-white/20 hover:bg-white/5 text-sm flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          UPLOAD
        </button>
      </header>

      <div className="flex">
        <aside className="w-48 border-r border-white/10 min-h-[calc(100vh-140px)]">
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setCurrentView('browse')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 ${
                currentView === 'browse' ? 'bg-white/10' : ''
              }`}
            >
              <Home className="w-4 h-4" />
              BROWSE
            </button>
            <button
              onClick={() => setCurrentView('artists')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 ${
                currentView === 'artists' ? 'bg-white/10' : ''
              }`}
            >
              <Music className="w-4 h-4" />
              ARTISTS
            </button>
            <button
              onClick={() => setCurrentView('albums')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 ${
                currentView === 'albums' ? 'bg-white/10' : ''
              }`}
            >
              <Disc className="w-4 h-4" />
              ALBUMS
            </button>
            <button
              onClick={() => setCurrentView('playlists')}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-white/5 ${
                currentView === 'playlists' ? 'bg-white/10' : ''
              }`}
            >
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
              <div className="mb-6">
                <h1 className="text-2xl mb-2">
                  {currentView === 'browse' && 'ALL TRACKS'}
                  {currentView === 'artists' && 'ARTISTS'}
                  {currentView === 'albums' && 'ALBUMS'}
                  {currentView === 'playlists' && 'PLAYLISTS'}
                </h1>
                <p className="text-white/50 text-sm">
                  {currentView === 'browse' && `${filteredTracks.length} tracks`}
                  {currentView === 'artists' && `${artists.length} artists`}
                  {currentView === 'albums' && `${albums.length} albums`}
                </p>
              </div>

              {currentView === 'browse' && (
                <div className="border border-white/10">
                  <table className="w-full">
                    <thead className="border-b border-white/10 bg-white/5">
                      <tr>
                        <th className="text-left p-3 text-xs font-normal text-white/50 w-12">#</th>
                        <th className="text-left p-3 text-xs font-normal text-white/50">TITLE</th>
                        <th className="text-left p-3 text-xs font-normal text-white/50">ARTIST</th>
                        <th className="text-left p-3 text-xs font-normal text-white/50">ALBUM</th>
                        <th className="text-right p-3 text-xs font-normal text-white/50 w-20">TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTracks.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-white/50">
                            No tracks yet. Click UPLOAD to add your first track!
                          </td>
                        </tr>
                      ) : (
                        filteredTracks.map((track, index) => (
                          <tr
                            key={track.id}
                            onClick={() => playTrack(track)}
                            className={`border-b border-white/5 hover:bg-white/5 cursor-pointer ${
                              currentTrack?.id === track.id ? 'bg-white/10' : ''
                            }`}
                          >
                            <td className="p-3 text-white/50 text-sm">{index + 1}</td>
                            <td className="p-3 text-sm">{track.title}</td>
                            <td className="p-3 text-sm text-white/70">{track.albums?.artists?.name || 'Unknown'}</td>
                            <td className="p-3 text-sm text-white/70">{track.albums?.title || 'Unknown'}</td>
                            <td className="p-3 text-right text-sm text-white/50">
                              {formatTime(track.duration)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {currentView === 'artists' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {artists.length === 0 ? (
                    <p className="text-white/50 col-span-full text-center py-8">No artists yet</p>
                  ) : (
                    artists.map(artist => (
                      <div key={artist.id} className="border border-white/10 p-4 hover:bg-white/5 cursor-pointer">
                        <div className="text-sm font-medium">{artist.name}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {currentView === 'albums' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {albums.length === 0 ? (
                    <p className="text-white/50 col-span-full text-center py-8">No albums yet</p>
                  ) : (
                    albums.map(album => (
                      <div key={album.id} className="border border-white/10 p-4 hover:bg-white/5 cursor-pointer">
                        <div className="text-sm font-medium mb-1">{album.title}</div>
                        <div className="text-xs text-white/50">{album.artists?.name}</div>
                        <div className="text-xs text-white/30 mt-1">{album.release_year}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 px-6 py-4">
        <div className="flex items-center gap-6">
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

          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <button
                onClick={skipBackward}
                className="hover:text-white/70"
                disabled={!currentTrack}
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10"
                disabled={!currentTrack}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              
              <button
                onClick={skipForward}
                className="hover:text-white/70"
                disabled={!currentTrack}
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-w-2xl flex items-center gap-3">
              <span className="text-xs text-white/50 w-10 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={duration ? (currentTime / duration) * 100 : 0}
                onChange={handleSeek}
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

          <div className="w-48 flex items-center gap-3">
            <Volume2 className="w-4 h-4" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-white/10 appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, white ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)`
              }}
            />
          </div>
        </div>
      </footer>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/20 w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl">UPLOAD TRACK</h2>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-2">AUDIO FILE *</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="w-full text-sm"
                />
                {uploadForm.audioFile && (
                  <p className="text-xs text-white/50 mt-1">{uploadForm.audioFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">TRACK TITLE *</label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  placeholder="Enter track title"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">ARTIST NAME *</label>
                <input
                  type="text"
                  value={uploadForm.artistName}
                  onChange={(e) => setUploadForm({...uploadForm, artistName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  placeholder="Enter artist name"
                />
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-2">ALBUM TITLE *</label>
                <input
                  type="text"
                  value={uploadForm.albumTitle}
                  onChange={(e) => setUploadForm({...uploadForm, albumTitle: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  placeholder="Enter album title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/50 mb-2">TRACK #</label>
                  <input
                    type="number"
                    min="1"
                    value={uploadForm.trackNumber}
                    onChange={(e) => setUploadForm({...uploadForm, trackNumber: parseInt(e.target.value) || 1})}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-2">YEAR</label>
                  <input
                    type="number"
                    min="1900"
                    max="2099"
                    value={uploadForm.releaseYear}
                    onChange={(e) => setUploadForm({...uploadForm, releaseYear: parseInt(e.target.value) || new Date().getFullYear()})}
                    className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-3 border border-white/20 hover:bg-white/5 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {uploading ? 'UPLOADING...' : 'UPLOAD TRACK'}
              </button>
            </div>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={skipForward}
      />
    </div>
  );
}

export default App;