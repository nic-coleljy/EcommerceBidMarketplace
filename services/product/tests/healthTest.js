import chai from 'chai'
import chaiHttp from 'chai-http'

chai.use(chaiHttp)
const expect = chai.expect

describe('Test /health', () => {
  it('Product should be healthy', async () => {
    const res = await chai.request('http://product:5001/products/').get('/health')
    expect(res).to.have.status(200)
    expect(res.body).to.have.property('message')
  })
})
