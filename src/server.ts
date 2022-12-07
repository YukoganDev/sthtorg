import { prisma } from './accountdb/prisma.server';
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
import Redis from 'ioredis';
import connectRedis from 'connect-redis';
import { AccountResult, checkCredentials, createUser } from './accountdb/user';
import { PrismaClient } from '@prisma/client';
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
import { parseCommand } from './controllers/admin';

// Admin f
async function parseAdminCommandBridge(cmd: any) {
  parseCommand(cmd);
}

//const privateKey = fs.readFileSync('/etc/letsencrypt/live/stht.org/privkey.pem', 'utf8');
//const certificate = fs.readFileSync('/etc/letsencrypt/live/stht.org/cert.pem', 'utf8');
//const ca = fs.readFileSync('/etc/letsencrypt/live/stht.org/chain.pem', 'utf8');

// const credentials = {
// 		key: privateKey,
// 			cert: certificate,
// 				ca: ca
// };

const app: Application = express();
const httpServer: http.Server = http.createServer(app);
//const httpsServer: https.Server = https.createServer(credentials, app);

const io: Server = new Server(httpServer);

interface Socket {
  on: (event: string, callback: (data: any) => void) => void;
  emit: (event: string, data: any) => void;
}

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Db init (postgresql://postgres:yu.ry4507@157.90.241.190:5432/userdb)

const RedisStore = connectRedis(session);
const redis = new Redis();
// const sessionDBaccess = new Pool({
//   user: 'postgres',
//   password: 'yu.ry4507',
//   host: '157.90.241.190',
//   port: 5432,
//   database: 'userdb',
// });

// Initialization
let sessionMiddleware = session({
  name: 'sessionid',
  secret: config.SESSION_SECRET,
  saveUninitialized: true,
  resave: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
  store: new RedisStore({
    client: redis,
    disableTouch: true
  })
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

function validateName(str: string) {
  let regex = /^[A-Za-z0-9-_\s]+$/;
  return regex.test(str) && str.replace(/\s/g, '').length;
}

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// WebSockets
io.on('connect', (socket) => {
  let handshake: any = socket.handshake;
  socket.on('saveCard', async ({ name }) => {
    if (!handshake.session.user) {
      return;
    }

    if (name) {
      if (!validateName(name)) {
        //socket.emit('reloadCards');
        await timeout(2500);
        socket.emit('error', 'Please enter a valid card name');
        socket.emit('reloadCards');
        return;
      }
      console.log(name, handshake.session.user);
      createUserCard(name, handshake.session.user, (err: string, card: any) => {
        if (handleSocketError(socket, err)) {
          return;
        }
        //socket.emit('loadCard', { card });
        socket.emit('reloadCards');
      });
    }
  });
  socket.on('removeCard', async ({ cardId }) => {
    await removeCard(cardId);
    socket.emit('reloadCards');
  });
  socket.on('saveTerm', async ({ cardId, term, definition }) => {
    if (!validateName(term)) {
      socket.emit('error', 'Please enter a valid term');
      return;
    } else if (!validateName(definition)) {
      socket.emit('error', 'Please enter a valid definition');
      return;
    }
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
          setTimeout(() => {
            socket.emit('doneLoadingTerms');
          }, 250);
        }
      }
    );
  });
  socket.on('removeTerm', async ({ cardId, termId }) => {
    removeCardTerm(cardId, termId, (err: string) => {
      if (handleSocketError(socket, err)) {
        return;
      }
    });
  });
  socket.on('starTerm', ({ id }) => {
    starTerm(id);
  });
  socket.on('unstarTerm', async ({ id }) => {
    unstarTerm(id);
  });
  socket.on('updateTerm', async ({ cardId, termId, term, definition }) => {
    updateTerm(cardId, termId, term, definition, (err: string) => {
      if (handleSocketError(socket, err)) {
        return;
      }
    });
  });
  socket.on('renameCard', async ({ cardId, name }) => {
    if (!validateName(name)) {
      await timeout(2500);
      socket.emit('error', 'Please enter a valid card name');
      socket.emit('reloadCards');
      return;
    }
    updateCard(cardId, name, (err: string) => {
      if (handleSocketError(socket, err)) {
        return;
      }
      socket.emit('reloadCards');
    });
  });
  socket.on('requestTerms', async ({ cardId }) => {
    if (typeof cardId !== 'number') {
      console.log(cardId, 'is not a number (socket overload?)');
      return;
    }
    getCardTerms(cardId, (err: string, terms: any) => {
      if (handleSocketError(socket, err)) {
        return;
      }
      let delay = 25;
      let i = 0;
      console.log('- - - - terms - - - -');
      console.log(terms);
      console.log('- - - - - - - - - - -');
      // setTimeout(() => {
      let a = setInterval(() => {
        console.log(i + 1);

        if (i++ >= terms.length) {
          socket.emit('doneLoadingTerms');
          clearInterval(a);
          return;
        }
        let term = terms[i - 1];
        socket.emit('loadTerm', { term, percentage: i / terms.length * 100 });
      }, delay);
      // }, 500);

      // for (let term of terms) {
      //   socket.emit('loadTerm', { term });
      // }
    });
  });
  socket.on('adminCommand', async (cmd) => {
    if (handshake.session.user && handshake.session.user === 'Yukogan') {
      try {
        parseAdminCommandBridge(cmd);
        //eval(cmd);
      } catch (e) {
        socket.emit(
          'adminCommandResponse',
          'Got an error:<br>`<br><code style="color: red;">' +
            e +
            '</code><br>`'
        );
        return;
      }
      socket.emit(
        'adminCommandResponse',
        'Success, ' + Math.random().toString().replace('0.', '')
      );
      return;
    }
    socket.emit('adminCommandResponse', 'No permission');
  });
  console.log(
    `${socket.id} (user account: '${handshake.session.user}') connected`
  );
  socket.on('requestCards', () => {
    if (handshake.session.user) {
      let name = handshake.session.user;
      console.log('Sending cards to ' + name);
      getUserCards(name, (err: string, cards: any) => {
        console.log(err);
        let i = 0;
        let delay = 25;
        console.log('- - - - cards - - - -');
        console.log(cards);
        console.log('- - - - - - - - - - -');
        let a = setInterval(() => {
          console.log(i + 1);

          if (i++ >= cards.length) {
            socket.emit('doneLoadingCards');
            clearInterval(a);
            return;
          }
          let card = cards[i - 1];
          socket.emit('loadCard', { card, percentage: i / cards.length * 100 });
        }, delay);
      });
    }
  });
});

// type PktArrayParams = {
//   i: number,
//   max: number,
//   pkt: any,
//   socket: any,
//   delay: number
// }
// function sendPktArray({ i, max, pkt, socket, delay }: PktArrayParams) {
//   socket.emit(pkt.name, pkt.array);
//   if (i++ < pkt.array) {
//     sendPktArray({ i, max, pkt, socket, delay });
//   }
// }

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

// httpsServer.listen(443, () => {
// 	console.log('Also started https server');
// });
