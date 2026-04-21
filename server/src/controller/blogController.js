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
        res.status(500).json({error: 'Error fetching all blogs'})
    }
}


//GET api/blog/tags - GEt all distinct tags
const tags = async (req,res) => {
    try {
        const tags = await Blog.distinct('tags',{status: 'published'})
        res.json({tags})
    } catch (error) {
        res.status(500).json({error: 'Error fetching tags'})
    }
}


//GET api/blog/stats - Admin analytics summary
const stats = async (req,res) => {
    try {
        const [total, published, drafts, topViewed, totalViews, totalLikes] = await Promise.all([
            Blog.countDocuments(),
            Blog.countDocuments({ status: 'published' }),
            Blog.countDocuments({ status: 'draft' }),
            Blog.find({ status: 'published' })
                .select('title slug analytics.views analytics.likes')
                .sort({ 'analytics.views': -1 })
                .limit(5),
            Blog.aggregate([{ $group: { _id: null, total: { $sum: '$analytics.views' } } }]),
            Blog.aggregate([{ $group: { _id: null, total: { $sum: '$analytics.likes' } } }])
        ])

         res.json({
            total,
            published,
            drafts,
            topViewed,
            totalViews: totalViews[0]?.total || 0,
            totalLikes: totalLikes[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching stats.' });
    }
}


//GET api/blog/:slug - Public : get single blog
const getSlug = async(req,res) => {
    try {
        const blog = await Blog.findOne({ slug: req.params.slug, status: 'published' })
        .populate('author', 'name avatar bio socialLinks')
        .select('-analytics.likedBy');
    
        if (!blog) return res.status(404).json({ error: 'Blog not found.' });
    
        // Increment views
        await Blog.findByIdAndUpdate(blog._id, { $inc: { 'analytics.views': 1 } });

        // Get related blogs
        const related = await Blog.find({
            _id: { $ne: blog._id },
            status: 'published',
            $or: [
                { tags: { $in: blog.tags } },
                { category: blog.category }
            ]
        })
        .select('title slug excerpt coverImage analytics.readTime publishedAt tags')
        .limit(3);

        res.json({ 
            blog: { 
                ...blog.toObject(), 
                analytics: { 
                    ...blog.analytics, 
                    views: blog.analytics.views + 1 
                } 
            }, 
            related 
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching blog.' });
    }
}


//GET api/blog/admin/:id - Admin: get blog by id (any status)
const getBlogById = async(req,res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author', 'name avatar');
        if (!blog) return res.status(404).json({ error: 'Blog not found.' });
        res.json({ blog });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching blog.' });
    }
}


//POST api/blog - Admin : create blog
const newBlog = async(req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const blog = await Blog.create({
            ...req.body,
            author: req.user._id
        });

        res.status(201).json({ blog });

    } catch (error) {
        res.status(500).json({ error: 'Error creating blog.' });
    }
}

 
//PUT api/blog/:id - Admin : Update blog
const updateBlog = async(req,res) => {
    try {
        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!blog) return res.status(404).json({ error: 'Blog not found.' });
        
        res.json({ blog });
    } catch (err) {
        res.status(500).json({ error: 'Error updating blog.' });
    }
}


//DELETE api/blog/:id - Admin : Delete blog
const deleteBlog = async(req,res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        
        if (!blog) return res.status(404).json({ error: 'Blog not found.' });
        
        res.json({ message: 'Blog deleted successfully.' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting blog.' });
    }
}


// POST /api/blog/:id/like - Public: like/unlike a blog
const likes = async(req,res) => {
    try {
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) return res.status(404).json({ error: 'Blog not found.' });
    
        const alreadyLiked = blog.analytics.likedBy.includes(ip);
    
        if (alreadyLiked) {
            await Blog.findByIdAndUpdate(req.params.id, {
                $inc: { 'analytics.likes': -1 },
                $pull: { 'analytics.likedBy': ip }
            });
            return res.json({ liked: false, likes: blog.analytics.likes - 1 });
        } else {
            await Blog.findByIdAndUpdate(req.params.id, {
                $inc: { 'analytics.likes': 1 },
                $push: { 'analytics.likedBy': ip }
            });
            return res.json({ liked: true, likes: blog.analytics.likes + 1 });
        }

    }catch (err) {
        res.status(500).json({ error: 'Error processing like.' });
    }
}

export {
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
}