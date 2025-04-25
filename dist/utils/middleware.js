"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require('jsonwebtoken');
const logger = require('./logger');
const User = require('../models/user');
const requestLogger = (req, res, next) => {
    logger.info('Method:', req.method);
    logger.info('Path:  ', req.path);
    logger.info('Body:  ', req.body);
    logger.info('---');
    next();
};
const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};
const errorHandler = (error, req, res, next) => {
    logger.error(error.message, ',', error.name);
    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' });
    }
    else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message });
    }
    else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        return res.status(400).json({ error: 'expected `username` to be unique' });
    }
    else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ error: 'token missing or invalid' });
    }
    else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'token expired' });
    }
    next(error);
};
const tokenExtractor = (req, res, next) => {
    const authorization = req.get('authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
        req.token = authorization.replace('Bearer ', '');
    }
    else {
        req.token = null;
    }
    next();
};
const userExtractor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.token;
    if (!token) {
        return res.status(401).json({ error: 'token missing' });
    }
    const decodedToken = jwt.verify(req.token, process.env.SECRET);
    if (!decodedToken.id) {
        return res.status(401).json({ error: 'token invalid' });
    }
    const user = yield User.findById(decodedToken.id);
    if (!user) {
        return res.status(404).json({ error: 'cannot find user in database' });
    }
    req.user = user;
    next();
});
module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler,
    tokenExtractor,
    userExtractor
};
