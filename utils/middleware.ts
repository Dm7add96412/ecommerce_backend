import { NextFunction, Request, Response } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

import logger from './logger'
import User from '../models/user'
import { TokenRequest } from '../types/TokenRequest'

const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (
    req.path.startsWith('/assets') ||
    req.path.startsWith('/.well-known')
  ) {
    return next()
  }
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
    res.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    res.status(400).json({ error: error.message })
  } else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
    res.status(400).json({ error: 'expected `username` to be unique' })
  } else if (error.name ===  'JsonWebTokenError') {
    res.status(401).json({ error: 'token missing or invalid' })
  } else if (error.name === 'TokenExpiredError') {
    res.status(401).json({ error: 'token expired' })
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
    res.status(401).json({error: 'token missing'})
    return
  }
  const decodedToken: JwtPayload = jwt.verify(token, process.env.SECRET!) as JwtPayload
  if (!decodedToken.id) {
    res.status(401).json({error: 'token invalid'})
    return
  }
  const user = await User.findById(decodedToken.id)
  
  if (!user) {
    res.status(404).json({error: 'cannot find user in database'})
    return
  }
  req.user = user
  next()
}

export {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
}