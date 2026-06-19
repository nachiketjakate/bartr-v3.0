import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, File, Image as ImageIcon, FileText, Loader } from 'lucide-react';
import { supabase } from './supabase';

// File type icons
const getFileIcon = (type) => {
  if (type.startsWith('image/')) return <ImageIcon size={20} />;
  if (type.includes('pdf')) return <FileText size={20} />;
  return <File size={20} />;
};

// Format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// File Upload Component
export function FileUploadButton({ onFileSelect, disabled }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      onFileSelect(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <motion.button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: disabled ? '#cbd5e1' : '#f1f5f9',
          border: '2px solid #e2e8f0',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <Upload size={18} color={disabled ? '#94a3b8' : '#64748b'} />
      </motion.button>
    </>
  );
}

// File Preview Component
export function FilePreview({ file, onRemove }) {
  const isImage = file.type.startsWith('image/');
  const [imagePreview, setImagePreview] = useState(null);

  React.useEffect(() => {
    if (isImage && file instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [file, isImage]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        background: 'white',
        border: '3px solid black',
        borderRadius: '16px',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        position: 'relative'
      }}
    >
      {isImage && imagePreview ? (
        <img
          src={imagePreview}
          alt="Preview"
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '8px',
            border: '2px solid #e2e8f0'
          }}
        />
      ) : (
        <div
          style={{
            width: '60px',
            height: '60px',
            background: '#f1f5f9',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #e2e8f0'
          }}
        >
          {getFileIcon(file.type)}
        </div>
      )}
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: '700',
            fontSize: '0.9rem',
            color: '#0f172a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {file.name}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600', marginTop: '0.25rem' }}>
          {formatFileSize(file.size)}
        </div>
      </div>

      <button
        type="button"
        onClick={onRemove}
        style={{
          background: '#fee2e2',
          border: '2px solid #ef4444',
          color: '#ef4444',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#ef4444';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#fee2e2';
          e.currentTarget.style.color = '#ef4444';
        }}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

// Attachment Display in Message
export function MessageAttachment({ attachment }) {
  const { url, type, name, size } = attachment;
  const isImage = type?.startsWith('image/');

  const handleDownload = () => {
    window.open(url, '_blank');
  };

  if (isImage) {
    return (
      <div
        onClick={handleDownload}
        style={{
          cursor: 'pointer',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid rgba(0,0,0,0.1)',
          maxWidth: '300px',
          marginTop: '0.5rem'
        }}
      >
        <img
          src={url}
          alt={name}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '300px',
            objectFit: 'cover',
            display: 'block'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = '<div style="padding: 1rem; text-align: center; color: #ef4444;">Failed to load image</div>';
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={handleDownload}
      style={{
        background: 'rgba(255,255,255,0.1)',
        border: '2px solid rgba(255,255,255,0.2)',
        borderRadius: '12px',
        padding: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: 'pointer',
        marginTop: '0.5rem',
        maxWidth: '300px'
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {getFileIcon(type)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: '700',
            fontSize: '0.85rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {name}
        </div>
        <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.15rem' }}>
          {formatFileSize(size)} • Click to open
        </div>
      </div>
    </motion.div>
  );
}

// Upload file to Supabase Storage
export async function uploadFile(file, userId, gigId) {
  try {
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${gigId}/${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('chat-attachments')
      .getPublicUrl(fileName);

    return {
      url: publicUrl,
      type: file.type,
      name: file.name,
      size: file.size
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
