import { Router, Request, Response, NextFunction } from "express";

export const router = Router();

router.get("/", (req, res, next) => {
    res.render("index", { user: null });
});