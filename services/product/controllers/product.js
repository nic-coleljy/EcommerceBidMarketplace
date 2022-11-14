import Product from '../models/product.js'

// Get all have to be the first request
export const getallproduct = async (req, res) => {
  try {
    const products = await Product.find({ biddingStatus: 'in bid' })
    if (JSON.stringify(products) === '[]') {
      res.status(404).json({ message: 'Product does not exist.' })
    } else {
      res.status(200).json(products)
    }
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const healthcheck = async (req, res) => {
  try {
    const healthcheck = {
      message: 'Service OK'
    }
    console.log(healthcheck)
    console.log(healthcheck.message)
    res.status(200).json(healthcheck)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

// Get all of user's created bidding items (not auctioned yet)
export const getbiddingProducts = async (req, res) => {
  const { sellerId } = req.params
  try {
    const biddingProducts = await Product.find({ sellerId })
    if (JSON.stringify(biddingProducts) === '[]') {
      res.status(404).json({ message: 'Product does not exist.' })
    } else {
      res.status(200).json(biddingProducts)
    }
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const getproduct = async (req, res) => {
  const { code } = req.params
  try {
    const product = await Product.find({ code })
    if (JSON.stringify(product) === '[]') {
      res.status(404).json({ message: 'Product does not exist.' })
    } else {
      res.status(200).json(product)
    }
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const createproduct = async (req, res) => {
  const product = req.body
  const newProduct = new Product(product)
  try {
    await newProduct.save()
    res.status(201).json(newProduct)
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
    console.log(error)
  }
}

export const updateproduct = async (req, res) => {
  const { code, cover, images, gender, name, description, category } = req.body

  try {
    const existingProduct = await Product.findOne({ code })
    console.log(existingProduct)
    if (!existingProduct) return res.status(404).json({ message: 'Product does not exist.' })
    const product = await Product.updateOne({ code },
      {
        $set: {
          cover,
          images,
          gender,
          name,
          description,
          category
        }
      })
    console.log(product)
    res.status(200).json(product)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const patchproductbiddingstatus = async (req, res) => {
  const { code } = req.params
  const { biddingStatus } = req.body
  console.log(req.body)
  try {
    const existingProduct = await Product.findOne({ code })
    if (!existingProduct) return res.status(404).json({ message: 'Product does not exist.' })

    const product = await Product.updateOne({ code },
      {
        $set: {
          biddingStatus
        }
      })
    res.status(200).json(product)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

export const deleteproduct = async (req, res) => {
  const { code } = req.params

  try {
    const existingProduct = await Product.findOne({ code })
    if (!existingProduct) return res.status(404).json({ message: 'Product does not exist.' })
    const product = await Product.findOneAndRemove({ code })
    // console.log(product);
    res.status(200).json(product)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}
