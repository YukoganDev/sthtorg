// import { AccountResult } from './../accountdb/user';
// import { Router, Request, Response, NextFunction } from "express";
// import { checkCredentials } from "../accountdb/user";
// import { SessionData } from 'express-session';

// export const router = Router();

// router.get("/", (req, res, next) => {
//     res.render("login", { msg: null });
// });

// router.post("/", (req: Request, res: Response, next: NextFunction) => {
//     let email = req.body.email || '';
//     let password = req.body.password || '';
//     console.log(email, password);
    
//     checkCredentials('', password, email, (result, user) => {
//         if (result === AccountResult.SUCCESS) {
//             req.session.user = user.name;
//             console.log(req);
//             res.redirect('/')
//             return;
//         } else if (result === AccountResult.ERROR) {
//             res.render('login', { msg: 'Invalid credentials' });
//             return;
//         } else {
//             res.redirect("login");
//         }
//     });
// });

// export function checkLogin(req: Request, res: Response, next: NextFunction) {
//     //next();
//     if (req.session.user) {
//         next();
//     } else {
//         res.redirect('login?next=' + req.params);
//     }
// }

// declare module 'express-session' {
//     interface SessionData {
//         user: string
//     }
// }