import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import cors from 'cors'
import helmet from 'helmet'
import productRoutes from './routes/product.js'
import dotenv from 'dotenv'
// import path from 'path'
// import { fileURLToPath } from 'url'
// import { Server } from 'http'
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const port = process.env.PORT || 5001

app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))

app.use(cors())
app.use(express.json())

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false
  })
)

app.use('/products', productRoutes)
// Handle front-end files
// app.use(express.static(path.join(__dirname, 'client/build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '/client/build', 'index.html'));
// });

const CONNECTION_URL = process.env.MONGODB_URL

mongoose.connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(port, () => console.log(`Server Running on Port: http://localhost:${port}`)))
  .catch((error) => console.log(`${error} did not connect`))
