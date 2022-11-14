import express from 'express'
import { healthcheck, checkoutSession } from '../controllers/payment.js'

const router = express.Router()
// Get all have to be the first request
router.get('/health', healthcheck)
router.post('/create-checkout-session', checkoutSession)

export default router
