import { Request, Response } from 'express'

const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req: Request, res: Response) => {
    const users = await User.find({})
    res.json(users)
})

usersRouter.post('/', async (req: Request, res: Response) => {
  const { username, password } = req.body

  if (!password) {
    return res.status(400).json({error: 'password is required'})
  }
  if (password.length < 3) {
    return res.status(400).json({error: 'password minimum length 3 letters'})
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    passwordHash,
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

module.exports = usersRouter