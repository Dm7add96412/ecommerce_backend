import { Request, Response } from 'express'
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()

import { TokenRequest } from '../types/TokenRequest'
const middleware = require('../utils/middleware')
const User = require('../models/user')

loginRouter.post('/', async (req: Request, res: Response) => {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    if (!user) {
        return res.status(401).json({
            error: 'invalid username'
        })
    }

    const passwordCorrect = await bcrypt.compare(password, user.passwordHash)

    if (!passwordCorrect) {
        return res.status(401).json({
            error: 'invalid password'
        })
    }

    const userForToken = {
        username: user.username,
        id: user._id
    }

    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60*60 })

    res.status(200).send({ token, username: user.username })
})

loginRouter.post('/validate', middleware.userExtractor, (req: TokenRequest, res: Response) => {
    res.status(200).json({ valid: true, user: req.user })
})

module.exports = loginRouter