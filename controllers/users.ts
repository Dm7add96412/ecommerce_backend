import { Request, Response, Router } from 'express'
import bcrypt from 'bcrypt'

import User from '../models/user'
import { TokenRequest } from '../types/TokenRequest'
import { userExtractor } from '../utils/middleware'

const usersRouter = Router()

usersRouter.get('/', async (req: Request, res: Response) => {
    const users = await User.find({})
    res.json(users)
})

usersRouter.get('/:id', async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id)
  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
  }
})

usersRouter.post('/', async (req: Request, res: Response) => {
  const { username, password } = req.body

  if (!password) {
    res.status(400).json({error: 'password is required'})
    return
  }
  if (password.length < 3) {
    res.status(400).json({error: 'password minimum length 3 letters'})
    return
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

usersRouter.put('/:id', userExtractor, async (req: TokenRequest, res: Response) => {
  const user = req.user
})

export default usersRouter