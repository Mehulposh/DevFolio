import express from 'express'
import {protect} from '../middleware/authMiddleware.js'
import {
    getProjects,
    getAllProjects,
    NewProject,
    updateProject,
    deleteProject
} from '../controller/PortfolioController.js'

const router = express.Router()

router.get('/' , getProjects)
router.get('/admin' , protect , getAllProjects)
router.post('/' , protect , NewProject)
router.put('/:id' , protect , updateProject)
router.delete('/:id' , protect , deleteProject)

export default router