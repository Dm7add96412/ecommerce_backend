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
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = __importDefault(require("../models/user"));
const middleware_1 = require("../utils/middleware");
const usersRouter = (0, express_1.Router)();
usersRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_1.default.find({});
    res.json(users);
}));
usersRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_1.default.findById(req.params.id);
    if (user) {
        res.json(user);
    }
    else {
        res.status(404).end();
    }
}));
usersRouter.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!password) {
        res.status(400).json({ error: 'password is required' });
        return;
    }
    if (password.length < 3) {
        res.status(400).json({ error: 'password minimum length 3 letters' });
        return;
    }
    const saltRounds = 10;
    const passwordHash = yield bcrypt_1.default.hash(password, saltRounds);
    const user = new user_1.default({
        username,
        passwordHash,
    });
    const savedUser = yield user.save();
    res.status(201).json(savedUser);
}));
usersRouter.delete('/', middleware_1.userExtractor, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user) {
        res.status(404).json({ error: 'Unauthorized: user not found' });
        return;
    }
    const deletedUser = yield user_1.default.findByIdAndDelete(user.id.toString());
    console.log(deletedUser);
    res.status(204).end();
}));
usersRouter.put('/', middleware_1.userExtractor, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const body = req.body;
    if (!user) {
        res.status(404).json({ error: 'Unauthorized: user not found' });
        return;
    }
    const cartItem = {
        productId: body.productId,
        title: body.title,
        price: body.price,
        images: body.images,
        quantity: body.quantity
    };
    const foundItem = user.cart.find(item => item.productId === cartItem.productId);
    if (foundItem) {
        if (cartItem.quantity <= 0) {
            user.cart = user.cart.filter(item => item.productId !== cartItem.productId);
        }
        else {
            foundItem.quantity = cartItem.quantity;
        }
    }
    else {
        if (cartItem.quantity > 0) {
            user.cart.push(cartItem);
        }
        else {
            res.status(404).json({ error: 'cannot add quantity 0 into cart' });
            return;
        }
    }
    const savedUser = yield user.save();
    const updatedCartItem = savedUser.cart.find(item => item.productId === cartItem.productId);
    if (!updatedCartItem) {
        res.status(204).end();
        return;
    }
    res.status(201).json(updatedCartItem);
}));
exports.default = usersRouter;
