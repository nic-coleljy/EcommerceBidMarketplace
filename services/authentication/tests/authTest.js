import chai from 'chai'
import chaiHttp from 'chai-http'
import mongoose from 'mongoose'

chai.use(chaiHttp)
const expect = chai.expect

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  id: { type: String }
})

const User = mongoose.model('User', userSchema)

const testURL = process.env.MONGODB_URL

const seedUsers = [
  {
    name: 'John Doe',
    email: 'john@gmail.com',
    password: '$2a$12$npNyoub1fWnvnYzl4MGHB.KnZQ30dTVzV.Nhv0ocSolNmkeqPyiyy',
    id: '1'
  },
]

describe('GET specific user', function () {
  beforeEach(function () { // eslint-disable-line
    mongoose.connect(testURL, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log('Connected to MongoDB'))
      .catch((error) => console.log(error))
  })

  it('Populate database', async () => {
    await User.insertMany(seedUsers)
  })

  it('Retrieved user detail id 1', async () => {
    const user = await User.findOne();
    const res = await chai.request('http://authentication:5100/user/').get(`/${user._id}`)
    expect(res).to.have.status(200)
  })

  it('An error occured for non existent user detail id 99', async () => {
    const res = await chai.request('http://authentication:5100/user/').get('/99')
    expect(res).to.have.status(404)
  })
})



describe('POST new user', () => {
  it('Created user successfully', async () => {
    await User.deleteMany({})
    const payload = {
      email: 'test@gmail.com',
      password: 'test1234',
      confirmPassword: 'test1234',
      firstName: 'test',
      lastName: 'me'
    }
    const res = await chai.request('http://authentication:5100/user/').post('/signup').send(payload)
    expect(res).to.have.status(201)
  })
})

describe('POST existing user', () => {
  it('An error occured in creating existing user', async () => {
    await User.insertMany(seedUsers)
    const payload = {
      email: 'john@gmail.com',
      password: 'test1234',
      confirmPassword: 'test1234',
      firstName: 'test',
      lastName: 'me'
    }
    const res = await chai.request('http://authentication:5100/user/').post('/signup').send(payload)
    expect(res).to.have.status(400)
  })
})

describe('POST user with wrong repeat password', () => {
  it('An error occured in password validation', async () => {
    const payload = {
      email: 'john@gmail.com',
      password: 'test1234',
      confirmPassword: 'test12346',
      firstName: 'test',
      lastName: 'me'
    }
    const res = await chai.request('http://authentication:5100/user/').post('/signup').send(payload)
    expect(res).to.have.status(400)
  })
})

describe('POST user with null values', () => {
  it('An error occured in posting null values', async () => {
    const res = await chai.request('http://authentication:5100/user/').post('/signup', null)
    expect(res).to.have.status(500)
  })
})

describe('POST user login', () => {
  it('User login successfully', async () => {
    const payload = {
      email: 'john@gmail.com',
      password: 'P@ssw0rd123!'
    }
    const res = await chai.request('http://authentication:5100/user/').post('/signin').send(payload)
    expect(res).to.have.status(200)
    expect(res.body).to.have.property('user')
    expect(res.body.user.email).to.equal('john@gmail.com')
    expect(res.body.user.name).to.equal('John Doe')
  })
})

describe('POST user login', () => {
  it('An error occured with wrong password', async () => {
    const payload = {
      email: 'john@gmail.com',
      password: 'P@ssw0r23!'
    }
    const res = await chai.request('http://authentication:5100/user/').post('/signin').send(payload)
    expect(res).to.have.status(400)
    expect(res.body).to.have.property('message')
    expect(res.body.message).to.equal('Invalid Credentials')
  })
})

describe('POST user login', () => {
  it('An error occured with non existent user', async () => {
    const payload = {
      email: 'john123@gmail.com',
      password: 'P@ssw0r23!'
    }
    const res = await chai.request('http://authentication:5100/user/').post('/signin').send(payload)
    expect(res).to.have.status(404)
    expect(res.body).to.have.property('message')
    expect(res.body.message).to.equal('User does not exist.')
  })
})

describe('POST user login', () => {
  it('An error occured with null values', async () => {
    const res = await chai.request('http://authentication:5100/user/').post('/signin').send(null)
    expect(res).to.have.status(500)
    expect(res.body).to.have.property('message')
    expect(res.body.message).to.equal('Something went wrong.')
  })
})

describe('End connection', () => {
  it('End Mongoose Connection', async () => {
    mongoose.connection.close()
  })
})
