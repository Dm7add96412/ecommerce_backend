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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userExtractor = exports.tokenExtractor = exports.errorHandler = exports.unknownEndpoint = exports.requestLogger = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("./logger"));
const user_1 = __importDefault(require("../models/user"));
const requestLogger = (req, res, next) => {
    logger_1.default.info('Method:', req.method);
    logger_1.default.info('Path:  ', req.path);
    logger_1.default.info('Body:  ', req.body);
    logger_1.default.info('---');
    next();
};
exports.requestLogger = requestLogger;
const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};
exports.unknownEndpoint = unknownEndpoint;
const errorHandler = (error, req, res, next) => {
    logger_1.default.error(error.message, ',', error.name);
    if (error.name === 'CastError') {
        res.status(400).send({ error: 'malformatted id' });
    }
    else if (error.name === 'ValidationError') {
        res.status(400).json({ error: error.message });
    }
    else if (error.name === 'MongoServerError' && error.message.includes('E11000 duplicate key error')) {
        res.status(400).json({ error: 'expected `username` to be unique' });
    }
    else if (error.name === 'JsonWebTokenError') {
        res.status(401).json({ error: 'token missing or invalid' });
    }
    else if (error.name === 'TokenExpiredError') {
        res.status(401).json({ error: 'token expired' });
    }
    next(error);
};
exports.errorHandler = errorHandler;
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
exports.tokenExtractor = tokenExtractor;
const userExtractor = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.token;
    if (!token) {
        res.status(401).json({ error: 'token missing' });
        return;
    }
    const decodedToken = jsonwebtoken_1.default.verify(token, process.env.SECRET);
    if (!decodedToken.id) {
        res.status(401).json({ error: 'token invalid' });
        return;
    }
    const user = yield user_1.default.findById(decodedToken.id);
    if (!user) {
        res.status(404).json({ error: 'cannot find user in database' });
        return;
    }
    req.user = user;
    next();
});
exports.userExtractor = userExtractor;
