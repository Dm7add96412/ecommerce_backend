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
const bcrypt = require('bcrypt');
const loginRouter = require('express').Router();
const middleware = require('../utils/middleware');
const User = require('../models/user');
loginRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield User.findOne({ username });
    if (!user) {
        return res.status(401).json({
            error: 'invalid username'
        });
    }
    const passwordCorrect = yield bcrypt.compare(password, user.passwordHash);
    if (!passwordCorrect) {
        return res.status(401).json({
            error: 'invalid password'
        });
    }
    const userForToken = {
        username: user.username,
        id: user._id
    };
    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 });
    res.status(200).send({ token, username: user.username });
}));
loginRouter.post('/validate', middleware.userExtractor, (req, res) => {
    res.status(200).json({ valid: true, user: req.user });
});
module.exports = loginRouter;
