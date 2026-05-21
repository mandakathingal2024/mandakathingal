import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../context/firebaseConfig';

const UploadImage = ({folderName,setMember,imageType,setGallery,setEvent,setExecutive}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = (e) => {
    e.preventDefault()
    if (!selectedFile) return;
    console.log('passed');

    const storageRef = ref(storage, `${folderName}/${selectedFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, selectedFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error('Upload Error:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setImageUrl(downloadURL);
          if(imageType==='member'){
            setMember((member)=>{
              return {...member,memberImgUrl:downloadURL}
            })
          }
          if(imageType==='house'){
            setMember((member)=>{
              return {...member,houseImgUrl:downloadURL}
            })
          }
          if(imageType==='gallery'){
            setGallery((gallery)=>{
              return {...gallery,galleryImgUrl:downloadURL}
            })
          }
          if(imageType==='event'){
            setEvent((event)=>{
              return {...event,eventImgUrl:downloadURL}
            })
          }
          if(imageType==='executive'){
            setExecutive((executive)=>{
              return {...executive,executiveImgUrl:downloadURL}
            })
          }
          // console.log('File available at', downloadURL);
        });
      }
    );
  };

  return (
    <div> 
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <div>Upload Progress: {uploadProgress}%</div>
      {imageUrl && <h6>image uploaded</h6>}
    </div>
  );
};

export default UploadImage;
``