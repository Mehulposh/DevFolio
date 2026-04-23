import express from 'express'
import {protect} from '../middleware/authMiddleware.js'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import  {
    imageUpload,
    deleteImage,
} from '../controller/uploadConteroller.js'

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'devfolio',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const router = express.Router()

router.post('/image' , protect , upload.single('image') , imageUpload)
router.delete('/:publicId' , protect , deleteImage)

export default router