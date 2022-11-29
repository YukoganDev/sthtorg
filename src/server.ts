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
import { router as loginRouter } from "./routes/login";
import { router as logoutRouter } from "./routes/logout";
import session, { Session } from "express-session";
import { AccountResult, checkCredentials, createUser } from "./accountdb/user";
import { User } from "@prisma/client";
import { Handshake } from "socket.io/dist/socket";
import { createUserCard, getUserCards, getCardTerms, createTerm, removeCardTerm } from "./accountdb/cardManagement";

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
let sessionMiddleware = session({
  secret: config.SESSION_SECRET,
  saveUninitialized: true,
  resave: true,
});
app.use(sessionMiddleware);
let emptyObj: any = {};
io.use(function(socket: any, next: any) {
  sessionMiddleware(socket.handshake, emptyObj, next);
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routers
app.use("/", indexRouter);
app.use("/learn", learnRouter);
app.use("/login", loginRouter);
app.use("/logout", logoutRouter);

// WebSockets
io.on('connect', (socket) => {
  let handshake: any = socket.handshake;
  socket.on('saveCard', ({ name }) => {
    if (!handshake.session.user) { return; }
    if (name) {
      console.log(name, handshake.session.user);
      
      createUserCard(name, handshake.session.user, (err: string, card: any) => {
        if (err) {
          console.error(err);
          socket.emit('error', err);
        }
        socket.emit('loadCard', { card });
      });
    }
  });
  socket.on('saveTerm', ({ cardId, term, definition }) => {
    console.log(cardId, term, definition);
    createTerm(term, definition, handshake.session.user, cardId, (err: string, term: any) => {
      if (err) {
        console.error(err);
        socket.emit('error', err);
      }
      if (term) {
        socket.emit('loadTerm', { term });
      }
    });
  });
  socket.on('removeTerm', ({ cardId, term, definition }) => {
    removeCardTerm(cardId, term, definition, (err: string) => {
      if (err) {
        console.error(err);
        socket.emit('error', err);
      }
    });
  });
  socket.on('requestTerms', ({ cardId }) => {
    if (typeof cardId !== 'number') {
      console.log(cardId, 'is not a number (socket overload?)');
      
      return;
    }
    
    getCardTerms(cardId, (err: string, terms: any) => {
      if (err) {
        console.error(err);
        socket.emit('error', err);
      }
      
      for (let term of terms) {
        socket.emit('loadTerm', { term });
      }
    });
  });
  console.log(`${socket.id} (user account: '${handshake.session.user}') connected`);
  if (handshake.session.user) {
    let name = handshake.session.user;
    console.log('Sending cards to ' + name);
    
    getUserCards(name, (err: string, cards: any) => {
      console.log(err);
      for (let card of cards) {
        console.log(card);
        
        socket.emit('loadCard', { card });
      }
    });
  }
});

// Error handling
app.use((req: Request, res: Response, next: NextFunction) => {
  //next(createError(404));
});
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  let status = err.status || 500;
  res.status(status);
  console.log(err);
  
  res.send("Error: " + status);
});

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});