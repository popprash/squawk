import express from 'express'
import { checkAuth } from '../controllers/auth.controller.js'
import { ProtectedRoute } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/check',ProtectedRoute,checkAuth)

export default router;