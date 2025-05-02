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
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const middleware_1 = require("../utils/middleware");
const user_1 = __importDefault(require("../models/user"));
const loginRouter = (0, express_1.Router)();
loginRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield user_1.default.findOne({ username });
    if (!user) {
        res.status(401).json({ error: 'invalid username' });
        return;
    }
    const passwordCorrect = yield bcrypt_1.default.compare(password, user.passwordHash);
    if (!passwordCorrect) {
        res.status(401).json({ error: 'invalid password' });
        return;
    }
    const userForToken = {
        username: user.username,
        id: user._id
    };
    const token = jsonwebtoken_1.default.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 });
    res.status(200).send({ token, username: user.username });
}));
loginRouter.post('/validate', middleware_1.userExtractor, (req, res) => {
    res.status(200).json({ valid: true, user: req.user });
});
exports.default = loginRouter;
