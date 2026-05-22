import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../context/firebaseConfig';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const UploadImage = ({ folderName, setMember, imageType, setGallery, setEvent, setExecutive }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    event.stopPropagation();
    setSelectedFile(event.target.files[0]);
    setImageUrl(null);
    setUploadProgress(0);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedFile) return;

    setIsUploading(true);
    const storageRef = ref(storage, `${folderName}/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload Error:', error);
        setIsUploading(false);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrl(downloadURL);
          setIsUploading(false);
          if (imageType === 'member') {
            setMember((member) => ({ ...member, memberImgUrl: downloadURL }));
          }
          if (imageType === 'house') {
            setMember((member) => ({ ...member, houseImgUrl: downloadURL }));
          }
          if (imageType === 'gallery') {
            setGallery((gallery) => ({ ...gallery, galleryImgUrl: downloadURL }));
          }
          if (imageType === 'event') {
            setEvent((event) => ({ ...event, eventImgUrl: downloadURL }));
          }
          if (imageType === 'executive') {
            setExecutive((executive) => ({ ...executive, executiveImgUrl: downloadURL }));
          }
        });
      }
    );
  };

  return (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{ mt: 2, mb: 1 }}
    >
      <Box
        sx={{
          border: '2px dashed',
          borderColor: imageUrl ? 'success.main' : '#D4A373',
          borderRadius: 2,
          p: 2.5,
          textAlign: 'center',
          backgroundColor: imageUrl ? 'rgba(46,125,50,0.04)' : 'rgba(212,163,115,0.06)',
          transition: 'all 0.2s',
        }}
      >
        {imageUrl ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600 }}>
              Uploaded successfully
            </Typography>
          </Box>
        ) : (
          <>
            <CloudUploadIcon sx={{ color: '#9B8B7E', fontSize: 28, mb: 0.5 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
              {selectedFile ? selectedFile.name : 'Choose a file to upload'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
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
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              {selectedFile && !isUploading && (
                <button
                  onClick={handleUpload}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
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
                  Upload
                </button>
              )}
            </Box>
          </>
        )}

        {isUploading && (
          <Box sx={{ mt: 2 }}>
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
      </Box>
    </Box>
  );
};

export default UploadImage;
