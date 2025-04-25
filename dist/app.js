"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const config = require('./utils/config');
const app = (0, express_1.default)();
const cors = require('cors');
const usersRouter = require('./controllers/users');
const middleware = require('./utils/middleware');
const loginRouter = require('./controllers/login');
const logger = require('./utils/logger');
mongoose_1.default.set('strictQuery', false);
logger.info('connecting to', config.MONGODB_URI);
mongoose_1.default.connect(config.MONGODB_URI)
    .then(() => {
    logger.info('connected to MongoDB');
})
    .catch((error) => {
    logger.error('error connecting to MongoDB: ', error.message);
});
app.use(cors());
app.use(express_1.default.static('build'));
app.use(express_1.default.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);
module.exports = app;
