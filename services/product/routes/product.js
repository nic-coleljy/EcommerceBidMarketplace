import express from 'express'
import { createproduct, getproduct, healthcheck, getallproduct, updateproduct, deleteproduct, getbiddingProducts, patchproductbiddingstatus } from '../controllers/product.js'

const router = express.Router()
// Get all have to be the first request
router.get('/health', healthcheck)
router.get('/getallproduct', getallproduct)
router.get('/:code', getproduct)
router.post('/createproduct', createproduct)
router.get('/:sellerId/products', getbiddingProducts)
router.put('/updateproduct', updateproduct)
router.patch('/patchbiddingstatus/:code', patchproductbiddingstatus)
router.delete('/:code', deleteproduct)
export default router
