import chai from 'chai'
import chaiHttp from 'chai-http'

chai.use(chaiHttp)
const expect = chai.expect

describe('GET All Products', () => {
  beforeEach((done) => { //eslint-disable-line
    const product = {
      sellerId: 'testing@gmail.com',
      category: 'Bicycle',
      code: '38BEE270',
      description: 'Newest brand of bicycle',
      gender: 'Men',
      images: ['abc.jpg'],
      name: 'Yamaha',
      minBiddingPrice: {
        $numberDecimal: '500'
      },
      tags: [
        'Mountain Bicycle'
      ],
      cover: '',
      biddingStatus: 'in bid'
    }

    chai.request('http://product:5001/products/')
      .post('/createproduct')
      .send(product)
      .end(() => {
        done()
      })
  })

  it('Retrieved all products', async () => {
    const res = await chai.request('http://product:5001/products/')
      .get('/getallproduct')
    expect(res).to.have.status(200)
    expect(res.body.length).to.equal(1)
  })
})


describe('GET /38BEE270', () => {
  it('Retrieved product 38BEE270', async () => {
    const res = await chai.request('http://product:5001/products/').get('/38BEE270')
    expect(res).to.have.status(200)
    expect(res.body.length).to.equal(1)
  })
})

describe('GET bidding products', () => {
  it('Retrieved bidding products', async () => {
    const res = await chai.request('http://product:5001/products/').get('/yuenkm40@gmail.com/products')
    expect(res).to.have.status(404)
  })
})

describe('POST new product', () => {
  it('Created a new product', async () => {
    const product = {
      sellerId: 'yuenkm40@gmail.com',
      category: 'Shoes',
      code: 'ABC123',
      description: 'Newest brand of shoes',
      gender: 'Women',
      images: ['12345.jpg'],
      name: 'Heels',
      minBiddingPrice: {
        $numberDecimal: '250'
      },
      tags: [
        'Nike Running Shows'
      ],
      cover: '',
      biddingStatus: 'available'
    }
    const res = await chai.request('http://product:5001/products/').post('/createproduct').send(product)
    expect(res).to.have.status(201)
    expect(res.body).to.have.property('sellerId')
    expect(res.body.sellerId).to.equal('yuenkm40@gmail.com')
  })
})

describe('POST new product', () => {
  it('Created a new product failed due to no code', async () => {
    const product = {
      sellerId: 'yuenkm40@gmail.com',
      category: 'Shoes',
      description: 'Newest brand of shoes',
      gender: 'Women',
      images: ['12345.jpg'],
      name: 'Heels',
      minBiddingPrice: {
        $numberDecimal: '250'
      },
      tags: [
        'Nike Running Shows'
      ],
      cover: '',
      biddingStatus: 'available'
    }
    const res = await chai.request('http://product:5001/products/').post('/createproduct').send(product)
    expect(res).to.have.status(500)
    expect(res.body.message).to.equal('Something went wrong')
  })
})

describe('PUT product', () => {
  it('Update bidding product', async () => {
    const product = {
      code: 'ABC123',
      category: 'Backpacks and bags',
      description: 'Latest version of handbag',
      gender: 'Women',
      images: ['8496.jpg'],
      name: 'Heels',
      cover: ''
    }
    const res = await chai.request('http://product:5001/products/').put('/updateproduct').send(product)
    expect(res).to.have.status(200)
    expect(res.body.modifiedCount).to.equal(1)
  })
})

describe('PUT product', () => {
  it('Update bidding product failed due to invalid code', async () => {
    const product = {
      code: 'XYZ',
      category: 'Backpacks and bags',
      description: 'Latest version of handbag',
      gender: 'Women',
      images: ['8496.jpg'],
      name: 'Heels',
      cover: ''
    }
    const res = await chai.request('http://product:5001/products/').put('/updateproduct').send(product)
    expect(res).to.have.status(404)
    expect(res.body.message).to.equal('Product does not exist.')
  })
})

describe('PATCH product ABC123', () => {
  it('Patch bidding status of bidding product', async () => {
    const biddingStatus = {
      biddingStatus: 'in bid'
    }
    const res = await chai.request('http://product:5001/products/').patch('/patchbiddingstatus/ABC123').send(biddingStatus)
    expect(res).to.have.status(200)
    expect(res.body.modifiedCount).to.equal(1)
  })
})

describe('PATCH product XYZ', () => {
  it('Patch bidding status of bidding product failed due to invalid code', async () => {
    const biddingStatus = {
      biddingStatus: 'in bid'
    }
    const res = await chai.request('http://product:5001/products/').patch('/patchbiddingstatus/XYZ').send(biddingStatus)
    expect(res).to.have.status(404)
    expect(res.body.message).to.equal('Product does not exist.')
  })
})

describe('DELETE product ABC123', () => {
  it('Delete bidding product', async () => {
    const res = await chai.request('http://product:5001/products/').delete('/ABC123')
    expect(res).to.have.status(200)
    expect(res.body.code).to.equal('ABC123')
  })
})

describe('DELETE product XYZ', () => {
  it('Delete bidding product failed due to invalid code', async () => {
    const res = await chai.request('http://product:5001/products/').delete('/XYZ')
    expect(res).to.have.status(404)
    expect(res.body.message).to.equal('Product does not exist.')
  })
})
