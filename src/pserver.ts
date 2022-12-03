import createError from 'http-errors';
import express, { text } from 'express';
import { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import http from 'http';
import https from 'node:https';
import fs from 'node:fs';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';

import { config } from './config';

import { router as indexRouter } from './routes/index';
// import { router as learnRouter } from "./routes/learn";
// import { router as loginRouter } from "./routes/login";
// import { router as logoutRouter } from "./routes/logout";
// import { router as cardRouter } from "./routes/card";
import session, { Session } from 'express-session';
import { AccountResult, checkCredentials, createUser } from './accountdb/user';
import { User } from '@prisma/client';
import { Handshake } from 'socket.io/dist/socket';
import {
  createUserCard,
  getUserCards,
  getCardTerms,
  createTerm,
  removeCardTerm,
  updateTerm,
  removeCard,
  updateCard,
  starTerm,
  unstarTerm,
} from './accountdb/cardManagement';

const privateKey = fs.readFileSync(
  '/etc/letsencrypt/live/stht.org/privkey.pem',
  'utf8'
);
const certificate = fs.readFileSync(
  '/etc/letsencrypt/live/stht.org/cert.pem',
  'utf8'
);
const ca = fs.readFileSync('/etc/letsencrypt/live/stht.org/chain.pem', 'utf8');

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

const app: Application = express();
const httpServer: http.Server = http.createServer(app);
const httpsServer: https.Server = https.createServer(credentials, app);

const io: Server = new Server(httpsServer);

interface Socket {
  on: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
}

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Initialization
let sessionMiddleware = session({
  secret: config.SESSION_SECRET,
  saveUninitialized: true,
  resave: true,
});
app.use(sessionMiddleware);
let emptyObj: any = {};
io.use(function (socket: any, next: any) {
  sessionMiddleware(socket.handshake, emptyObj, next);
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routers
app.use('/', indexRouter);
// app.use("/learn", learnRouter);
// app.use("/login", loginRouter);
// app.use("/logout", logoutRouter);
// app.use("/card", cardRouter);
function handleSocketError(socket: any, err: string) {
  if (err) {
    console.error(err);
    socket.emit('error', err);
    return true;
  }
  return false;
}

// WebSockets
io.on('connect', (socket) => {
  let handshake: any = socket.handshake;
  socket.on('saveCard', ({ name }) => {
    if (!handshake.session.user) {
      return;
    }
    if (name) {
      console.log(name, handshake.session.user);
      createUserCard(name, handshake.session.user, (err: string, card: any) => {
        if (handleSocketError(socket, err)) {
          return;
        }
        socket.emit('loadCard', { card });
      });
    }
  });
  socket.on('removeCard', ({ cardId }) => {
    removeCard(cardId);
    socket.emit('reloadCards');
  });
  socket.on('saveTerm', ({ cardId, term, definition }) => {
    console.log(cardId, term, definition);
    createTerm(
      term,
      definition,
      handshake.session.user,
      cardId,
      (err: string, term: any) => {
        if (handleSocketError(socket, err)) {
          return;
        }
        if (term) {
          socket.emit('loadTerm', { term });
        }
      }
    );
  });
  socket.on('removeTerm', ({ cardId, termId }) => {
    removeCardTerm(cardId, termId, (err: string) => {
      if (handleSocketError(socket, err)) {
        return;
      }
    });
  });
  socket.on('starTerm', ({ id }) => {
    starTerm(id);
  });
  socket.on('unstarTerm', ({ id }) => {
    unstarTerm(id);
  });
  socket.on('updateTerm', ({ cardId, termId, term, definition }) => {
    updateTerm(cardId, termId, term, definition, (err: string) => {
      if (handleSocketError(socket, err)) {
        return;
      }
    });
  });
  socket.on('renameCard', ({ cardId, name }) => {
    updateCard(cardId, name, (err: string) => {
      if (handleSocketError(socket, err)) {
        return;
      }
      socket.emit('reloadCards');
    });
  });
  socket.on('requestTerms', ({ cardId }) => {
    if (typeof cardId !== 'number') {
      console.log(cardId, 'is not a number (socket overload?)');
      return;
    }
    getCardTerms(cardId, (err: string, terms: any) => {
      if (handleSocketError(socket, err)) {
        return;
      }
      for (let term of terms) {
        socket.emit('loadTerm', { term });
      }
    });
  });
  console.log(
    `${socket.id} (user account: '${handshake.session.user}') connected`
  );
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
  next(createError(404));
});
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  let status = err.status || 500;
  res.status(status);
  console.log(err);

  res.send('Error: ' + status);
});

httpServer.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});

httpsServer.listen(443, () => {
  console.log('Also started https server');
});
