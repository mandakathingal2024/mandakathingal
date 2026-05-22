import React, { useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Compress image using Canvas API — no external library needed
function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const UploadImage = ({ folderName, setMember, imageType, setGallery, setEvent, setExecutive }) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [sizeInfo, setSizeInfo] = useState(null);
  const [status, setStatus] = useState('');

  const setDownloadURL = useCallback((downloadURL) => {
    if (imageType === 'member') {
      setMember((prev) => ({ ...prev, memberImgUrl: downloadURL }));
    } else if (imageType === 'house') {
      setMember((prev) => ({ ...prev, houseImgUrl: downloadURL }));
    } else if (imageType === 'gallery') {
      setGallery((prev) => ({ ...prev, galleryImgUrl: downloadURL }));
    } else if (imageType === 'event') {
      setEvent((prev) => ({ ...prev, eventImgUrl: downloadURL }));
    } else if (imageType === 'executive') {
      setExecutive((prev) => ({ ...prev, executiveImgUrl: downloadURL }));
    }
  }, [imageType, setMember, setGallery, setEvent, setExecutive]);

  const handleFileSelect = async (event) => {
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset state
    setError(null);
    setImageUrl(null);
    setUploadProgress(0);
    setIsUploading(true);

    try {
      // Step 1: Compress
      setStatus('Compressing...');
      const originalSize = file.size;
      const compressed = await compressImage(file);
      const compressedSize = compressed.size;
      setSizeInfo({ original: originalSize, compressed: compressedSize });

      // Step 2: Upload to Cloudinary
      setStatus('Uploading...');
      const formData = new FormData();
      formData.append('file', compressed);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', folderName);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);

      // Track upload progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          const downloadURL = response.secure_url;
          setImageUrl(downloadURL);
          setIsUploading(false);
          setStatus('');
          setDownloadURL(downloadURL);
        } else {
          console.error('Upload Error:', xhr.responseText);
          let msg = 'Upload failed. Please try again.';
          try {
            const errData = JSON.parse(xhr.responseText);
            if (errData.error?.message) {
              msg = errData.error.message;
            }
          } catch (_) {}
          setError(msg);
          setIsUploading(false);
          setStatus('');
        }
      };

      xhr.onerror = () => {
        console.error('Upload network error');
        setError('Network error. Please check your connection and try again.');
        setIsUploading(false);
        setStatus('');
      };

      xhr.send(formData);
    } catch (compressError) {
      console.error('Compress Error:', compressError);
      setError('Failed to process image. Please try a different file.');
      setIsUploading(false);
      setStatus('');
    }

    // Reset the input so the same file can be re-selected
    event.target.value = '';
  };

  const handleRetry = () => {
    setError(null);
    setImageUrl(null);
    setUploadProgress(0);
    setSizeInfo(null);
    setStatus('');
  };

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{ mt: 2, mb: 1 }}
    >
      <Box
        sx={{
          border: '2px dashed',
          borderColor: error ? '#B71C1C' : imageUrl ? 'success.main' : '#D4A373',
          borderRadius: 2,
          p: 2.5,
          textAlign: 'center',
          backgroundColor: error
            ? 'rgba(183,28,28,0.04)'
            : imageUrl
            ? 'rgba(46,125,50,0.04)'
            : 'rgba(212,163,115,0.06)',
          transition: 'all 0.2s',
        }}
      >
        {/* Success State */}
        {imageUrl && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
              <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
                Uploaded successfully
              </Typography>
            </Box>
            {sizeInfo && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatSize(sizeInfo.original)} → {formatSize(sizeInfo.compressed)}
                {sizeInfo.original > sizeInfo.compressed && (
                  <span style={{ color: '#2E7D32', fontWeight: 600 }}>
                    {' '}({Math.round((1 - sizeInfo.compressed / sizeInfo.original) * 100)}% smaller)
                  </span>
                )}
              </Typography>
            )}
            <Box sx={{ mt: 1 }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 6,
                  border: '1px solid #D4A373',
                  color: '#5C3D2E',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
              >
                Replace
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>
            </Box>
          </Box>
        )}

        {/* Error State */}
        {error && !imageUrl && (
          <Box>
            <ErrorOutlineIcon sx={{ color: '#B71C1C', fontSize: 28, mb: 0.5 }} />
            <Typography variant="body2" sx={{ color: '#B71C1C', fontWeight: 500, mb: 1 }}>
              {error}
            </Typography>
            <button
              onClick={handleRetry}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 16px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                borderRadius: 6,
                border: '1px solid #B71C1C',
                color: '#B71C1C',
                cursor: 'pointer',
                backgroundColor: 'transparent',
              }}
            >
              Try Again
            </button>
          </Box>
        )}

        {/* Default / Uploading State */}
        {!imageUrl && !error && (
          <>
            <CloudUploadIcon sx={{ color: '#9B8B7E', fontSize: 28, mb: 0.5 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              {isUploading ? status : 'Choose an image to upload'}
            </Typography>

            {!isUploading && (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 16px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    borderRadius: 6,
                    border: '1px solid #D4A373',
                    color: '#5C3D2E',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                  }}
                >
                  <CloudUploadIcon style={{ fontSize: 16 }} />
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 16px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    borderRadius: 6,
                    border: 'none',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    backgroundColor: '#5C3D2E',
                  }}
                >
                  <CameraAltIcon style={{ fontSize: 16 }} />
                  Camera
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </label>
              </Box>
            )}

            {isUploading && (
              <Box sx={{ mt: 1.5, px: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={uploadProgress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(212,163,115,0.2)',
                    '& .MuiLinearProgress-bar': { backgroundColor: '#D4A373', borderRadius: 3 },
                  }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  {Math.round(uploadProgress)}%
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default UploadImage;
