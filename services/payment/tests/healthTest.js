import chai from 'chai'
import chaiHttp from 'chai-http'

chai.use(chaiHttp)
const expect = chai.expect

describe('Test /health', () => {
  it('Payment should be healthy', async () => {
    const res = await chai.request('http://payment:5200/payment/').get('/health')
    expect(res).to.have.status(200)
    expect(res.body).to.have.property('message')
  })
})
