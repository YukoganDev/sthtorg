import createError from "http-errors";
import express from "express";
import { Application, Request, Response, NextFunction } from "express";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import { config } from "./config";

import { router as indexRouter } from "./routes/index";
import { router as learnRouter } from "./routes/learn";
//import { router as loginRouter } from "./routes/login";
import { router as logoutRouter } from "./routes/logout";
import session from "express-session";
import { createUser } from "./accountdb/user";
import { User } from "@prisma/client";

const app: Application = express();
const server: http.Server = http.createServer(app);
const io: Server = new Server(server);

interface Socket {
    on: (event: string, callback: (data: any) => void) => void;
    emit: (event: string, data: any) => void;
}

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Initialization
app.use(session({
  secret: config.SESSION_SECRET,
  saveUninitialized: true,
  resave: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routers
app.use("/", indexRouter);
app.use("/learn", learnRouter);
//app.use("/login", loginRouter);
app.use("/logout", logoutRouter);

// WebSockets
io.on('connect', (socket) => {
    console.log(socket.id + ' connected');
});

// Error handling
app.use((req: Request, res: Response, next: NextFunction) => {
  next(createError(404));
});
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  user: User, 
  let status = err.status || 500;
  res.status(status);
  console.log(err);
  
  res.send("Error: " + status);
});

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

createUser('bo3b233', 'bo32b33@gmail.com', 'hello123', (result: typeof AccountResult, user: User) => {
  console.log(result, user);
});