import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image } from 'lucide-react';

interface ImageUploadProps {
  onFileSelect: (file: File | null) => void;
  label?: string;
  error?: string;
  preview?: string;
  circular?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onFileSelect,
  label = 'Upload Image',
  error,
  preview: externalPreview,
  circular = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(externalPreview || null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback((file: File | null) => {
    if (!file) {
      setPreview(null);
      onFileSelect(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const shapeClass = circular ? 'image-upload-circular' : 'image-upload-rect';

  return (
    <div className="image-upload-field">
      <span className="input-label">{label}</span>
      <div
        className={`image-upload-zone ${shapeClass} ${dragging ? 'dragging' : ''} ${error ? 'upload-error' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={`${label}. Click or drag to upload`}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="sr-only"
          onChange={e => handleFile(e.target.files?.[0] || null)}
          aria-hidden="true"
        />
        {preview ? (
          <motion.div
            className="image-upload-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img src={preview} alt="Upload preview" />
            <button
              type="button"
              className="image-upload-remove"
              onClick={e => { e.stopPropagation(); handleFile(null); if (inputRef.current) inputRef.current.value = ''; }}
              aria-label="Remove image"
            >
              <X size={14} />
            </button>
          </motion.div>
        ) : (
          <div className="image-upload-placeholder">
            <div className="upload-icon-wrap">
              {circular ? <Image size={28} /> : <Upload size={28} />}
            </div>
            <p className="upload-label-text">Click or drag to upload</p>
            <p className="upload-hint-text">PNG, JPG, WEBP up to 5MB</p>
          </div>
        )}
      </div>
      {error && (
        <p className="input-error-text" role="alert">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;
