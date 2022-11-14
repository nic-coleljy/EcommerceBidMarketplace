import chai from 'chai'
import chaiHttp from 'chai-http'

chai.use(chaiHttp)
const expect = chai.expect

describe('Test /health', () => {
  it('Authentication should be healthy', async () => {
    const res = await chai.request('http://authentication:5100/user/').get('/health')
    expect(res).to.have.status(200)
    expect(res.body).to.have.property('message')
  })
})
