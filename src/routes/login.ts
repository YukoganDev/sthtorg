import { Router, Request, Response, NextFunction } from "express";

export const router = Router();

router.get("/", (req, res, next) => {
    res.render("login", { user: null });
});

router.post("/", (req, res, next) => {
    
    res.redirect("index");
});