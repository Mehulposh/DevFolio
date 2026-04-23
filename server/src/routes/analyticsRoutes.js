import express from 'express'
import {protect} from '../middleware/authMiddleware.js'
import getAllStats from '../controller/analyticsController.js'

const router = express.Router()

router.get('/overview' , protect , getAllStats)

export default router