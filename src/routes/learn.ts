import { Router, Request, Response, NextFunction } from "express";
import { checkLogin } from "./login";

export const router = Router();

router.get("/", checkLogin, (req, res, next) => {
    res.render("learn", { user: req.session.user || null });
});