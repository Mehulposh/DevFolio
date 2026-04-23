import express from 'express'
import {protect} from '../middleware/authMiddleware.js'
import  {
    imageUpload,
    deleteImage,
} from '../controller/uploadConteroller.js'

const router = express.Router()

router.post('/image' , protect , upload.single('image') , imageUpload)
router.delete('/:publicId' , protect , deleteImage)

export default router