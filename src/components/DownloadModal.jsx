import React, { useState } from 'react';
import { X, Link, Download, CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';

const WORKER_URL = import.meta.env.VITE_WORKER_URL;

async function saveTrackToDB({ title, artist, album, year, thumbnail, trackNumber }, { audioUrl, duration }) {
  // Find or create artist
  const artistName = artist || 'Unknown';
  let artistId;
  const { data: existingArtist } = await supabase.from('artists').select('id').eq('name', artistName).maybeSingle();
  if (existingArtist) {
    artistId = existingArtist.id;
  } else {
    const { data: newArtist, error } = await supabase.from('artists').insert([{ name: artistName }]).select().single();
    if (error) throw error;
    artistId = newArtist.id;
  }

  // Find or create album
  let albumId;
  const albumTitle = album || `${artistName} - Singles`;
  const { data: existingAlbum } = await supabase.from('albums').select('id').eq('title', albumTitle).eq('artist_id', artistId).maybeSingle();
  if (existingAlbum) {
    albumId = existingAlbum.id;
  } else {
    const { data: newAlbum, error } = await supabase.from('albums').insert([{
      title: albumTitle,
      artist_id: artistId,
      release_year: year || null,
      cover_url: thumbnail || null,
    }]).select().single();
    if (error) throw error;
    albumId = newAlbum.id;
  }

  // Insert track
  const { error } = await supabase.from('tracks').insert([{
    title,
    album_id: albumId,
    track_number: trackNumber || null,
    duration: duration || 0,
    audio_url: audioUrl,
  }]);
  if (error) throw error;
}

export default function DownloadModal({ show, onClose, onComplete }) {
  const [url, setUrl] = useState('');
  const [phase, setPhase] = useState('input'); // input | resolving | preview | downloading | done
  const [trackList, setTrackList] = useState([]);
  const [type, setType] = useState('track');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [resolveError, setResolveError] = useState('');

  const handleResolve = async () => {
    if (!url.trim()) return;
    setPhase('resolving');
    setResolveError('');
    try {
      const r = await fetch(`${WORKER_URL}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Fehler beim Analysieren');
      setTrackList(data.tracks.map(t => ({ ...t, status: 'pending' })));
      setType(data.type);
      setPhase('preview');
    } catch (e) {
      setResolveError(e.message);
      setPhase('input');
    }
  };

  const handleDownloadAll = async () => {
    setPhase('downloading');
    const total = trackList.length;
    setProgress({ current: 0, total });

    for (let i = 0; i < trackList.length; i++) {
      const track = trackList[i];
      setTrackList(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'downloading' } : t));

      try {
        const payload = track.isYoutube && track.directUrl
          ? { url: track.directUrl, metadata: track }
          : { query: track.searchQuery, metadata: track };

        const r = await fetch(`${WORKER_URL}/download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result = await r.json();
        if (!r.ok || !result.success) throw new Error(result.error || 'Download fehlgeschlagen');

        await saveTrackToDB(track, result);

        setTrackList(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'done' } : t));
      } catch (e) {
        setTrackList(prev => prev.map((t, idx) => idx === i ? { ...t, status: 'error', errorMsg: e.message } : t));
      }

      setProgress({ current: i + 1, total });
    }

    setPhase('done');
    onComplete?.();
  };

  const handleClose = () => {
    if (phase === 'downloading') return; // prevent accidental close during download
    setUrl('');
    setPhase('input');
    setTrackList([]);
    setResolveError('');
    onClose();
  };

  const doneCount = trackList.filter(t => t.status === 'done').length;
  const errorCount = trackList.filter(t => t.status === 'error').length;

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/20 w-full max-w-lg flex flex-col" style={{ maxHeight: '80vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm tracking-wider">
            <Link className="w-4 h-4" />
            LINK HINZUFÜGEN
          </div>
          <button onClick={handleClose} className="text-white/40 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">

          {/* URL Input */}
          {(phase === 'input' || phase === 'resolving') && (
            <div className="space-y-3">
              <p className="text-white/40 text-xs">YouTube oder Spotify — Song, Album oder Playlist</p>
              <input
                type="text"
                placeholder="https://open.spotify.com/... oder https://youtube.com/..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && phase === 'input' && handleResolve()}
                disabled={phase === 'resolving'}
                className="w-full bg-white/5 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-white/30 disabled:opacity-50"
              />
              {resolveError && (
                <p className="text-red-400 text-xs">{resolveError}</p>
              )}
            </div>
          )}

          {/* Track List Preview / Progress */}
          {(phase === 'preview' || phase === 'downloading' || phase === 'done') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white/40 text-xs uppercase tracking-wider">
                  {type} · {trackList.length} Track{trackList.length !== 1 ? 's' : ''}
                </p>
                {phase === 'downloading' && (
                  <p className="text-white/40 text-xs">{progress.current}/{progress.total}</p>
                )}
                {phase === 'done' && (
                  <p className="text-xs">
                    <span className="text-green-400">{doneCount} geladen</span>
                    {errorCount > 0 && <span className="text-red-400 ml-2">{errorCount} Fehler</span>}
                  </p>
                )}
              </div>

              <div className="space-y-px overflow-y-auto" style={{ maxHeight: '300px' }}>
                {trackList.map((track, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-1 border-b border-white/5">
                    <div className="w-4 flex-shrink-0 flex items-center justify-center">
                      {track.status === 'pending' && <span className="text-white/20 text-xs">○</span>}
                      {track.status === 'downloading' && <Loader className="w-3 h-3 animate-spin text-white/60" />}
                      {track.status === 'done' && <CheckCircle className="w-3 h-3 text-green-400" />}
                      {track.status === 'error' && <XCircle className="w-3 h-3 text-red-400" title={track.errorMsg} />}
                    </div>
                    {track.thumbnail && (
                      <img src={track.thumbnail} alt="" className="w-8 h-8 object-cover flex-shrink-0 opacity-70" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{track.title}</div>
                      <div className="text-white/40 text-xs truncate">
                        {track.artist}{track.album ? ` · ${track.album}` : ''}
                      </div>
                    </div>
                    {track.duration > 0 && (
                      <span className="text-white/30 text-xs flex-shrink-0">
                        {Math.floor(track.duration / 60)}:{String(track.duration % 60).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="px-5 py-4 border-t border-white/10 flex gap-2">
          {phase === 'input' && (
            <button
              onClick={handleResolve}
              disabled={!url.trim()}
              className="flex-1 py-2 text-sm border border-white/20 hover:bg-white/5 disabled:opacity-30 tracking-wider"
            >
              ANALYSIEREN
            </button>
          )}

          {phase === 'resolving' && (
            <div className="flex-1 py-2 text-sm text-center text-white/40 flex items-center justify-center gap-2">
              <Loader className="w-3 h-3 animate-spin" /> Analysiere URL...
            </div>
          )}

          {phase === 'preview' && (
            <>
              <button
                onClick={() => setPhase('input')}
                className="px-4 py-2 text-sm border border-white/10 hover:bg-white/5 text-white/40 tracking-wider"
              >
                ZURÜCK
              </button>
              <button
                onClick={handleDownloadAll}
                className="flex-1 py-2 text-sm border border-white/20 hover:bg-white/5 flex items-center justify-center gap-2 tracking-wider"
              >
                <Download className="w-4 h-4" />
                ALLE LADEN ({trackList.length})
              </button>
            </>
          )}

          {phase === 'downloading' && (
            <div className="flex-1 py-2 text-sm text-center text-white/40 flex items-center justify-center gap-2">
              <Loader className="w-3 h-3 animate-spin" />
              {progress.current}/{progress.total} laden...
            </div>
          )}

          {phase === 'done' && (
            <button
              onClick={handleClose}
              className="flex-1 py-2 text-sm border border-white/20 hover:bg-white/5 tracking-wider"
            >
              FERTIG ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
