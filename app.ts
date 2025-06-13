import express from 'express'
import mongoose, { Error } from 'mongoose'
import cors from 'cors'

import { MONGODB_URI } from './utils/config'
import usersRouter from './controllers/users'
import { requestLogger, tokenExtractor, unknownEndpoint, errorHandler } from './utils/middleware'
import loginRouter from './controllers/login'
import logger from './utils/logger'
import path from 'path'

const app = express()

const mongodbUri = MONGODB_URI as string

mongoose.set('strictQuery', false)
logger.info('connecting to', mongodbUri)
mongoose.connect(mongodbUri)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error: Error) => {
        logger.error('error connecting to MongoDB: ', error.message)
    })

app.use(cors())

app.use(express.json())
app.use(requestLogger)
app.use(tokenExtractor)

app.use(express.static(path.join(__dirname, 'public')))

app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.get('/{*any}', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next()
    }
    if (!req.path.startsWith('/assets') &&
        !req.path.startsWith('/.well-known') &&
        !req.path.startsWith('/vite')
    ) {
        logger.info('Serving SPA for:', req.path)
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use(unknownEndpoint)
app.use(errorHandler)

export default app