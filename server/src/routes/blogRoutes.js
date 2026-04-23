import express from 'express'
import {protect} from '../middleware/authMiddleware.js'
import {body} from 'express-validator'
import {
    getBlog,
    listAllBlogs,
    tags,
    stats,
    getSlug,
    getBlogById,
    newBlog,
    updateBlog,
    deleteBlog,
    likes
} from '../controller/blogController.js'

const router = express.Router()

router.get('/', getBlog)
router.get('/admin' , protect ,listAllBlogs)
router.get('/tags' , tags)
router.get('/stats' , protect , stats)
router.get('/:slug' , getSlug)
router.get('/admin/:id' , protect , getBlogById)
router.post('/' , protect ,  [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('excerpt').trim().isLength({ min: 10, max: 500 }),
  body('content').isLength({ min: 50 })
], newBlog)

router.put('/:id' , protect , updateBlog)
router.delete('/:id' , protect , deleteBlog)
router.post('/:id/like' , likes)

export default router
