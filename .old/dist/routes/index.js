"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const login_1 = require("./login");
exports.router = (0, express_1.Router)();
exports.router.get("/", login_1.checkLogin, (req, res, next) => {
    res.render("index", { user: null });
});
