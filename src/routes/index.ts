import { prisma } from './../accountdb/prisma.server';
import { User } from '@prisma/client';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Router, Request, Response, NextFunction, request } from 'express';
import requestPromise from 'request-promise';
import { AccountResult, checkCredentials } from '../accountdb/user';
import { config } from '../config';

export const router = Router();

let routerViewPrefix = '';

// Index
router.get('/', (req, res, next) => {
  let disabled = 'disabled';
  let dmsg = '(Insufficient permissions)';
  if (req.session.user && req.session.user === 'Yukogan') {
    disabled = '';
    dmsg = '';
  }
  res.render(`${routerViewPrefix}index`, {
    user: req.session.user || null,
    disabled,
    dmsg,
    random: config.VERSION,
  });
});

// Learn
router.get('/learn', checkLogin, (req, res, next) => {
  res.render(`${routerViewPrefix}learn`, { user: req.session.user || null, readonly: 0, cardid: req.params.cardId || null, version: config.VERSION, random: config.VERSION, });
});

router.get('/learn/readonly/:cardId', (req, res, next) => {
  res.render(`${routerViewPrefix}learn`, {
    user: req.session.user || null,
    cardid: req.params.cardId || null,
    readonly: 1,
    version: config.VERSION,
    random: config.VERSION,
  });
});

// Login
router.get('/login', (req, res, next) => {
  checkLogin(req, res, () => {
    res.redirect('/');
  });
});

router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  let email = req.body.email || '';
  let password = req.body.password || '';
  console.log(email, password);
  checkCredentials({ email, password }, (result: AccountResult, user: User) => {
    if (result === AccountResult.SUCCESS) {
      req.session.user = user.name;
      res.redirect('back');
      return;
    } else if (result === AccountResult.ERROR) {
      res.render(`${routerViewPrefix}login`, { msg: 'Invalid credentials', random: config.VERSION, });
      return;
    } else if (result === AccountResult.UNKNOWN_USER) {
      res.render(`${routerViewPrefix}login`, {
        msg: `Unknown email: ${email}`,
        random: config.VERSION,
      });
    } else {
      res.redirect('login');
    }
  });
});

export function checkLogin(req: Request, res: Response, next: NextFunction) {
  if (req.session && req.session.user) {
    next();
  } else {
    //res.redirect('login?next=' + req.params.next);
    res.render(`${routerViewPrefix}login`, {
      msg: 'You need to be authenticated in order to access this',
      random: config.VERSION,
    });
  }
}

declare module 'express-session' {
  interface SessionData {
    user: string;
  }
}

// Logout
router.get('/logout', (req: Request, res: Response, next: NextFunction) => {
  req.session.user = undefined;
  res.redirect('/');
});

// Account
router.get('/account', checkLogin, async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    res.render(`${routerViewPrefix}login`, {
      msg: 'There was an error gathering your account information. Please try to login again.',
      random: config.VERSION,
    });
    return;
  }
  let user = await prisma.user.findUnique({
    where: {
          name: req.session.user,
    }
  });
  if (!user) {
    res.render(`${routerViewPrefix}login`, {
      msg: 'There was an error gathering your account information. Please try to login again.',
      random: config.VERSION,
    });
    return;
  }
  //console.log(user);
  let type = 'User';
  if (user.name === 'Yukogan') {
    type = 'Admin';
  }
  
  res.render(`${routerViewPrefix}account`, {
    user: req.session.user || null,
    pass: getHiddenPassword(user.password),
    email: user.email,
    random: config.VERSION,
    userType: type,
    p_Scale: user.scale,
    p_Theme: user.theme,
    p_Loading: user.loading
  });
});

function getHiddenPassword(password: string) {
  let hiddenPassword = '';
  for (let i = 0; i < password.length; i++) {
    hiddenPassword += '.';
  }
  return hiddenPassword;
}

// Card
router.get('/card/:cardId', (req, res, next) => {
  res.render(`${routerViewPrefix}card`, {
    user: req.session.user || null,
    cardid: req.params.cardId || null,
    random: config.VERSION,
  });
});

// Admin
router.get('/admin', checkLogin, (req, res, next) => {
  if (req.session.user && req.session.user === 'Yukogan') {
    res.render('admin', { random: config.VERSION, });
  } else {
    res.json({
      error: 'No permission',
    });
  }
});
