'use client';

import { useState, DragEvent } from 'react';
import { useParams } from 'next/navigation';

export default function UploadRFPPage() {
  const params = useParams<{ id: string }>();
  const rfpId = params.id;

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) setFile(droppedFile);
  };

  const upload = async () => {
    if (!file || !rfpId) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('User not authenticated');
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch(
        `http://localhost:3000/api/rfps/${rfpId}/document`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: fd,
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      alert('RFP uploaded. Analysis started.');
    } catch (err: any) {
      alert(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-md p-6">
        <h1 className="text-xl font-bold mb-2">Upload RFP Document</h1>
        <p className="text-sm text-gray-500 mb-6">
          Drag & drop your RFP file or click to browse
        </p>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 cursor-pointer transition
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
        >
          <input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) =>
              setFile(e.target.files?.[0] || null)
            }
          />

          {!file ? (
            <>
              <p className="text-sm text-gray-600">
                Drop your file here
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, DOC, DOCX, TXT supported
              </p>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
        </div>

        <button
          onClick={upload}
          disabled={!file || loading}
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload & Analyze'}
        </button>
      </div>
    </div>
  );
}
