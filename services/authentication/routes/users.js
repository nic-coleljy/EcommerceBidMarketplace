import express from 'express'
import { signin, signup, getUser, healthcheck } from '../controllers/user.js'

const router = express.Router()
router.get('/health', healthcheck)
router.post('/signin', signin)
router.post('/signup', signup)
router.get('/:id', getUser)
export default router
