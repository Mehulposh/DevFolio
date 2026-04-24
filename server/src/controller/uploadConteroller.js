import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';


// POST /api/upload/image - Upload single image
const imageUpload = async(req,res) => {
    try {
        // console.log('upload req' , req);
        
        // console.log("FILE:", req.file); 
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
        console.log('upload error' , err);
        
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