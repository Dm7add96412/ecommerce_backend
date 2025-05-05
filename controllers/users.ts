import { Request, Response, Router } from 'express'
import bcrypt from 'bcrypt'

import User, { IUser, IUserResponse, ICartItem } from '../models/user'
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
    res.status(400).json({ error: 'password is required' })
    return
  }
  if (password.length < 3) {
    res.status(400).json({ error: 'password minimum length 3 letters' })
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

usersRouter.delete('/', userExtractor, async (req: TokenRequest, res: Response) => {
  const user = req.user

  if (!user) {
    res.status(404).json({ error: 'Unauthorized: user not found' })
    return
  }

  const deletedUser = await User.findByIdAndDelete(user.id.toString())
  console.log(deletedUser)
  res.status(204).end()

})

usersRouter.put('/', userExtractor, async (req: TokenRequest, res: Response) => {
  const user = req.user
  const body = req.body

  if (!user) {
    res.status(404).json({ error: 'Unauthorized: user not found' })
    return
  }

  const cartItem: ICartItem = {
    productId: body.productId,
    title: body.title,
    price: body.price,
    images: body.images,
    quantity: body.quantity
  }

  const foundItem = user.cart.find(item => item.productId === cartItem.productId)
  if (foundItem) {
    if (cartItem.quantity <= 0) {
      user.cart = user.cart.filter(item => item.productId !== cartItem.productId)
    } else {
      foundItem.quantity = cartItem.quantity
    }
  } else {
    if (cartItem.quantity > 0) {
      user.cart.push(cartItem)
    } else {
      res.status(404).json({ error: 'cannot add quantity 0 into cart' })
      return
    }
    
  }
  const savedUser = await user.save()
  const updatedCartItem = savedUser.cart.find(item => item.productId === cartItem.productId)
  if (!updatedCartItem) {
    res.status(204).end()
    return
  }
  res.status(201).json(updatedCartItem)
})

export default usersRouter