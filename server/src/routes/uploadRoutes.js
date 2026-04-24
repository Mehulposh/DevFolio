import express from 'express'
import {protect} from '../middleware/authMiddleware.js'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv'
import  {
    imageUpload,
    deleteImage,
} from '../controller/uploadConteroller.js'

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("CLOUD NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API KEY:", process.env.CLOUDINARY_API_KEY);
console.log("API SECRET:", process.env.CLOUDINARY_API_SECRET);

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

router.post('/image', protect, (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error("MULTER ERROR:", err); // ✅ THIS IS KEY
      return res.status(500).json({ error: err.message });
    }
    next();
  });
}, imageUpload);
router.delete('/:publicId' , protect , deleteImage)

export default router