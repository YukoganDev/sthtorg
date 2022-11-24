"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLogin = exports.router = void 0;
const user_1 = require("./../accountdb/user");
const express_1 = require("express");
const user_2 = require("../accountdb/user");
exports.router = (0, express_1.Router)();
exports.router.get("/", (req, res, next) => {
    res.render("login", { user: null });
});
exports.router.post("/", async (req, res, next) => {
    let email = req.body.email;
    let passowrd = req.body.password;
    (0, user_2.checkCredentials)('', passowrd, email, (result, user) => {
        if (result === user_1.AccountResult.SUCCESS) {
            req.session.user = user.name;
            res.redirect('index');
        }
        if (result === user_1.AccountResult.ERROR) {
            res.render('login', { msg: 'Invalid credentials' });
        }
    });
    res.redirect("login");
});
function checkLogin(req, res, next) {
    if (req.session.user) {
        next();
    }
    else {
        res.redirect('login');
    }
}
exports.checkLogin = checkLogin;
