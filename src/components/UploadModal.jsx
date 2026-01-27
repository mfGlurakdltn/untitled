import React from 'react';
import { X } from 'lucide-react';

function UploadModal({ 
  show, 
  onClose, 
  uploadForm, 
  setUploadForm, 
  onUpload, 
  uploading 
}) {
  if (!show) return null;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadForm({ ...uploadForm, audioFile: file });
    } else {
      alert('Please select a valid audio file');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/20 w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl">UPLOAD TRACK</h2>
          <button onClick={onClose}>
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
            onClick={onUpload}
            disabled={uploading}
            className="w-full py-3 border border-white/20 hover:bg-white/5 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {uploading ? 'UPLOADING...' : 'UPLOAD TRACK'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;