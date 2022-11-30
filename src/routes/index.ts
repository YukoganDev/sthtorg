import { User } from "@prisma/client";
import { Router, Request, Response, NextFunction } from "express";
import { AccountResult, checkCredentials } from "../accountdb/user";

export const router = Router();

// Index
router.get("/", (req, res, next) => {
    res.render("index", { user: req.session.user || null });
});

// Learn
router.get("/learn", checkLogin, (req, res, next) => {
    res.render("learn", { user: req.session.user || null });
});

// Login
router.get("/login", (req, res, next) => {
    res.render("login", { msg: null });
});

router.post("/login", (req: Request, res: Response, next: NextFunction) => {
    let email = req.body.email || '';
    let password = req.body.password || '';
    console.log(email, password);
    checkCredentials({ email, password }, (result: AccountResult, user: User) => {
        if (result === AccountResult.SUCCESS) {
            req.session.user = user.name;
            res.redirect('back');
            return;
        } else if (result === AccountResult.ERROR) {
            res.render('login', { msg: 'Invalid credentials' });
            return;
        } else if (result === AccountResult.UNKNOWN_USER) {
            res.render('login', { msg: `Unknown email: ${email}` });
        } else {
            res.redirect("login");
        }
    });
});

export function checkLogin(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.user) {
        next();
    } else {
        //res.redirect('login?next=' + req.params.next);
        res.render('login', { msg: 'You need to be authenticated in order to access this' });
    }
}

declare module 'express-session' {
    interface SessionData {
        user: string
    }
}

// Logout
router.get("/logout", (req: Request, res: Response, next: NextFunction) => {
    req.session.user = undefined;
    res.redirect('/');
});

// Card
router.get("/card/:cardId", (req, res, next) => {
    res.render("card", { user: req.session.user || null, cardId: req.params.cardId || null });
});