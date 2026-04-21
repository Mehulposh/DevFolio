import Blog from '../model/blogModel.js'
import {validationResult} from 'express-validator'


//GET api/blog - Public: list published blogs
const getBlog = async(req,res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1 ) * limit
        const tag = req.query.tag
        const category = req.query.category
        const search = req.query.search
        const featured = req.query.featured

        const filter = {status: 'published'}

        if(tag) filter.tags = tag
        if(category) filter.category = category
        if(featured) filter.featured = true
        if(search) filter.$text = {$search: search}

        const [blogs,total] = await Promise.all([
            Blog.find(filter)
            .select('-content -analytics.likedBy')
            .populate('author', 'name avatar')
            .sort(search ? {score: {$meta: 'textScore'}}: {publishedAt: -1})
            .skip(skip)
            .limit(limit),
            
            Blog.countDocuments(filter)
        ])

        res.json({
            blogs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total/limit),
                limit
            }
        })
    } catch (error) {
        res.status(500).json({error: 'Error fetching blogs'})
    }    
}


//GET /api/blog/admin - Admin: List all blogs
const listAllBlogs = async(req,res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1 ) * limit
        const status = req.query.status

        const filter = {}

        if(status) filter.status = status

        const [blogs, total] = await Promise.all([
        Blog.find(filter)
            .select('-content -analytics.likedBy')
            .populate('author', 'name avatar')
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit),
        Blog.countDocuments(filter)
        ]);
    
        res.json({ 
            blogs, 
            pagination: { 
                total, 
                page, 
                pages: Math.ceil(total / limit), 
                limit 
            } 
        });
    } catch (error) {
        res.status(500).json({error: 'Error fetcj=hin all blogs'})
    }
}

export {
    getBlog,
    listAllBlogs,

}