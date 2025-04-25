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
const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');
usersRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield User.find({});
    res.json(users);
}));
usersRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!password) {
        return res.status(400).json({ error: 'password is required' });
    }
    if (password.length < 3) {
        return res.status(400).json({ error: 'password minimum length 3 letters' });
    }
    const saltRounds = 10;
    const passwordHash = yield bcrypt.hash(password, saltRounds);
    const user = new User({
        username,
        passwordHash,
    });
    const savedUser = yield user.save();
    res.status(201).json(savedUser);
}));
module.exports = usersRouter;
