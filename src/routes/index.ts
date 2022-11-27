import { Router, Request, Response, NextFunction } from "express";
import { checkLogin } from "./login";

export const router = Router();

router.get("/", (req, res, next) => {
    res.render("index", { user: req.session.user || null });
});