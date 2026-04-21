import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
 
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



// POST /api/upload/image - Upload single image
const imageUpload = async(req,res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image provided.' });
        }
    
        res.json({
            url: req.file.path,
            publicId: req.file.filename,
            width: req.file.width,
            height: req.file.height
        });
    } catch (err) {
        res.status(500).json({ error: 'Upload failed.' });
    }
}


// DELETE /api/upload/:publicId - Delete image from Cloudinary
const deleteImage = async (req,res) => {
    try {
        const publicId = decodeURIComponent(req.params.publicId);
        
        await cloudinary.uploader.destroy(publicId);
        
        res.json({ message: 'Image deleted.' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting image.' });
    }
}



export {
    imageUpload,
    deleteImage,
}