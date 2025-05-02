"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MONGODB_URI = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = process.env.PORT || 8080;
exports.PORT = PORT;
const MONGODB_URI = process.env.MONGODB_URI;
exports.MONGODB_URI = MONGODB_URI;
