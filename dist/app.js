"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./utils/config");
const users_1 = __importDefault(require("./controllers/users"));
const middleware_1 = require("./utils/middleware");
const login_1 = __importDefault(require("./controllers/login"));
const logger_1 = __importDefault(require("./utils/logger"));
const app = (0, express_1.default)();
const mongodbUri = config_1.MONGODB_URI;
mongoose_1.default.set('strictQuery', false);
logger_1.default.info('connecting to', mongodbUri);
mongoose_1.default.connect(mongodbUri)
    .then(() => {
    logger_1.default.info('connected to MongoDB');
})
    .catch((error) => {
    logger_1.default.error('error connecting to MongoDB: ', error.message);
});
app.use((0, cors_1.default)());
app.use(express_1.default.static('build'));
app.use(express_1.default.json());
app.use(middleware_1.requestLogger);
app.use(middleware_1.tokenExtractor);
app.use('/api/users', users_1.default);
app.use('/api/login', login_1.default);
app.use(middleware_1.unknownEndpoint);
app.use(middleware_1.errorHandler);
exports.default = app;
