import chai from 'chai'
import chaiHttp from 'chai-http'
chai.use(chaiHttp)
const expect = chai.expect

describe('POST new checkout session', () => {
  it('Created a new checkout session for Stripe Payment successfully', async () => {
    const payload = {
      data:
                [
                  {
                    name: 'fireworks BOMOM',
                    cover: '',
                    price: 11837,
                    bid: 11837,
                    quantity: 1,
                    subtotal: 11837,
                    code: 'r3v454'
                  }
                ]
    }
    const res = await chai.request('http://payment:5200/payment/').post('/create-checkout-session').send(payload)
    expect(res).to.have.status(200)
    expect(res.body).to.have.property('url')
  })
})

describe('POST new checkout session', () => {
  it('An Error occured in creating a new checkout session for Stripe Payment', async () => {
    const payload = {
      data: null
    }
    const res = await chai.request('http://payment:5200/payment/').post('/create-checkout-session').send(payload)
    expect(res).to.have.status(500)
    expect(res.body).to.have.property('message')
    expect(res.body.message).to.equal('An error has occured')
  })
})
