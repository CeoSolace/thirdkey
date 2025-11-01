'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ArtistDashboard() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!formData.get('audio') || !formData.get('title')) {
      setError('Title and audio file are required');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/artist/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        setSuccess('Song uploaded successfully!');
        form.reset();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        const err = await res.json();
        setError(err.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Artist Dashboard</h1>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}

      <form onSubmit={handleUpload} className="space-y-4 mb-10">
        <div>
          <label className="block mb-1">Song Title</label>
          <input
            name="title"
            className="w-full p-2 border rounded"
            placeholder="Enter song title"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Audio File (MP3/WAV)</label>
          <input
            ref={fileInputRef}
            name="audio"
            type="file"
            accept="audio/*"
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block mb-1">Artwork (optional)</label>
          <input
            name="artwork"
            type="file"
            accept="image/*"
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          disabled={uploading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload Song'}
        </button>
      </form>

      <div className="border-t pt-6">
        <h2 className="text-xl font-semibold mb-4">Your Uploads</h2>
        <button
          onClick={() => router.push('/artist/earnings')}
          className="text-primary hover:underline"
        >
          View Earnings →
        </button>
      </div>
    </div>
  );
}
