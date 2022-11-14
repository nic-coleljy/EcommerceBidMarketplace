import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

import User from '../models/user.js'

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
export const signin = async (req, res) => {
  const { email, password } = req.body
  if (!password) res.status(500).json({ message: 'Something went wrong.' })
  else {
    try {
      const existingUser = await User.findOne({ email })
      if (!existingUser) return res.status(404).json({ message: 'User does not exist.' })

      const isPasswordCorrect = await bcrypt.compare(password, existingUser.password)
      if (!isPasswordCorrect) return res.status(400).json({ message: 'Invalid Credentials' })

      const accessToken = jwt.sign({ email: existingUser.email, id: existingUser._id }, 'test', { expiresIn: '1h' })

      const user = {
        email: existingUser.email,
        name: existingUser.name
      }

      res.status(200).json({ user, accessToken })
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong.' })
    }
  }
}

export const signup = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body
  try {
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(400).json({ message: 'User already exist.' })
    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords don't match." })

    const hashedPassword = await bcrypt.hash(password, 12)

    const result = await User.create({ email, password: hashedPassword, name: `${firstName} ${lastName}` })

    const user = {
      email,
      firstName,
      lastName
    }

    const accessToken = jwt.sign({ email: result.email, id: result._id }, 'test', { expiresIn: '1h' })

    res.status(201).json({ user, accessToken })
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' })
    console.log(error)
  }
}

export const getUser = async (req, res) => {
  const { id } = req.params

  console.log(id);
  try {
      const user = await User.findById(id);
      if (user === null) {
      res.status(404).json({ message: 'User does not exist.' })
    } else res.status(200).json(user)
  } catch (error) {
    res.status(404).json({ message: error.message })
  }
}

// export const verifyToken = async(req, res) => {

// }
