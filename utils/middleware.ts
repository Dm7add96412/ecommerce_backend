import { NextFunction, Request, Response } from 'express'
const jwt = require('jsonwebtoken')

const logger = require('./logger')
const User = require('../models/user')

interface TokenRequest extends Request {
  token: string | null ,
  user?: string
}

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info('Method:', req.method)
  logger.info('Path:  ', req.path)
  logger.info('Body:  ', req.body)
  logger.info('---')
  next()
}

const unknownEndpoint = (req: Request, res: Response) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(error.message, ',', error.name)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    return res.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name ===  'JsonWebTokenError') {
    return res.status(401).json({ error: 'token missing or invalid' })
  } else if (error.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'token expired' })
  }
  next(error)
}

const tokenExtractor = (req: TokenRequest, res: Response, next: NextFunction) => {
  const authorization = req.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    req.token = authorization.replace('Bearer ', '')
  } else {
    req.token = null
  }
  next()
}

const userExtractor = async (req: TokenRequest, res: Response, next: NextFunction) => {
  const token = req.token
  if (!token) {
    return res.status(401).json({error: 'token missing'})
  }
  const decodedToken = jwt.verify(req.token, process.env.SECRET)
  if (!decodedToken.id) {
    return res.status(401).json({error: 'token invalid'})
  }
  const user = await User.findById(decodedToken.id)
  
  if (!user) {
    return res.status(404).json({error: 'cannot find user in database'})
   }
   req.user = user
  next()
}

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor
}