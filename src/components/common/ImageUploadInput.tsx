import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X, RefreshCw, Link as LinkIcon, Check, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../services/api';

interface ImageUploadInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  aspectRatioClass?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label = 'Image',
  value,
  onChange,
  placeholder = 'https://...',
  helperText = 'Upload JPEG, PNG, WEBP, or SVG up to 5MB, or provide a URL.',
  required = false,
  aspectRatioClass = 'aspect-video',
}) => {
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    // Validate MIME type
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setUploadError('Unsupported format. Please select JPEG, PNG, WEBP, GIF, or SVG.');
      return;
    }

    try {
      setIsUploading(true);

      // Read as base64 data URI
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const res = await apiRequest('/upload', {
          method: 'POST',
          body: JSON.stringify({
            data: base64Data,
            filename: file.name,
          }),
        });

        setIsUploading(false);

        if (res.success && res.url) {
          onChange(res.url);
          setUrlInput(res.url);
          setUploadError(null);
        } else {
          setUploadError(res.message || 'Failed to upload image. Please try again.');
        }
      };

      reader.onerror = () => {
        setIsUploading(false);
        setUploadError('Failed to read file from your device.');
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploading(false);
      setUploadError(err.message || 'An error occurred during upload.');
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUploadError(null);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`px-2 py-0.5 rounded-md font-medium transition ${
                mode === 'upload' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Upload Device
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={`px-2 py-0.5 rounded-md font-medium transition ${
                mode === 'url' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Paste URL
            </button>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
      />

      {/* Preview Card if Value Exists */}
      {value ? (
        <div className="relative rounded-2xl border border-slate-200 bg-slate-900/5 p-2 overflow-hidden group">
          <div className={`relative w-full ${aspectRatioClass} max-h-48 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center`}>
            <img
              src={value}
              alt="Uploaded Asset"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80';
              }}
            />
            {/* Overlay Action Controls */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 bg-white text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? 'animate-spin' : ''}`} />
                <span>Replace</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md transition"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
          <div className="mt-1.5 px-1 flex items-center justify-between text-[10px] text-slate-500">
            <span className="truncate max-w-[240px] font-mono">{value}</span>
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <Check className="w-3 h-3" /> Ready
            </span>
          </div>
        </div>
      ) : (
        /* Upload / URL Input View */
        <div className="space-y-2">
          {mode === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isUploading ? 'opacity-70 pointer-events-none' : ''
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center mb-2">
                {isUploading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <p className="text-xs font-bold text-slate-800">
                {isUploading ? 'Uploading & saving asset...' : 'Click to upload image from device'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP, or SVG up to 5MB</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onBlur={handleApplyUrl}
                  placeholder={placeholder}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {helperText && !uploadError && (
        <p className="text-[11px] text-slate-400 leading-tight">{helperText}</p>
      )}
    </div>
  );
};
