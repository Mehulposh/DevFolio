import Blog from '../model/blogModel.js'


// GET /api/analytics/overview - Admin dashboard stats
const getAllStats = async (req, res) => {
  try {
    const [
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      totalViewsResult,
      totalLikesResult,
      recentBlogs,
      topPosts,
      viewsByMonth
    ] = await Promise.all([
      Blog.countDocuments(),
      Blog.countDocuments({ status: 'published' }),
      Blog.countDocuments({ status: 'draft' }),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$analytics.views' } } }]),
      Blog.aggregate([{ $group: { _id: null, total: { $sum: '$analytics.likes' } } }]),
      Blog.find({ status: 'published' })
        .select('title slug publishedAt analytics.views analytics.likes')
        .sort({ publishedAt: -1 })
        .limit(5),
      Blog.find({ status: 'published' })
        .select('title slug analytics.views analytics.likes analytics.readTime')
        .sort({ 'analytics.views': -1 })
        .limit(10),
      Blog.aggregate([
        { $match: { status: 'published', publishedAt: { $exists: true } } },
        {
          $group: {
            _id: {
              year: { $year: '$publishedAt' },
              month: { $month: '$publishedAt' }
            },
            posts: { $sum: 1 },
            views: { $sum: '$analytics.views' }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ])
    ]);
 
    res.json({
      overview: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews: totalViewsResult[0]?.total || 0,
        totalLikes: totalLikesResult[0]?.total || 0
      },
      recentBlogs,
      topPosts,
      viewsByMonth: viewsByMonth.reverse()
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching analytics.' });
  }
};
 

export default getAllStats