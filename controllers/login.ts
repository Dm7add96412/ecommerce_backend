import { Request, Response, Router } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

import { TokenRequest } from '../types/TokenRequest'
import { userExtractor } from '../utils/middleware'
import User from '../models/user'

const loginRouter = Router()

loginRouter.post('/', async (req: Request, res: Response) => {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    if (!user) {
        res.status(401).json({ error: 'User not found' })
        return
    }

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

    if (!passwordCorrect) {
        res.status(401).json({ error: 'Invalid password' })
        return
    }

    const userForToken = {
        username: user.username,
        id: user._id
    }

    const token = jwt.sign(userForToken, process.env.SECRET!, { expiresIn: 60*60 })

    res.status(200).send({ token, username: user.username, id: user.id })
})

loginRouter.post('/validate', userExtractor, (req: TokenRequest, res: Response) => {
    res.status(200).json({ valid: true, user: req.user })
})

export default loginRouter