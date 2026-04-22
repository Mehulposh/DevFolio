import Project from '../model/projectModel.js'


// GET /api/portfolio - Public
const getProjects =  async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = { status: 'published' };
    if (category) filter.category = category;
    if (featured) filter.featured = true;
 
    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching projects.' });
  }
};
 
// GET /api/portfolio/admin - Admin: all projects
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching projects.' });
  }
};
 
// POST /api/portfolio - Admin: create project
const NewProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ project });
  } catch (err) {
    res.status(500).json({ error: 'Error creating project.' });
  }
};
 
// PUT /api/portfolio/:id - Admin: update project
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ project });
  } catch (err) {
    res.status(500).json({ error: 'Error updating project.' });
  }
};
 
// DELETE /api/portfolio/:id - Admin: delete project
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found.' });
    res.json({ message: 'Project deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting project.' });
  }
};


export {
    getProjects,
    getAllProjects,
    NewProject,
    updateProject,
    deleteProject
}