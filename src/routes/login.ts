import { Session } from 'express-session';
import { Handshake } from 'socket.io/dist/socket';
import { User } from '@prisma/client';
import { AccountResult } from './../accountdb/user';
import { Router, Request, Response, NextFunction } from "express";
import { checkCredentials } from "../accountdb/user";
import { SessionData } from 'express-session';

export const router = Router();

router.get("/", (req, res, next) => {
    res.render("login", { msg: null });
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
    let email = req.body.email || '';
    let password = req.body.password || '';
    console.log(email, password);
    checkCredentials({ email, password }, (result: AccountResult, user: User) => {
        if (result === AccountResult.SUCCESS) {
            req.session.user = user.name;
            console.log(req);
            res.redirect('/')
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

