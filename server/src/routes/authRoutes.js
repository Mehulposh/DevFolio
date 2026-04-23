import express from 'express'
import {protect} from '../middleware/authMiddleware.js'
import {body} from 'express-validator'
import {
    Login,
    Profile,
    updateProfile,
    changePassword,
    setup
} from '../controller/authController.js'

const router = express.Router()

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], Login)

router.get('/me', protect, Profile)

router.put('/profile', protect , [
  body('name').optional().trim().isLength({ min: 1, max: 50 }),
  body('bio').optional().trim(),
] , updateProfile)

router.post('/change-password' , protect, [
  body('currentPassword').isLength({ min: 1 }),
  body('newPassword').isLength({ min: 8 })
], changePassword)

router.post('/setup', setup)

export default router